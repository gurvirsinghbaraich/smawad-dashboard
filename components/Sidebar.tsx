"use client";
import { cn } from "@/lib/utils";
import { TableIcon, Users2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaGlobeAsia } from "react-icons/fa";
import { FaTreeCity } from "react-icons/fa6";
import { GoGitBranch, GoOrganization } from "react-icons/go";
import { GrStatusUnknown } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { TbBuildingEstate } from "react-icons/tb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
    >
      <mask
        id="mask0_2272_4485"
        style={{ maskType: "alpha" }}
        width="16"
        height="16"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
      >
        <path fill="#231F20" d="M0 0H16V16H0z"></path>
      </mask>
      <g mask="url(#mask0_2272_4485)">
        <path
          fill="#231F20"
          d="M11 10.667V5.333L8.333 8 11 10.667zM3.333 14c-.366 0-.68-.13-.941-.392A1.284 1.284 0 012 12.667V3.333c0-.366.13-.68.392-.941.26-.261.575-.392.941-.392h9.334c.366 0 .68.13.941.392.261.26.392.575.392.941v9.334c0 .366-.13.68-.392.941a1.284 1.284 0 01-.941.392H3.333zm2-1.333V3.333h-2v9.334h2zm1.334 0h6V3.333h-6v9.334z"
        ></path>
      </g>
    </svg>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "w-full bg-smawad-secondary px-8 text-white",
        collapsed && "max-w-24 px-4",
      )}
    >
      <div className="relative w-full">
        <div
          className={cn(
            "absolute -right-11 top-[5.65rem] cursor-pointer rounded-full bg-smawad-accent p-1",
            collapsed && "-right-7",
          )}
          onClick={() => setCollapsed((a) => !a)}
        >
          <Icon />
        </div>

        <div
          className={cn(
            "mb-[73px] pt-[41px] text-center text-2xl font-bold text-smawad-accent",
            collapsed && "text-[7px]",
          )}
        >
          <span>SmartAutomotive</span>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem className="border-b-0" value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3 p-3">
                <div>
                  <TableIcon />
                </div>
                {!collapsed && (
                  <div className="flex w-full items-center justify-between">
                    <span>Master Lookup</span>
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Link
                className="mb-2 flex items-center gap-3 p-3"
                href={"/dashboard/organization-type"}
              >
                <div>
                  <GrStatusUnknown className={cn("size-5")} />
                </div>

                {!collapsed && <span>Organization Types</span>}
              </Link>

              <Link
                className="mb-4 flex items-center gap-3 p-3"
                href={"/dashboard/industry-type"}
              >
                <div>
                  <GrStatusUnknown className={cn("size-5")} />
                </div>
                {!collapsed && <span>Industry Types</span>}
              </Link>

              <Link
                className="mb-4 flex items-center gap-3 p-3"
                href={"/dashboard/cities"}
              >
                <div>
                  <FaTreeCity className={cn("size-6")} />
                </div>
                {!collapsed && <span>Cities</span>}
              </Link>

              <Link
                className="mb-4 flex items-center gap-3 p-3"
                href={"/dashboard/states"}
              >
                <div>
                  <TbBuildingEstate className={cn("size-6")} />
                </div>
                {!collapsed && <span>States</span>}
              </Link>

              <Link
                className="mb-4 flex items-center gap-3 p-3"
                href={"/dashboard/countries"}
              >
                <div>
                  <FaGlobeAsia className={cn("size-6")} />
                </div>
                {!collapsed && <span>Countries</span>}
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Link className="mb-6 flex items-center gap-3 p-3" href={"/dashboard"}>
          <div>
            <RxDashboard className={cn("size-6 text-smawad-accent")} />
          </div>
          {!collapsed && (
            <span className={cn("text-smawad-accent")}>Dashboard</span>
          )}
        </Link>

        <Link
          className="mb-6 flex items-center gap-3 p-3"
          href={"/dashboard/organizations"}
        >
          <div>
            <GoOrganization className={cn("size-6")} />
          </div>
          {!collapsed && <span>Organizations</span>}
        </Link>
        <Link
          className="mb-6 flex items-center gap-3 p-3"
          href={"/dashboard/branches"}
        >
          <div>
            <GoGitBranch className={cn("size-6")} />
          </div>
          {!collapsed && <span>Branches</span>}
        </Link>
        <Link
          className="mb-6 flex items-center gap-3 p-3"
          href={"/dashboard/users"}
        >
          <div>
            <Users2 className={cn("size-6")} />
          </div>
          {!collapsed && <span>Users</span>}
        </Link>
      </div>
    </div>
  );
}
