import { Helmet } from "react-helmet-async";

// NOTE: Update SITE_URL once the church's real domain is purchased and
// pointed at this deployment. Until then this falls back to the current
// Vercel URL so tags are still valid, just not on the final domain.
export const SITE_URL = "https://palaceofhisglory.vercel.app";
export const SITE_NAME = "Palace of His Glory International Ministries";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title: string;
  description: string;
  path?: string; // e.g. "/about" - defaults to "/"
  image?: string;
  type?: "website" | "article";
}

export function SEO({ title, description, path = "/", image, type = "website" }: SEOProps) {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
