"use client";

import React from "react";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages = new Set<number | string>();
    const maxVisiblePages = 5;

    pages.add(1);

    if (totalPages <= maxVisiblePages) {
      for (let i = 2; i < totalPages; i++) {
        pages.add(i);
      }
    } else {
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.add("ellipsis_start");
      }

      for (let i = start; i <= end; i++) {
        pages.add(i);
      }

      if (end < totalPages - 1) {
        pages.add("ellipsis_end");
      }
    }

    if (totalPages > 1) {
      pages.add(totalPages);
    }

    return Array.from(pages);
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground hidden md:block">
        Page {currentPage} of {totalPages}
      </div>
      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              aria-disabled={!hasPrev}
              className={
                !hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {typeof pageNum === "string" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={pageNum === currentPage}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              aria-disabled={!hasNext}
              className={
                !hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
}
