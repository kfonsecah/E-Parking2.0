import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Park Xpress System",
  tagline: "Smart, Fast and AI-powered Parking Management",
  favicon: "img/favicon.ico",

  url: "https://parkxpress.vercel.app", // Cambiar por tu dominio real
  baseUrl: "/",

  organizationName: "AleLeonMarin", // Tu usuario u organización en GitHub
  projectName: "documentation", // Tu repositorio de documentación

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/parkxpress/documentation/tree/main/",
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/parkxpress/documentation/tree/main/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.png", // imagen para compartir en redes (opcional)
    navbar: {
      title: "Park Xpress",
      logo: {
        alt: "Park Xpress Logo",
        src: "img/Logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documentation",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/AleLeonMarin/ParkXpress",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} Park Xpress. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
