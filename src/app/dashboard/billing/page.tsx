import { format } from "date-fns"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import BillingButton from "@/components/billing/billing-button"

const billing = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan();

    return (
        <MaxWidthWrapper className="max-w-5xl mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>
                        You are currently on the {" "}
                        <strong>{subscriptionPlan.name}</strong> plan.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                    <BillingButton subscriptionPlan={subscriptionPlan} />
                    {subscriptionPlan.isSubscribed ? (
                        <p className="text-xs font-medium">
                            {subscriptionPlan.isCanceled
                            ? "Your plan will be canceled on: "
                            : "Your plan renews on: "}
                            {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}.
                        </p>
                    ) : null}
                </CardFooter>
            </Card>
        </MaxWidthWrapper>
    )
}
 
export default billing