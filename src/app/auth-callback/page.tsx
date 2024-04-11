"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../_trpc/client"
import useModalStore from "@/hooks/use-modal-store"
import { BarLoader } from "react-spinners"

const AuthCallback = () => {
    const router = useRouter();
    const { onOpen } = useModalStore()

    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");

    const { data, isError, error } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500
    });

    if (isError) {
        if (error.data?.code === "UNAUTHORIZED") {
            router.push("/");
            onOpen("authModal");
        }
    }
        
    if (data?.success)
        return router.push(origin ? `/${origin}` : "dashboard")

    return (
        <div className="min-h-[calc(100vh-56px)] w-full flex flex-col justify-center items-center space-y-3 overflow-hidden">
            <BarLoader
                color="#e11d48"
                height={4}
                width={200}
            />
            <h3 className="text-lg md:text-xl font-semibold">Setting up your account</h3>
            <p>You will be redirected shorty...</p>
        </div>
    )
}
 
export default AuthCallback;