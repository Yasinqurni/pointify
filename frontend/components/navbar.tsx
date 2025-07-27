"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import ConnectModal from "./connectModal";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="pt-5 bg-inherit backdrop-blur-2xl"
    >
      <div className="max-w-3xl mx-auto z-100 flex gap-5 justify-between items-center w-full">
        <NavbarContent>
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink className="flex items-center gap-1" href="/">
              <p className="font-bold text-lg text-inherit font-almarai">
                Pointify
              </p>
            </NextLink>
          </NavbarBrand>
          <NavbarContent
            className="basis-1/5 sm:basis-full items-center"
            justify="end"
          >
            <ul className="hidden md:flex gap-4 justify-end items-center ml-2 *:font-notoSans">
              {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium hover:text-underline text-slate-500 transition-all delay-100"
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
              <ConnectModal />
            </ul>
          </NavbarContent>
        </NavbarContent>
      </div>
      <NavbarContent className="sm:hidden basis-1" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarMenu className="w-full h-full">
        <div className="mx-4 mt-2 flex flex-col gap-2 justify-between">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button color="primary" variant="flat">
              Connect
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
