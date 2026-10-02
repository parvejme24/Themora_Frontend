import type { IconType } from "react-icons";
import {
  SiAngular,
  SiBootstrap,
  SiFigma,
  SiFramer,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiReact,
  SiShopify,
  SiSvelte,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
  SiWebflow,
  SiWordpress,
} from "react-icons/si";

export interface TechIcon {
  icon: IconType;
  /** Solid tile colour; the glyph sits on top in `fg` */
  bg: string;
  fg?: string;
}

// Keys are normalised titles: lowercase, letters/digits only, trailing "js" dropped
const TECH_ICONS: Record<string, TechIcon> = {
  react: { icon: SiReact, bg: "#087EA4" },
  next: { icon: SiNextdotjs, bg: "#0A0A0A" },
  vue: { icon: SiVuedotjs, bg: "#41B883" },
  angular: { icon: SiAngular, bg: "#DD0031" },
  svelte: { icon: SiSvelte, bg: "#FF3E00" },
  javascript: { icon: SiJavascript, bg: "#F7DF1E", fg: "#1A1A1A" },
  typescript: { icon: SiTypescript, bg: "#3178C6" },
  node: { icon: SiNodedotjs, bg: "#3C873A" },
  php: { icon: SiPhp, bg: "#777BB4" },
  laravel: { icon: SiLaravel, bg: "#FF2D20" },
  wordpress: { icon: SiWordpress, bg: "#21759B" },
  webflow: { icon: SiWebflow, bg: "#146EF5" },
  framer: { icon: SiFramer, bg: "#0055FF" },
  figma: { icon: SiFigma, bg: "#A259FF" },
  shopify: { icon: SiShopify, bg: "#5E8E3E" },
  html: { icon: SiHtml5, bg: "#E34F26" },
  html5: { icon: SiHtml5, bg: "#E34F26" },
  tailwind: { icon: SiTailwindcss, bg: "#0EA5E9" },
  tailwindcss: { icon: SiTailwindcss, bg: "#0EA5E9" },
  bootstrap: { icon: SiBootstrap, bg: "#7952B3" },
};

export const normaliseTech = (title: string) => {
  const key = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  return key.length > 4 && key.endsWith("js") ? key.slice(0, -2) : key;
};

export const getTechIcon = (title: string): TechIcon | undefined =>
  TECH_ICONS[normaliseTech(title)];

// Shown after the real categories so the grid always has 12 tiles
export const SUGGESTED_STACKS = [
  "Vue.js",
  "Tailwind CSS",
  "Shopify",
  "Laravel",
  "HTML5",
  "Angular",
  "TypeScript",
  "Svelte",
  "Node.js",
  "Bootstrap",
];
