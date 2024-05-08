"use client"
import { trpc } from "@/app/_trpc/client"
import { useToast } from "@/components/ui/use-toast"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const BillingButton = ({ subscriptionPlan }: Props) => {
    const { toast } = useToast();

    const checkoutMutation = trpc.createStripeCheckoutSession.useMutation({
        onSuccess: ({ url }) => {
            if (url) return window.location.href = url;
            if (!url) return toast({
                title: "Something went wrong",
                description: "Please retry in a moment..."
            });
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "Couldn't create checkout retry"
            });
        }
    });

    return (
        <Button
            onClick={() => checkoutMutation.mutate({ cancel_url: "dashboard/billing" })}
            disabled={checkoutMutation.isLoading}
        >
            {checkoutMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {subscriptionPlan.isSubscribed ? "Manage Subscription" : "Upgrade to Pro"}
        </Button>
    )
}
 
export default BillingButton