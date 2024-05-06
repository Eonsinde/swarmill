import { NextRequest } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import * as z from "zod"
import { PineconeStore } from "@langchain/pinecone"
import { OpenAIEmbeddings } from "@langchain/openai"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { db } from "@/lib/db"
import { pc } from "@/lib/pinecone"
import { openai } from "@/lib/openai"

const MessageValidator = z.object({
    fileId: z.string(),
    message: z.string()
});

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const kindleUser = await getUser();

    if (!kindleUser?.id)
        return new Response("[MESSAGE_ERROR]:UNAUTHORIZED", { status: 401 });

    const { fileId, message } = MessageValidator.parse(body);

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            ownerId: kindleUser.id
        }
    });

    if (!file)
        return new Response("[MESSAGE_ERROR]:NOT_FOUND", { status: 401 });

    const newMessage = await db.message.create({
        data: {
            text: message,
            fileId: file.id,
            userId: kindleUser.id,
            isUserMessage: true
        }
    });

    // vectorize user message and make semantic query to pineconde index
    const pineconeIndex = pc.Index(process.env.PINECONE_INDEX!);
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    });

    const vectorStore = await PineconeStore.fromExistingIndex(
        embeddings,
        {
            pineconeIndex,
            namespace: file.id
        }
    );

    // TODO: premium users should get more messages
    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
        where: {
            fileId: file.id
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 6
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "assistant" as const,
        content: msg.text
    }));

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true,
        messages: [
            {
              role: 'system',
              content:
                'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
            },
            {
              role: 'user',
              content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedPrevMessages.map((message) => {
                    if (message.role === 'user')
                        return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                })}
                
                \n----------------\n
                
                CONTEXT:
                ${results.map((r) => r.pageContent).join('\n\n')}
                
                USER INPUT: ${message}`,
            }
        ],
    });

    const stream = OpenAIStream(
        response,
        {
            async onCompletion(completion) {
                await db.message.create({
                    data: {
                        text: completion,
                        fileId: file.id,
                        userId: kindleUser.id,
                        isUserMessage: false
                    }
                })
            }
        }
    );

    return new StreamingTextResponse(stream);
}