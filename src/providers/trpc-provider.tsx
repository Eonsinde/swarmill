"use client"
import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { trpc } from "../app/_trpc/client"
import { getURL } from "@/lib/absolute-url"

export default function TrpcProvider({
    children
}: {
    children: ReactNode
}) {
    const [queryClient] = useState<QueryClient>(() => new QueryClient());
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: `${getURL()}api/trpc`
            })
        ]
    }));

    return (
        <trpc.Provider
            client={trpcClient}
            queryClient={queryClient}
        >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
        
    )
}