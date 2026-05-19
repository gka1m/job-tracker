interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-3 px-5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-[#AAB4C3] text-[#F5F7FA] hover:bg-[#AAB4C3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        ←
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
            p === page
              ? "bg-[#007C91] text-[#F5F7FA] border-[#007C91]"
              : "border-[#AAB4C3] text-[#F5F7FA] hover:bg-[#AAB4C3]"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === safeTotalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-[#AAB4C3] text-[#F5F7FA] hover:bg-[#AAB4C3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        →
      </button>
    </div>
  );
}
