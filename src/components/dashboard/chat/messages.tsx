import { useEffect, useRef } from "react"
import { trpc } from "@/app/_trpc/client"
import { useIntersection } from "@mantine/hooks"
import { useChatContext } from "@/context/chat-context"
import { Loader2, MessageSquare } from "lucide-react"
import { QUERY_LIMIT } from "@/config/constants"
import { Skeleton } from "@/components/ui/skeleton"
import Message from "./message"

type Props = {
    fileId: string
}

const Messages = ({ fileId }: Props) => {
    const { isLoading: isProcessingResponse } = useChatContext();
    const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery({
        fileId,
        limit: QUERY_LIMIT
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
        ...(isProcessingResponse ? [loadingMessage] : []),
        ...(messages ?? [])
    ];

    const lastMessageRef = useRef<HTMLDivElement>(null);

    const { ref, entry } = useIntersection({
        root: lastMessageRef.current,
        threshold: 1
    });

    useEffect(() => {
        if (entry?.isIntersecting)
            hasNextPage && fetchNextPage();
    }, [entry, fetchNextPage]);

    return (
        <div className="flex-1 max-h-[calc(100vh-3.5rem-7rem)] flex flex-col-reverse gap-4 p-3 border-border overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {combinedMessages && combinedMessages.length > 0
            ?
            <>
                {(combinedMessages.map((message, index) => {
                    const isCurrentMessageSameAsPrevious = combinedMessages[index - 1]?.isUserMessage === combinedMessages[index]?.isUserMessage

                    if (index === combinedMessages.length-1)
                    // this who help trigger a request to the server to fetch the next page
                        return (
                            <Message
                                ref={ref}
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
                }))}
                {/* this is positioned here due to flex-reverse */}
                {isFetchingNextPage && (
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="col-start-2 row-start-2 h-12 rounded-xl" />
                    </div>
                )}
            </>
            :
            isLoading
                ?
                <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                </div>
                :
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-rose-500" />
                    <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
                    <p className="text-muted-foreground text-sm">
                        Ask any question to get started
                    </p>
                </div>}
        </div>
    )
}

export default Messages