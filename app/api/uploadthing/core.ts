import { createUploadthing, type FileRouter } from "uploadthing/next";
// Removed unnecessary import of UploadButton

const f = createUploadthing();

const auth = () => ({ id: "fakeId" }); // Replace with your actual auth logic

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Image uploaded:", file.url);
    }),

  resourceUploader: f({ blob: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Resource uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
