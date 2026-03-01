import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: "/docs",
      title: <span>decoders</span>,
    },
    githubUrl: "https://github.com/nvie/decoders",
  };
}
