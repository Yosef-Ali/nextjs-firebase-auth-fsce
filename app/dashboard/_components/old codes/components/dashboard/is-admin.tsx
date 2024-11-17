"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "../ui/skeleton";


type Props = { children: React.ReactNode };

export default function IsAdminsOnly({ children }: Props) {
  const { user, isLoaded } = useUser();
  
  const isAdmin = useQuery(
    api.users.isAdmin,
    isLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  
  if (!isLoaded) {
    return <Skeleton />; // Show a loading state
  }

  if (!user) {
    return <div>User data not available.</div>; // Handle user data not available
  }

  if (isAdmin === undefined) {
    return <Skeleton />; // Still loading access information
  }

  if (isAdmin === false) {
    return null; // Handle no access case
  }

  return <>{children}</>;
}