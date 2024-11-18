import { createUploadthing, type FileRouter } from "uploadthing/next";
import { useUploadThing } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const uploadThing = createUploadthing();

export { useUploadThing };
