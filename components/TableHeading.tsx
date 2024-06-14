import SortingIndicator from "./SortingIndicator";

type TableHeadingProps = {
  setColumn: () => void;
  title: string;
  activeAt: number;
  status: number | undefined;
  sortingOrder: "asc" | "desc";
};

export default function TableHeading(props: TableHeadingProps) {
  return (
    <th className="cursor-pointer" onClick={props.setColumn}>
      <div className="flex items-center justify-between">
        <span>{props.title}</span>
        <SortingIndicator
          activeAt={props.activeAt}
          status={props.status}
          order={props.sortingOrder}
        />
      </div>
    </th>
  );
}
