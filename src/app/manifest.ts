import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "רגע לפני — ניהול חתונה",
    short_name: "רגע לפני",
    description: "אישורי הגעה, הושבה, גלריה וכל ניהול החתונה — במקום אחד",
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "he",
    background_color: "#FDFAF5",
    theme_color: "#1C1008",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
