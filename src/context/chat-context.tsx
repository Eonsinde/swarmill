"use client"
import { ChangeEvent, createContext, ReactNode, useCallback, useContext, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/app/_trpc/client"
import { QUERY_LIMIT } from "@/config/constants"

type ChatContextType = {
    message: string
    addMessage: () => void
    isLoading: boolean
    handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const chatContext = createContext<ChatContextType>({
    message: "",
    addMessage: () => {},
    isLoading: false,
    handleInputChange: () => {},
});

type Props = {
    fileId: string
    children: ReactNode
}

export default function ChatContextProvider({ fileId, children }: Props) {
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const utils = trpc.useUtils();
    const { toast } = useToast();

    const backupMessage = useRef<string>("");

    const postMutation = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch("/api/message", {
                method: "POST",
                body: JSON.stringify({
                    fileId,
                    message
                })
            });

            if (!response.ok)
                return toast({
                    title: "Something went wrong",
                    description: "Please refresh and retry"
                });

            return response.body;
        },
        onMutate: async ({ message: pMessage }) => {
            backupMessage.current = pMessage;
            setMessage("");

            await utils.getFileMessages.cancel();

            const previousMessagesSnapshot = utils.getFileMessages.getInfiniteData();

            utils.getFileMessages.setInfiniteData(
                { fileId, limit: QUERY_LIMIT },
                (old) => {
                    if (!old)
                        return {
                            pages: [],
                            pageParams: []
                        }
                    
                    let allPages = [...old.pages];

                    let latestPage = allPages[0]!;

                    latestPage.messages = [
                        {
                            id: crypto.randomUUID(),
                            text: pMessage,
                            isUserMessage: true,
                            createdAt: new Date().toISOString()
                        },
                        ...latestPage.messages
                    ];

                    allPages[0] = latestPage;

                    return {
                        ...old,
                        pages: allPages
                    }
                }
            );

            // do this not to ensure user's message is firstly added optimistically before loading state for AI shows up
            setIsLoading(true);

            return {
                previousMessages: previousMessagesSnapshot?.pages.flatMap(page => page.messages) ?? []
            }
        },
        onSuccess: async (stream: any) => {
            setIsLoading(false);

            if (!stream)
                return toast({
                    title: "Something went wrong",
                    description: "Couldn't stream response in"
                });

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let done = false;

            // accumulated response
            let accumulatedResponse = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);

                accumulatedResponse += chunkValue;

                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: QUERY_LIMIT },
                    (old) => {
                        if (!old)
                            return {
                                pages: [],
                                pageParams: []
                            }
                        
                        // check to see if AIStreamingResponse placeholder is on present
                        let isAIResponseCreated = old.pages.some(page => page.messages.some(message => message.id === "ai-response"));

                        let updatedPages = old.pages.map(page => {
                            if (page === old.pages[0]) {
                                let updatedMessages;

                                if (!isAIResponseCreated) {
                                    updatedMessages = [
                                        {
                                            id: "ai-response",
                                            text: accumulatedResponse,
                                            isUserMessage: false,
                                            createdAt: new Date().toISOString()
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map(message => {
                                        if (message.id === "ai-response")
                                            return {
                                                ...message,
                                                text: accumulatedResponse
                                            }

                                        return message;
                                    });
                                }

                                return {
                                    ...page,
                                    messages: updatedMessages
                                }
                            }

                            return page;
                        });

                        return {
                            ...old,
                            pages: updatedPages
                        }
                    }
                );
            }
        },
        onError: (_, __, context) => {
            setMessage(backupMessage.current);

            // rollback to previous snapshot
            utils.getFileMessages.setData(
                { fileId },
                { messages: context?.previousMessages ?? [] }
            );
        },
        onSettled: async () => {
            setIsLoading(false);

            await utils.getFileMessages.invalidate({ fileId });
        }
    });

    const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    }, []);

    const addMessage = () => message && postMutation.mutate({ message }) 

    return (
        <chatContext.Provider
            value={{
                message,
                addMessage,
                isLoading,
                handleInputChange
            }}
        >
            {children}
        </chatContext.Provider>
    )
}

export const useChatContext = () => {
    const context = useContext(chatContext)
  
    if (context === undefined) {
        throw new Error(`useChatContext must be used within a ChatProvider`)
    }
    
    return context
}