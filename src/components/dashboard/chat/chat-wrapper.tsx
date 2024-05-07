"use client"
import Link from "next/link"
import { trpc } from "@/app/_trpc/client"
import { ChevronLeft, Hourglass, Loader2, XCircle } from "lucide-react"
import Messages from "@/components/dashboard/chat/messages"
import ChatInput from "@/components/dashboard/chat/chat-input"
import { buttonVariants } from "@/components/ui/button"
import ChatContextProvider from "../../../context/chat-context"

type Props = {
    fileId: string
}

const ChatWrapper = ({ fileId }: Props) => {
    const { data, isLoading } = trpc.getFileUploadStatus.useQuery({
        id: fileId
    }, {
        refetchInterval: (data) =>
            (data?.status === "FAILED" || data?.status === "SUCCESS")
                ? false
                : 500
    });

    if (isLoading)
        return (
            <div className="relative min-h-full flex flex-col justify-between gap-2 divide-y divide-border">
                <div className="flex-1 flex flex-col justify-center mb-28">
                    <div className="flex flex-col items-center gap-2 p-6 lg:p-3">
                        <Hourglass className="h-8 w-8 text-rose-500 animate-spin-pulse " />
                        <h3 className="font-semibold text-xl">Loading...</h3>
                        <p className="text-muted-foreground text-sm">
                            We&apos;re preparing your PDF
                        </p>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )

    
    if (data?.status === "PROCESSING")
        return (
            <div className="relative min-h-full flex flex-col justify-between gap-2 divide-y divide-border">
                <div className="flex-1 flex flex-col justify-center mb-28">
                    <div className="flex flex-col items-center gap-2 p-6 lg:p-3">
                        <Hourglass className="h-8 w-8 text-rose-500 animate-spin-pulse " />
                        <h3 className="font-semibold text-xl">Processing PDF</h3>
                        <p className="text-muted-foreground text-sm">
                            This won&apos;t take too long
                        </p>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )

    if (data?.status === "FAILED")
        return (
            <div className="relative min-h-full flex flex-col justify-between gap-2 divide-y divide-border">
                <div className="flex-1 flex flex-col justify-center mb-28">
                    <div className="flex flex-col items-center gap-2 p-6 lg:p-3">
                        <XCircle className="h-8 w-8 text-rose-500" />
                        <h3 className="font-semibold text-xl">Quota Limit Exceeded</h3>
                        <p className="text-muted-foreground text-sm">
                            Your <span className="font-medium">free</span>{" "}
                            plan supports up to 5 pages per PDF
                        </p>
                        <Link
                            href="/dashboard"
                            className={buttonVariants({
                                variant: "outline",
                                className: "mt-2"
                            })}
                        >
                            <ChevronLeft className="h-3 w-3 mr-1.5" />
                            Back
                        </Link>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )

    return (
        <ChatContextProvider fileId={fileId}>
            <div className="relative min-h-full flex flex-col justify-between gap-2 divide-y divide-border">
                <div className="flex-1 flex flex-col justify-between mb-28">
                    <Messages fileId={fileId} />
                </div>
                <ChatInput />
            </div>
        </ChatContextProvider>
    )
}
 
export default ChatWrapper