import * as XLSX from "xlsx";
export const csvToExcel = (csvString: string) => {
  const arrayOfArrayCsv = csvString
    .replace(/\"/gm, "")
    .split("\n")
    .map((row: string) => {
      return row.split(",");
    });
  const wb = XLSX.utils.book_new();
  const newWs = XLSX.utils.aoa_to_sheet(arrayOfArrayCsv);
  XLSX.utils.book_append_sheet(wb, newWs);
  const rawExcel = XLSX.write(wb, { type: "array" });
  return rawExcel;
};
