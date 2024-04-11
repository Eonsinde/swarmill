import { db } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req }) => {
            const { getUser } = getKindeServerSession();

            const kindleUser = await getUser();
        
            // If you throw, the user will not be able to upload
            if (!kindleUser || !kindleUser.id) throw new UploadThingError("Unauthorized");
        
            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: kindleUser.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createFile = await db.file.create({
                data: {
                    name: file.name,
                    key: file.key,
                    url: file.url,
                    ownerId: metadata.userId,
                    uploadStatus: "PROCESSING"
                }
            })
        })
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter