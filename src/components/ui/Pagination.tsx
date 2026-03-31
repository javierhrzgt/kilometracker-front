import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/Types";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];
  const left = Math.max(2, currentPage - 2);
  const right = Math.min(totalPages - 1, currentPage + 2);

  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { page, totalPages, total, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className={cn("space-y-1", className)}>
      {/* Mobile */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        <Button
          variant="outline"
          size="default"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <span className="text-sm font-medium text-muted-foreground text-center flex-1">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="default"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                aria-hidden="true"
                className="h-9 w-9 flex items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(p)}
                aria-label={`Ir a la página ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
            aria-label="Página siguiente"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString()} registros en total
        </p>
      </div>

      {/* Mobile record count */}
      <p className="text-xs text-muted-foreground text-center md:hidden">
        {total.toLocaleString()} registros en total
      </p>
    </nav>
  );
}
