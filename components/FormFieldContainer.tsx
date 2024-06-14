export const FormFieldContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex w-full items-start justify-evenly gap-8">
      {children}
    </div>
  );
};
