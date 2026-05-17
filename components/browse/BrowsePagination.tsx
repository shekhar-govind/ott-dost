interface BrowsePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function BrowsePagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: BrowsePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-between gap-4"
      aria-label="Browse pagination"
    >
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <p className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
