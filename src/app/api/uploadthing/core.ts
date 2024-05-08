import { NextRequest } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { OpenAIEmbeddings } from "@langchain/openai"
import { PineconeStore } from "@langchain/pinecone"
import { db } from "@/lib/db"
import { pc } from "@/lib/pinecone"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import { PLANS } from "@/config/payment-plans"
 
const f = createUploadthing();

const middleware = async ({ req }: { req: NextRequest }) => {
    const { getUser } = getKindeServerSession();

    const kindleUser = await getUser();

    // If you throw, the user will not be able to upload
    if (!kindleUser || !kindleUser.id) throw new UploadThingError("Unauthorized");

    const subscriptionPlan = await getUserSubscriptionPlan();
    
    // Whatever is returned here is accessible in onUploadComplete as `metadata`
    return { userId: kindleUser.id, subscriptionPlan };
}

const onUploadComplete = async ({
    metadata, file
} : {
    metadata: Awaited<ReturnType<typeof middleware>>,
    file: {
        key: string
        name: string
        url: string
    }
}) => {
    // this will help to prevent a file from being uploaded multiple times
    const fileExists = await db.file.findFirst({
        where: {
            key: file.key
        }
    });

    if (fileExists) return;

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
        
        // TODO: check num of pages against user's current plan
        const numPages = docs.length;

        const { subscriptionPlan: { isSubscribed } } = metadata;

        const isProExceeded = numPages > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPDF;
        const isFreeExceeded = numPages > PLANS.find((plan) => plan.name === "Free")!.pagesPerPDF;

        if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
            await db.file.update({
                data: {
                    uploadStatus: "FAILED"
                },
                where: {
                    id: createdFile.id
                }
            });
        }

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
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    freePDFUploader: f({ pdf: { maxFileSize: "4MB" } })
        // Set permissions and file types for this FileRoute
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPDFUploader: f({ pdf: { maxFileSize: "16MB" } })
        // Set permissions and file types for this FileRoute
        .middleware(middleware)
        .onUploadComplete(onUploadComplete)
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter