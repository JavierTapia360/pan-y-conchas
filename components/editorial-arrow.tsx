export function EditorialArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`editorial-arrow ${className}`.trim()}
      viewBox="0 0 30 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 6H28M23 1L28 6L23 11" />
    </svg>
  );
}
