"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteCatalogItem, type CatalogEntity } from "@/features/catalog/actions";

/** Shared list state for catalogue screens: search, dialog open/edit target, delete. */
export function useCatalogList<T extends { id: number }>(entity: CatalogEntity, items: T[], pick: (item: T) => string) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<{ message?: string; error?: string }>({});
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => pick(i).toLowerCase().includes(q)) : items;
  }, [items, query, pick]);

  const create = () => {
    setEditing(null);
    setOpen(true);
  };
  const edit = (item: T) => {
    setEditing(item);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const saved = (message?: string) => {
    setOpen(false);
    setNotice({ message });
  };
  const remove = (item: T, label: string) => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCatalogItem(entity, item.id);
      setNotice(result?.error ? { error: result.error } : { message: result?.message });
    });
  };

  return { query, setQuery, visible, editing, open, create, edit, close, saved, remove, notice, pending };
}
