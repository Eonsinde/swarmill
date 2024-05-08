"use client"
import { trpc } from "@/app/_trpc/client"
import useModalStore from "@/hooks/use-modal-store"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
    isAuthenticated?: boolean
}

const UpgradeButton = ({ isAuthenticated }: Props) => {
    const { onOpen } = useModalStore();
    const { toast } = useToast();

    const checkoutMutation = trpc.createStripeCheckoutSession.useMutation({
        onSuccess: ({ url }) => {
            window.location.href = url ?? "/dashboard/billing"
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "Couldn't generate session, please retry"
            });
        }
    });

    // TODO: if user isn't authenticated, ensure user is redirected here after authentication

    return (
        <Button
            className="w-full"
            variant="primary"
            disabled={checkoutMutation.isLoading}
            onClick={() => !isAuthenticated ? onOpen("authModal") : checkoutMutation.mutate({ cancel_url: "pricing" })}
        >
            Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
        </Button>
    )
}
 
export default UpgradeButton