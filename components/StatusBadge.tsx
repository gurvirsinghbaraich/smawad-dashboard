import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: Partial<{ status: boolean }>) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[100px] items-center justify-center gap-[10px] rounded p-3",
        status ? "bg-[#E2FBE5]" : "bg-[#FDECEC]",
      )}
    >
      <div
        className={cn(
          "size-2 rounded-full",
          status ? "bg-[#105B39]" : "bg-[#CF4949]",
        )}
      ></div>
      <div className={cn(status ? "text-[#105B39]" : "text-[#CF4949]")}>
        {status ? "Yes" : "No"}
      </div>
    </div>
  );
};

export default StatusBadge;
