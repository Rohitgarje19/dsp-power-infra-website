import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  absoluteUrl,
  composeTitle,
  SITE_URL,
  useArticleSchema,
  useFaqSchema,
  usePageMeta,
} from "../seo";

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

function clearHead() {
  document.head
    .querySelectorAll(
      'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-faq-schema], script[data-seo]',
    )
    .forEach((node) => node.remove());
  document.title = "";
}

afterEach(clearHead);

describe("seo helpers", () => {
  it("builds absolute URLs from paths and leaves absolute URLs alone", () => {
    expect(absoluteUrl("/about")).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl("about")).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(absoluteUrl()).toBe(`${SITE_URL}/`);
  });

  it("keeps composed titles within the 60 character budget", () => {
    expect(composeTitle(null)).toBe("DSP Power Infra | Solar EPC, Pune");
    expect(composeTitle("About")).toBe("About | DSP Power Infra");
    expect(composeTitle("About DSP Power Infra")).toBe("About DSP Power Infra");
    const long = "A very long guide title that already exceeds the search result budget";
    expect(composeTitle(long)).toBe(long);
  });
});

describe("usePageMeta", () => {
  it("writes title, description, canonical and social tags", () => {
    renderHook(() => usePageMeta("Solar guides", "Practical guides."), { wrapper });

    expect(document.title).toBe("Solar guides | DSP Power Infra");
    expect(document.querySelector('meta[name="description"]').content).toBe("Practical guides.");
    expect(document.querySelector('link[rel="canonical"]').href).toBe(`${SITE_URL}/`);
    expect(document.querySelector('meta[property="og:url"]').content).toBe(`${SITE_URL}/`);
    expect(document.querySelector('meta[property="og:title"]').content).toBe("Solar guides | DSP Power Infra");
    expect(document.querySelector('meta[name="twitter:image"]').content).toMatch(/^https:\/\//);
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("adds and then removes noindex when the option changes", () => {
    const { rerender } = renderHook(
      ({ noindex }) => usePageMeta("Admin", "Private.", { noindex }),
      { wrapper, initialProps: { noindex: true } },
    );
    expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, nofollow");

    rerender({ noindex: false });
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });
});

describe("structured data hooks", () => {
  it("injects FAQPage JSON-LD and removes it on unmount", () => {
    const items = [{ q: "Is it covered?", a: "Yes." }];
    const { unmount } = renderHook(() => useFaqSchema(items), { wrapper });

    const script = document.querySelector("script[data-faq-schema]");
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity[0].name).toBe("Is it covered?");

    unmount();
    expect(document.querySelector("script[data-faq-schema]")).toBeNull();
  });

  it("injects Article JSON-LD with an absolute image", () => {
    const article = {
      title: "Guide",
      excerpt: "Excerpt",
      date: "2026-11-10",
      image: "/images/banner-a.jpg",
    };
    renderHook(() => useArticleSchema(article), { wrapper });

    const script = document.querySelector('script[data-seo="article"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data["@type"]).toBe("Article");
    expect(data.headline).toBe("Guide");
    expect(data.image).toBe(`${SITE_URL}/images/banner-a.jpg`);
    expect(data.author.name).toBe("DSP Power Infra");
  });
});
