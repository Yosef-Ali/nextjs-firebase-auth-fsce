import { createUploadthing, type FileRouter } from "uploadthing/next";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const uploadThing = createUploadthing();

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
