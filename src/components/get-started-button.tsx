"use client"
import { useRouter } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import useModalStore from "@/hooks/use-modal-store"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const GetStartedButton = () => {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useKindeBrowserClient();
    const { onOpen } = useModalStore();

    return (
        <Button
            className="mt-5"
            size="lg"
            onClick={() => isAuthenticated ? router.push("/dashboard") : onOpen("authModal")}
            disabled={isLoading!}
        >
            {isAuthenticated ? (
                <>
                    Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </>
            ) : (
                <>
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </>
            )}
            
        </Button>
    )
}
 
export default GetStartedButton