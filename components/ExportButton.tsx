import { BiImport } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function ExportButton({ toExcel, toCSV }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="default">
        <BiImport size={18} />
        <span>Export as</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={toExcel} className="mb-1 cursor-pointer p-2">
          Spreadsheet {"(.xlsx)"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toCSV} className="mt-1 cursor-pointer p-2">
          CSV Document {"(.csv)"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
