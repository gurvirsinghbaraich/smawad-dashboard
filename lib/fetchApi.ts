import { setCookie } from "cookies-next";
import setCookieParser from "set-cookie-parser";

import z from "zod";

export async function fetchApi<TResponse>(
  path: string,
  init: RequestInit = {},
  data?: object,
): Promise<TResponse | any> {
  try {
    const baseApiUrl = z
      .string()
      .url()
      .parse(process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL);

    const requestUrl = `${baseApiUrl}${path}`;
    console.log(requestUrl);

    let initConfiguration: RequestInit = {
      cache: "no-cache",
      credentials: "include",
    };

    if (data) {
      initConfiguration.method = "POST";

      initConfiguration.headers = {
        ...initConfiguration.headers,
        "Content-Type": "application/json",
      };

      initConfiguration.body = JSON.stringify(data);
    }

    const request = await fetch(requestUrl, {
      ...initConfiguration,
      ...init,
    });

    // Breaking down the cookie into smaller pieces;
    const serverCookie = setCookieParser.parse(request.headers.getSetCookie());

    // Setting the cookie on users browser client.
    if (serverCookie?.[0] !== undefined) {
      const { name, value, ...authCookie } = { ...serverCookie[0] };
      setCookie(name, value, {
        maxAge: authCookie.maxAge,
        domain:
          process.env.NODE_ENV === "production"
            ? authCookie.domain
            : "localhost",
        expires: authCookie.expires,
        httpOnly: authCookie.httpOnly,
      });
    }

    return (await request.json()) as TResponse;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(
        "Error: NEXT_PUBLIC_BACKEND_SERVER_BASE_URL property missing in the env file.",
      );
    }

    console.log(error.message);
    return undefined;
  }
}
