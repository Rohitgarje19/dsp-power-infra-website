import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusables(panel) {
  return [...panel.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && el.type !== "hidden" && !el.closest("[hidden]"),
  );
}

/**
 * Shared modal behavior for overlay dialogs:
 * Escape closes, Tab is contained within the panel, body scroll is locked,
 * an appropriate control receives initial focus, and focus returns to the
 * trigger on close. `onClose` may change identity between renders without
 * re-running the effect (it is read through a ref).
 */
export function useDialog(open, onClose, panelRef) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;
    const trigger = document.activeElement;

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const list = visibleFocusables(panel);
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey, true);

    const initial =
      panel.querySelector('input:not([aria-hidden="true"]), select, textarea') ||
      visibleFocusables(panel)[0];
    const focusTimer = setTimeout(() => initial?.focus(), 40);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previousOverflow;
      if (trigger && typeof trigger.focus === "function" && trigger.isConnected) {
        trigger.focus();
      } else {
        // Trigger left the DOM (e.g. a record moved out of the current tab):
        // land on the first control of the page instead of losing focus to body.
        document.querySelector("main")?.querySelector(FOCUSABLE)?.focus();
      }
    };
  }, [open, panelRef]);
}