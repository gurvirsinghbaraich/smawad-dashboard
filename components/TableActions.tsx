import { EyeIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { RxPencil1 } from "react-icons/rx";

export default function TableActions({ onView, updateLink, onDelete }: any) {
  return (
    <div className="flex justify-center gap-6">
      <button onClick={onView} className="border-none p-0">
        <EyeIcon size={20} style={{ color: "#8B8B8B" }} />
      </button>

      <Link href={updateLink ?? "#"}>
        <RxPencil1 size={20} style={{ color: "#8B8B8B" }} />
      </Link>

      <button onClick={onDelete} className="border-none p-0">
        <Trash2 size={20} style={{ color: "#8B8B8B" }} />
      </button>
    </div>
  );
}
