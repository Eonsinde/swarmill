import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"
import { PLANS } from "@/config/payment-plans"
import { Check, HelpCircle, Minus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import UpgradeButton from "@/components/pricing/upgrade-button"
import { getUserSubscriptionPlan } from "@/lib/stripe"

const page = async () => {
    const { getUser } = getKindeServerSession();
    const kindleUser = await getUser();

    let authProfile = undefined;

    if (kindleUser)
        authProfile = await db.profile.findFirst({
            where: {
                kindleUserId: kindleUser.id
            }
        });

    if (kindleUser && !authProfile) // only if one is auth and doesn't have a profile should they be redirected
        return redirect(`/auth-callback?origin=pricing`);

    let subscriptionPlan = undefined;

    if (authProfile)
        subscriptionPlan = await getUserSubscriptionPlan();

    const pricingItems = [
        {
            plan: "Free",
            tagline: "For small side projects.",
            quota: 10,
            features: [
                {
                    text: "25 pages per PDF",
                    footNote:
                    "The maximum amount of pages per PDF-file.",
                },
                {
                    text: "4MB file size limit",
                    footNote:
                    "The maximum file size of a single PDF file.",
                },
                {
                    text: "Mobile-friendly interface",
                },
                {
                    text: "Higher-quality responses",
                    footNote:
                    "Better algorithmic responses for enhanced content quality",
                    negative: true,
                },
                {
                    text: "Priority support",
                    negative: true,
                }
            ]
        },
        {
            plan: "Pro",
            tagline: "For larger projects with higher needs.",
            quota: PLANS.find((p) => p.slug === "pro")!.quota,
            features: [
                {
                    text: "100 pages per PDF",
                    footNote:
                    "The maximum amount of pages per PDF-file.",
                },
                {
                    text: "16MB file size limit",
                    footNote:
                    "The maximum file size of a single PDF file.",
                },
                {
                    text: "Mobile-friendly interface",
                },
                {
                    text: "Higher-quality responses",
                    footNote:
                    "Better algorithmic responses for enhanced content quality",
                },
                {
                    text: "Priority support",
                }
            ]
        }
    ]

    return (
        <MaxWidthWrapper className="max-w-5xl my-24 text-center">
            <div className="sm:max-w-lg mx-auto mb-10">
                <h3 className="text-4xl md:text-5xl lg:text-7xl font-semibold">
                    Pricing
                </h3>
                <p className="mt-5 text-muted-foreground text-base sm:text-lg">
                    Whether you&apos;re just trying out our service or need more,
                    we&apos;ve got you covered.
                </p>
            </div>
            <div className="pt-12 flex flex-col lg:flex-row lg:items-start gap-10">
                <TooltipProvider>
                    {pricingItems.map(({ plan, tagline, quota, features }) => {
                        const price = PLANS.find(p => p.slug === plan.toLowerCase())?.pricing.amount || 0

                        return (
                            <div
                                key={plan}
                                className={cn(
                                    "flex-1 relative bg-secondary shadow-lg rounded-2xl",
                                    {
                                        "border-2 border-rose-600": plan === "Pro",
                                        "border border-border": plan !== "Pro"
                                    }
                                )}
                            >
                                {plan === "Pro" && (
                                    <div className="absolute -top-5 left-0 right-0 w-32 mx-auto py-2 px-3 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-pink-600 rounded-full">
                                        Upgrade now
                                    </div>
                                )}
                                <div className="p-5">
                                    <h3 className="my-3 text-center text-3xl font-bold">
                                        {plan}
                                    </h3>
                                    <p className="text-muted-foreground">{tagline}</p>
                                    <p className="my-5 text-5xl font-semibold">${price}</p>
                                    <p className="text-muted-foreground">per month</p>
                                </div>
                                <div className="h-20 flex justify-center items-center border-y border-border">
                                    <div className="flex items-center space-x-1">
                                        <p>{quota.toLocaleString()} PDFs/mo included</p>
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger className="cursor-default ml-1.5">
                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-80 p-2">
                                                How many PDFs you can upload per month
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <ul className="my-5 px-5 md:px-8 space-y-5">
                                    {features.map(({ text, footNote, negative }) => (
                                        <li
                                            key={text}
                                            className="flex space-x-5"
                                        >
                                            <div className="flex-shrink-0">
                                                {negative ? (
                                                    <Minus className="h-6 w-6 text-accent-foreground" />
                                                ) : (
                                                    <Check className="h-6 w-6 text-rose-600" />
                                                )}
                                            </div>
                                            {footNote ? (
                                                <div className="flex items-center space-x-1">
                                                    <p
                                                        className={cn(
                                                            "text-accent-foreground",
                                                            {
                                                                "text-muted-foreground": negative
                                                            }
                                                        )}
                                                    >
                                                        {text}
                                                    </p>
                                                    <Tooltip delayDuration={300}>
                                                        <TooltipTrigger className="cursor-default ml-1.5">
                                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="w-80 p-2">
                                                            {footNote}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <p
                                                    className={cn(
                                                        "text-accent-foreground",
                                                        {
                                                            "text-muted-foreground": negative
                                                        }
                                                    )}
                                                >
                                                    {text}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {/* TODO: check user's subscription to render active button */}
                                {kindleUser
                                ?
                                    subscriptionPlan?.isSubscribed
                                    ?
                                        (plan === "Pro")
                                        ?
                                        <div
                                            className="m-5 bg-primary text-primary-foreground h-10 py-2 px-4 flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
                                        >
                                            Active
                                        </div>
                                        :
                                        <></>
                                    :
                                        (plan === "Pro")
                                        ?
                                        <div className="p-5">
                                            <UpgradeButton isAuthenticated={!!kindleUser} />
                                        </div>
                                        :
                                        <div
                                            className="m-5 bg-primary text-primary-foreground h-10 py-2 px-4 flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
                                        >
                                            Active
                                        </div>
                                :
                                null}
                            </div>
                        )
                    })}
                </TooltipProvider>
            </div>
        </MaxWidthWrapper>
    )
}
 
export default page