import { useEffect } from "react";

/** DESIGN 5.1: the overdue count is mirrored in the document title. */
export function useDocumentTitle(overdue: number | undefined): void {
  useEffect(() => {
    document.title = overdue && overdue > 0 ? `(${overdue} overdue) Tasks` : "Tasks";
  }, [overdue]);
}
