export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pointify : A Web3 Loyalty Platform",
  description:
    "Pointify is a Web3 platform for loyalty points.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
  },
};
