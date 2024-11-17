"use client"
import React, { useState } from "react"
import Link from "next/link"
import { MainNavItem } from "@/types"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { MobileNav } from "./mobile-nav"
import { useSelectedLayoutSegment } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

export const MainNav: React.FC<MainNavProps> = ({ items, children }) => {
  const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
  const handleShowMobileMenu = () => setShowMobileMenu(prev => !prev)

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <Icons.logo />
        <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      {items?.length && (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-red-500 sm:text-sm",
                item.disabled && "cursor-not-allowed opacity-80",
                item.href.startsWith(`/${segment}`) ? "border-b-foreground" : "border-b-transparent",
                "border-b bottom-1" // Add border bottom with 1px thickness and bottom padding of 1
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
      <button className="flex items-center space-x-2 md:hidden" onClick={handleShowMobileMenu}>
        {showMobileMenu ? <Icons.close /> : <Icons.logo />}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && items && <MobileNav items={items}>{children}</MobileNav>}
    </div>
  )
}