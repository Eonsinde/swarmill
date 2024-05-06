import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { OpenAIEmbeddings } from "@langchain/openai"
import { PineconeStore } from "@langchain/pinecone"
import { db } from "@/lib/db"
import { pc } from "@/lib/pinecone"
 
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
            const createdFile = await db.file.create({
                data: {
                    name: file.name,
                    key: file.key,
                    url: file.url,
                    ownerId: metadata.userId,
                    uploadStatus: "PROCESSING"
                }
            });

            try {
                const response = await fetch(file.url);
                const pdfBlob = await response.blob();

                const loader = new PDFLoader(pdfBlob);
                const docs = await loader.load();
                
                // TODO: check num of pages against user's plan
                const numPages = docs.length;

                // vectorize and index the entire document
                const pineconeIndex = pc.Index(process.env.PINECONE_INDEX!);
                const embeddings = new OpenAIEmbeddings({
                    openAIApiKey: process.env.OPENAI_API_KEY
                });

                await PineconeStore.fromDocuments(
                    docs,
                    embeddings,
                    {
                        pineconeIndex,
                        namespace: createdFile.id
                    }
                );

                // finally set new file's upload status to SUCSESS
                await db.file.update({
                    data: {
                        uploadStatus: "SUCCESS"
                    },
                    where: {
                        id: createdFile.id
                    }
                });
            } catch (err: any) {
                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id
                    }
                });
            }
        })
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter