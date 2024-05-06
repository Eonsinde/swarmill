"use client"
import { ChangeEvent, createContext, ReactNode, useCallback, useContext, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"

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

    const { toast } = useToast();

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
                throw new Error("Failed to send message");
        }
    });

    const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    }, []);

    const addMessage = () => postMutation.mutate({ message }) 

    return (
        <chatContext.Provider
            value={{
                message,
                addMessage,
                isLoading: postMutation.isLoading,
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