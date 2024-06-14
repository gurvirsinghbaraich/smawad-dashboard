export function handleError<
  TFunction extends (...args: any[]) => any,
  TError = any,
>(root: TFunction, callback?: (error: TError) => void) {
  return async (...props: Parameters<TFunction>) => {
    try {
      return (await root(...props)) as ReturnType<TFunction>;
    } catch (error) {
      callback?.(error as TError);
    }
  };
}
