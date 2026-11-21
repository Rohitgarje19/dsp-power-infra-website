
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
  widths = [640, 1200, 1600],
  ...rest
}) {
  const isPhoto = /^\/images\/.+\.(jpe?g|png)$/i.test(src || "");
  const base = isPhoto ? src.replace(/\.(jpe?g|png)$/i, "") : null;
  const candidates = base
    ? widths
        .slice(0, -1)
        .map((w) => `${base}-${w}.webp ${w}w`)
        .concat(`${base}.webp ${widths[widths.length - 1]}w`)
        .join(", ")
    : "";
  return (
    <picture>
      {base && <source type="image/webp" srcSet={candidates} sizes={sizes} />}
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
