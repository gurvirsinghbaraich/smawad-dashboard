"use client";
import { useState } from "react";
import { BiFilter } from "react-icons/bi";
import ActionButton from "./ActionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function FiltersButton({ children, applied, onSave }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <BiFilter size={18} />
        <span>Filters ({applied})</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-xs max-h-80 max-w-xs overflow-auto overflow-x-hidden">
        {children}

        <div className="flex items-center justify-end">
          <ActionButton
            onClick={() => {
              onSave();
              setIsOpen(false);
            }}
            title="Save Filters"
            actionButton
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
