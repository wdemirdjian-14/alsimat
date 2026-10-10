"use client";

import { useEffect } from "react";

/** Active les animations [data-reveal] lorsque les éléments entrent dans l'écran. */
export function RevealObserver() {
  useEffect(() => {
    const els = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els().forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const observeAll = () => els().forEach((el) => io.observe(el));
    observeAll();
    // Les contenus filtrés côté client ajoutent de nouveaux éléments : on les observe aussi.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
