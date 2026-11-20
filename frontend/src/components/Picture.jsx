import React from "react";

/**
 * Responsive photo with WebP sources generated from the JPEG originals.
 * `picture { display: contents }` in the theme keeps existing layout classes
 * working, so the <img> remains the styled element.
 */
export default function Picture({
  src,
  alt = "",
  className,
  loading = "lazy",
  fetchPriority,
  sizes = "(max-width: 700px) 100vw, 50vw",
  ...rest
}) {
  const isPhoto = /^\/images\/.+\.(jpe?g|png)$/i.test(src || "");
  const base = isPhoto ? src.replace(/\.(jpe?g|png)$/i, "") : null;
  return (
    <picture>
      {base && (
        <source
          type="image/webp"
          srcSet={`${base}-640.webp 640w, ${base}-1200.webp 1200w, ${base}.webp 1600w`}
          sizes={sizes}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        {...rest}
      />
    </picture>
  );
}
