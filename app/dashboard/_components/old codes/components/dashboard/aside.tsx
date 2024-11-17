"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { useUser } from "@clerk/nextjs"
import {
  BookOpenIcon,
  ImageIcon,
  Settings,
  TagIcon,
  UsersIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import IsAdminsOnly from "./is-admin"
import NotificationsComponent from "./notifications"
import { api } from "../../../convex/_generated/api"
import Logo from "../logo"

const Aside: React.FC = () => {
  const pathname = usePathname()
  const params = useParams()
  const { user } = useUser()
  const blogCount = useQuery(api.posts.getBlogCount, { userId: user?.id ?? "" })

  const isActive = (href: string) => {
    if (pathname?.startsWith(href)) {
      return pathname === href || (params.id && pathname === `${href}/${params.id}`)
    }
    return false
  }

  return (
    <div className="hidden h-full w-full border-r bg-muted/40 md:block">
      <div className="fixed inset-0 md:w-[220px] lg:w-[280px]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {/* <img src="/logo.svg" alt="logo" className="h-8" /> */}
              <Logo size={0.5} />
            </Link>
            <div className="relative ml-auto h-8 w-8">
              <NotificationsComponent />
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard/blogs"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive("/dashboard/blogs")
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                <BookOpenIcon className="h-4 w-4" />
                Blogs
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {blogCount ?? "-"}
                </Badge>
              </Link>
              <Link
                href="/dashboard/categories"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive("/dashboard/categories")
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                <TagIcon className="h-4 w-4" />
                Categories
              </Link>
              <IsAdminsOnly>
                <Link
                  href="/dashboard/users"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive("/dashboard/users")
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <UsersIcon className="h-4 w-4" />
                  Users
                </Link>
              </IsAdminsOnly>
              <Link
                href="/dashboard/media"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive("/dashboard/media")
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                <ImageIcon className="h-4 w-4" />
                Media
              </Link>
            </nav>
          </div>
          <div className="mt-auto px-4">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive("/settings")
                ? "text-primary bg-muted"
                : "text-muted-foreground hover:text-primary"
                }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Aside