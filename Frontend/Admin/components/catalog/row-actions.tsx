import { Pencil, Trash2 } from "lucide-react";

export function RowActions({
  label,
  onEdit,
  onDelete,
  disabled,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-start gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="flex rounded-xs bg-page p-1.5 text-body transition-colors hover:bg-line/60 disabled:opacity-50"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="flex rounded-xs bg-danger-tint p-1.5 text-danger transition-colors hover:bg-danger/15 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </span>
  );
}
