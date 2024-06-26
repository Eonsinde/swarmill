"use client"
import Link from "next/link"
import { format } from "date-fns"
import useModalStore from "@/hooks/use-modal-store"
import { trpc } from "@/app/_trpc/client"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import { Ghost, MessageSquare, Plus, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type Props = {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({ subscriptionPlan }: Props) => {
    const { onOpen } = useModalStore();

    const { data: files, isLoading } = trpc.getUserFiles.useQuery();

    return (
        <main className="mx-auto max-w-7xl px-2.5 md:p-10">
            <div className="mt-8 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 border-b border-border">
                <h1 className="mb-3 font-bold text-3xl">My Files</h1>
                <Button
                    variant="primary"
                    onClick={() => onOpen("uploadModal", { isSubscribed: subscriptionPlan.isSubscribed })}
                >
                    Upload PDF
                </Button>
            </div>
            {/* display all files */}
            {files && files?.length > 0 ? (
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.sort(
                        (a, b) => 
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                    ).map((file) => (
                        <div
                            key={file.id}
                            className="col-span-1 border-y border-accent divide-y divide-accent rounded-lg hover:shadow-xl transition"
                        >
                            <Link
                                className="flex flex-col gap-2"
                                href={`/dashboard/${file.id}`}
                            >
                                <div className="pt-6 px-6 flex justify-center items-center w-full space-x-6">
                                    <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-rose-300 to-rose-600 rounded-full" />
                                    <div className="flex-1 truncate">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium truncate">
                                                {file.name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <div className="grid grid-cols-3 place-items-center gap-6 mt-4 py-2 px-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    {format(new Date(file.createdAt), "MMM yyyy")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Mocked
                                </div>
                                <Button
                                    className="w-full"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onOpen("deleteFile", { id: file.id, name: file.name })}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : isLoading ? (
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-[125px] rounded-xl" />
                    <Skeleton className="h-[125px] rounded-xl" />
                    <Skeleton className="hidden lg:block h-[125px] rounded-xl" />
                </div>
            ): (
                <div className="mt-16 flex flex-col items-center gap-2 text-center">
                    <Ghost className="h-8 w-8 text-zinc-200" />
                    <h3 className="text-xl font-semibold">
                        Pretty empty around here
                    </h3>
                    <p className="text-muted-foreground">Let&apos;s upload your first PDF</p>
                </div>
            )}
        </main>
    )
}
 
export default Dashboard