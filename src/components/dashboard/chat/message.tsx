"use client"
import ReactMarkdown from "react-markdown"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ExtendedMessage } from "@/types/index"
import { Icons } from "./icons"

type Props = {
    message: ExtendedMessage,
    isCurrentMessageSameAsPrevious: boolean
}

const Message = ({ message, isCurrentMessageSameAsPrevious }: Props) => {
    return (
        <div
            className={cn(
                "flex items-end",
                {
                    "justify-end": message.isUserMessage
                }
            )}
        >
            <div
                className={cn(
                    "relative h-6 w-6 flex justify-center items-center aspect-square rounded-sm",
                    {
                        "order-2 bg-background": message.isUserMessage,
                        "order-1 bg-transparent": !message.isUserMessage,
                        invisible: isCurrentMessageSameAsPrevious
                    }
                )}
            >
                {message.isUserMessage ? (
                    <Icons.user className="h-3/4 w-3/4" />
                ): (
                    <Icons.logo className="text-white h-3/4 w-3/4" />
                )}
            </div>
            <div
                className={cn(
                    "flex flex-col space-y-2 max-w-md mx-2",
                    {
                        "order-1 items-end": message.isUserMessage,
                        "order-2 items-start": !message.isUserMessage
                    }
                )}
            >
                <div
                    className={cn(
                        "py-2 px-4 inline-block rounded-lg",
                        {
                            "bg-rose-500 text-white": message.isUserMessage,
                            "bg-secondary text-white": !message.isUserMessage,
                            "rounded-br-none": !isCurrentMessageSameAsPrevious && message.isUserMessage,
                            "rounded-bl-none": !isCurrentMessageSameAsPrevious && !message.isUserMessage
                        }
                    )}
                >
                    {typeof message.text === "string" ? (
                        <ReactMarkdown
                            className="prose-invert text-sm"
                        >
                            {message.text}
                        </ReactMarkdown>
                    ) : (
                        message.text
                    )}
                    {message.id !== "loading-message" ? (
                        <div
                            className={cn(
                                "mt-2 w-full text-xs text-right select-none",
                                {
                                    "text-secondary-foreground": message.isUserMessage,
                                    "text-muted-foreground": !message.isUserMessage
                                }
                            )}
                        >
                            {format(new Date(message.createdAt), "HH:mm")}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
 
export default Message