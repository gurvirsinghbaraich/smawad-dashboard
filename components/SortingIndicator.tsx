import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";

export default function SortingIndicator({ status, order, activeAt }: any) {
  return !(status == activeAt) ? (
    <FaSort />
  ) : order == "asc" ? (
    <FaSortUp />
  ) : (
    <FaSortDown />
  );
}
