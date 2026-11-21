// Known dimensions of the social-share originals. Kept in one pure module so
// the browser hooks (src/lib/seo.js) and the Node prerenderer agree exactly.
// Update this map when a source image is replaced.
export const OG_IMAGE_DIMENSIONS = {
  "/images/hero-family.jpg": { width: 1600, height: 914, type: "image/jpeg" },
  "/images/hero.jpg": { width: 1640, height: 1000, type: "image/jpeg" },
  "/images/banner-a.jpg": { width: 1600, height: 780, type: "image/jpeg" },
  "/images/banner-b.jpg": { width: 1740, height: 820, type: "image/jpeg" },
  "/images/banner-c.jpg": { width: 1520, height: 600, type: "image/jpeg" },
  "/images/house-dusk.jpg": { width: 1740, height: 1940, type: "image/jpeg" },
  "/images/panels-sunset.jpg": { width: 1640, height: 1520, type: "image/jpeg" },
  "/images/sunrise-roof.jpg": { width: 1510, height: 1194, type: "image/jpeg" },
};

export function ogImageMeta(imagePath) {
  return OG_IMAGE_DIMENSIONS[imagePath] || null;
}
