import { useEffect } from "react";

const BASE_TITLE = "DSP Power Infra";

/** Per-route document title + meta description (SPA SEO). */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Solar EPC, Pune`;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
}

/** Inject FAQPage JSON-LD for a page's FAQ items; removed on unmount. */
export function useFaqSchema(items) {
  useEffect(() => {
    if (!items || items.length === 0) return undefined;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.faqSchema = "true";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [items]);
}

/** Capture UTM params once per session so every lead carries attribution. */
export function readUtm() {
  try {
    const q = new URLSearchParams(window.location.search);
    const stored = JSON.parse(sessionStorage.getItem("dsp_utm") || "{}");
    const fresh = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = q.get(key);
      if (v) fresh[key] = v.slice(0, 100);
    }
    const merged = { ...stored, ...fresh };
    sessionStorage.setItem("dsp_utm", JSON.stringify(merged));
    return {
      utmSource: merged.utm_source || null,
      utmMedium: merged.utm_medium || null,
      utmCampaign: merged.utm_campaign || null,
    };
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }
}