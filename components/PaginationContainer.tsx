import renderPagination from "@/lib/renderPagination";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

type PaginationContainerProps = {
  total?: number;
  loading?: boolean;
  currentPage: number;
  setPage: Dispatch<SetStateAction<number>>;
};

export default function PaginationContainer(props: PaginationContainerProps) {
  const nextPage = function () {
    props.setPage((page) => {
      if (page * 10 < props.total!) {
        return page + 1;
      }

      return page;
    });
  };

  const previousPage = function () {
    props.setPage((page) => {
      if (page > 1) {
        return page - 1;
      }

      return page;
    });
  };

  return (
    <div className="mt-4 flex w-full items-center justify-between text-sm">
      {props.loading ? (
        <>
          <div className="h-6 w-48 animate-pulse rounded-full bg-smawad-gray"></div>
          <div className="h-6 w-48 animate-pulse rounded-full bg-smawad-gray"></div>
        </>
      ) : (
        <>
          <div>
            <span>Showing&nbsp;</span>
            <b>{props.currentPage * 10 - 10}</b>
            <span>&nbsp;to&nbsp;</span>
            <b>
              {props.currentPage * 10 < props.total!
                ? props.currentPage * 10
                : props.total}{" "}
            </b>
            <span>of {props.total} branches.</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="size-8 p-2" onClick={previousPage}>
              <IoArrowBack />
            </button>

            {renderPagination(props.total!, props.currentPage).map(
              (pageNumber) => (
                <button
                  onClick={() => props.setPage(pageNumber)}
                  className={cn(
                    "default size-8",
                    props.currentPage === pageNumber && "action-button",
                  )}
                  key={pageNumber}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button className="size-8 p-2" onClick={nextPage}>
              <IoArrowForward />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
