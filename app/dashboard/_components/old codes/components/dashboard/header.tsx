"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { BookOpenIcon, CircleUser, Home, ImageIcon, LineChart, Menu, Package, Package2, Search, Settings, ShoppingCart, TagIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { UsersIcon } from "../icons"
import { UserButton, useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { api } from "../../../convex/_generated/api"
import { useQuery } from "convex/react"

const Header: React.FC = () => {
  const pathname = usePathname()
  const { user } = useUser()
  const blogCount = useQuery(api.posts.getBlogCount, { userId: user?.id ?? "" })

  const isLinkActive = (href: string) => {
    return pathname.startsWith(href)
  }

  const linkClass = (href: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
    isLinkActive(href) ? "bg-muted text-primary" : "text-muted-foreground"
  )

  return (
    <header className="fixed top-0 left-0 md:left-[220px] lg:left-[280px] z-30 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:w-[calc(100%-220px)] lg:w-[calc(100%-280px)] ">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <img src="/logo.svg" alt="logo" className="h-8" />
            </Link>

            <Link
              href="/dashboard/blogs"
              className={linkClass("/dashboard/blogs")}
            >
              <BookOpenIcon className="h-4 w-4" />
              Blogs
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                {blogCount ?? "-"}
              </Badge>
            </Link>
            <Link
              href="/dashboard/categories"
              className={linkClass("/dashboard/categories")}
            >
              <TagIcon className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/dashboard/users"
              className={linkClass("/dashboard/users")}
            >
              <UsersIcon className="h-4 w-4" />
              Users
            </Link>
            <Link
              href="/dashboard/media"
              className={linkClass("/dashboard/media")}
            >
              <ImageIcon className="h-4 w-4" />
              Media
            </Link>
          </nav>
          <div className="mt-auto">
            <Link
              href="/dashboard/settings"
              className={linkClass("/dashboard/settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex-1 w-full">
        <form>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </form>
      </div>
      <UserButton />
    </header>
  )
}

export default Header