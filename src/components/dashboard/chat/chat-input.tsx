import { useRef } from "react"
import { useChatContext } from "@/context/chat-context"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Props = {
    isDisabled?: boolean
}

const ChatInput = ({ isDisabled }: Props) => {
    const { message, addMessage, isLoading, handleInputChange } = useChatContext();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="absolute bottom-0 left-0 w-full">
            <div className="flex gap-3 mx-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <div className="relative flex-1 h-full flex md:flex-col items-stretch">
                    <div className="relative flex-grow flex flex-col w-full p-4">
                        <div className="relative">
                            <Textarea
                                ref={textareaRef}
                                className="py-4 pr-16 resize-none scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                                rows={1}
                                maxRows={4}
                                autoFocus
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()

                                        addMessage()

                                        textareaRef.current?.focus()
                                    }
                                }}
                                value={message}
                                placeholder="Ask your PDF a question"
                            />
                            <Button
                                className="absolute bottom-[7px] right-[8px]"
                                variant="primary"
                                aria-label="send message"
                                disabled={isLoading || isDisabled}
                                onClick={() => {
                                    addMessage()

                                    textareaRef.current?.focus()
                                }}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
 
export default ChatInput