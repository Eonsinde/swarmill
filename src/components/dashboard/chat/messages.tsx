import { trpc } from "@/app/_trpc/client"
import { Loader2, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Message from "./message"

type Props = {
    fileId: string
}

const Messages = ({ fileId }: Props) => {
    const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery({
        fileId
    }, {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true
    });

    const messages = data?.pages.flatMap((page) => page.messages);

    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="h-full flex justify-center items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
            </span>
        )
    }

    const combinedMessages = [
        ...(false ? [loadingMessage] : []),
        ...(messages ?? [])
    ];

    return (
        <div className="flex-1 max-h-[calc(100vh-3.5rem-7rem)] flex flex-col-reverse gap-4 p-3 border-border overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {combinedMessages && combinedMessages.length > 0
            ?
            (combinedMessages.map((message, index) => {
                const isCurrentMessageSameAsPrevious = combinedMessages[index - 1]?.isUserMessage === combinedMessages[index]?.isUserMessage

                if (index === combinedMessages.length-1)
                // this who help trigger a request to the server to fetch the next page
                    return (
                        <Message
                            key={index}
                            message={message}
                            isCurrentMessageSameAsPrevious={isCurrentMessageSameAsPrevious}
                        />
                    )
                return (
                    <Message
                        key={index}
                        message={message}
                        isCurrentMessageSameAsPrevious={isCurrentMessageSameAsPrevious}
                    />
                )
            }))
            :
            isLoading
                ?
                <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                </div>
                :
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-rose-500" />
                    <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
                    <p className="text-muted-foreground text-sm">
                        Ask answer question to get started
                    </p>
                </div>}
        </div>
    )
}

export default Messages