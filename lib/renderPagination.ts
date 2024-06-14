export default function renderPagination(
  totalRecords: number,
  pageNumber: number,
  recordsPerPage = 10,
) {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const pagesToShow = 3;

  let startPage, endPage;

  if (totalPages <= pagesToShow) {
    // Less than or equal to the number of pages to show
    startPage = 1;
    endPage = totalPages;
  } else {
    // More than the number of pages to show
    if (pageNumber <= Math.floor(pagesToShow / 2)) {
      startPage = 1;
      endPage = pagesToShow;
    } else if (pageNumber + Math.floor(pagesToShow / 2) >= totalPages) {
      startPage = totalPages - pagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = pageNumber - Math.floor(pagesToShow / 2);
      endPage = pageNumber + Math.floor(pagesToShow / 2);
    }
  }

  let index = 0;
  let pages = [];

  while (startPage + index <= endPage) {
    pages[index] = startPage + index;
    index++;
  }

  return pages;
}
