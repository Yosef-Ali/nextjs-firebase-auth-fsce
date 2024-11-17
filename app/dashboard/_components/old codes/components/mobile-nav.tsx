import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { MainNavItem } from "@/types"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import Logo from "./logo"

interface MobileNavProps {
  items: MainNavItem[]
  children?: React.ReactNode
}

export function MobileNav({ items, children }: MobileNavProps) {
  const pathname = usePathname()

  console.log("pathname", pathname)

  return (
    <div
      className={cn(
        "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden"
      )}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
          <span className="font-bold">{siteConfig.name}</span>
        </Link>
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline",
                item.disabled && "cursor-not-allowed opacity-60",
                pathname === item.href && "bg-accent text-accent-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}