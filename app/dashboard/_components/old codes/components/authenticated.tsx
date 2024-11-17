"use client"

import React, { useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Skeleton } from "./ui/skeleton"
import { useToast } from "./ui/use-toast"
import { Button } from "./ui/button"
import Link from "next/link"

type Props = {
  children?: React.ReactNode
}

export default function Authenticated({ children }: Props) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { toast } = useToast()
  const { signOut } = useClerk()

  const hasAccessToDashboard = useQuery(
    api.users.checkAccess,
    isLoaded && user?.id ? { clerkId: user.id } : "skip"
  )

  useEffect(() => {
    if (isLoaded && isSignedIn && hasAccessToDashboard && hasAccessToDashboard.hasAccess === false) {
      toast({
        title: "You do not have access to this dashboard",
        description: "Please contact the administrator to request access.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }, [isLoaded, isSignedIn, hasAccessToDashboard, toast])

  const handleSignIn = () => {
    toast({
      title: "Internal Use Only",
      description: "Sign-in is restricted to authorized personnel. If you need access, please contact the administrator.",
      duration: 5000,
    })
  }

  if (!isLoaded) {
    return <Skeleton className="w-[100px] h-[40px]" />
  }

  if (!isSignedIn) {
    return <Button onClick={handleSignIn}>Sign In</Button>
  }

  if (hasAccessToDashboard === undefined) {
    return <Skeleton className="w-[100px] h-[40px]" />
  }

  if (hasAccessToDashboard.hasAccess === false) {
    return (
      <Button onClick={() => signOut()}>
        Logout
      </Button>
    )
  }

  return (
    <>
      <Link href="/dashboard">
        <Button variant="outline" className="mr-2">Dashboard</Button>
      </Link>
      <Button onClick={() => signOut()}>Logout</Button>
      {children}
    </>
  )
}