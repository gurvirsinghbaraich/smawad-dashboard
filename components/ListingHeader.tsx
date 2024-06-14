const ListingHeader = function ({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[39px] flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex gap-4">{children}</div>
    </div>
  );
};

export default ListingHeader;
