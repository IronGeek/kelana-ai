import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PagerProps {
  current: number
  size: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pager = ({ current, size, total, onPageChange }: PagerProps) => {
  const totalPages = total === 0 ? 0 : Math.ceil((total ?? size) / size);

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (current > 1) onPageChange(current - 1);
  };

  const handleNext = () => {
    if (current < totalPages) onPageChange(current + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, "ellipsis", totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", current, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); handlePrevious(); }}
            className={current === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={current === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page as number);
                }}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); handleNext(); }}
            className={current === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export { Pager };
export type { PagerProps };
