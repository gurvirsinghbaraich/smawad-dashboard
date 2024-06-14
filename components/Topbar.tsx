"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSetSearchValue } from "@/providers/DashboardProvider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyboardEvent, useState } from "react";
import { IoNotificationsOutline, IoSearch } from "react-icons/io5";
import { MdSettings } from "react-icons/md";

export default function Topbar() {
  const [search, setSearch] = useState<string>("");
  const setSearchValue = useSetSearchValue();
  const pathname = usePathname();

  const onSearchValueChange = (event: KeyboardEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };

  const logout = () => {
    if (typeof window != "undefined") {
      window.location.href = "/api/logout";
    }
  };

  console.log(pathname);

  return (
    <>
      <div className="flex w-full justify-between p-8 pb-5">
        <div className="relative">
          <div
            className={cn(
              !(
                pathname.endsWith("organizations") ||
                pathname.endsWith("branches") ||
                pathname.endsWith("users")
              ) && "hidden",
            )}
          >
            <div
              onClick={() => setSearchValue(search)}
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >
              <IoSearch size={16} />
            </div>

            <input
              type="text"
              name="search"
              onKeyUp={onSearchValueChange}
              className="w-[554px] rounded-full border p-3 px-6 pr-12"
              placeholder="Search organization, users etc"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="border-topbarActionStrokeColor grid size-[32px] place-items-center rounded-md border">
            <MdSettings size={16} />
          </div>

          <div className="border-topbarActionStrokeColor grid size-[32px] place-items-center rounded-md border">
            <IoNotificationsOutline size={16} />
          </div>

          <div className="grid size-[32px] place-items-center rounded-md">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Image
                  src={"/images/user.webp"}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link href={"/dashboard/profile"}>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <hr />
    </>
  );
}
