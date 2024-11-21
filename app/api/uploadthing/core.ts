import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/app/firebase";

const f = createUploadthing();

const handleAuth = async () => {
  try {
    const user = auth.currentUser;
    console.log("UploadThing middleware - Auth state:", !!user);
    
    if (!user) {
      console.error("UploadThing middleware - No user found");
      throw new Error("You must be logged in to upload images");
    }
    
    return { userId: user.uid };
  } catch (error) {
    console.error("UploadThing middleware error:", error);
    throw error;
  }
};

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(async ({ file }) => {
      console.log("Image uploaded:", file.url);
    }),

  resourceUploader: f({ blob: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(async ({ file }) => {
      console.log("Resource uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
