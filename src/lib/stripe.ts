import Stripe from "stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { PLANS } from "@/config/payment-plans"
import { db } from "@/lib/db" 

export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? "",
    {
        apiVersion: "2024-04-10",
        appInfo: {
            name: "Swarmill",
            version: "0.1.0"
        },
        typescript: true,
    }
);

export async function getUserSubscriptionPlan() {
    const { getUser } = getKindeServerSession();
    const kindleUser = await getUser();

    if (!kindleUser) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null,
        }
    }

    const authProfile = await db.profile.findFirst({
        where: {
            kindleUserId: kindleUser.id,
        }
    });

    if (!authProfile) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null
        }
    }

    const isSubscribed = Boolean(
        authProfile.stripePriceId &&
        authProfile.stripeCurrentPeriodEnd && // 86400000 = 1 day
        authProfile.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    );

    const plan = isSubscribed
        ? PLANS.find((plan) => plan.pricing.priceIds.test === authProfile.stripePriceId)
        : null

    let isCanceled = false;

    if (isSubscribed && authProfile.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
            authProfile.stripeSubscriptionId
        );

        isCanceled = stripePlan.cancel_at_period_end;
    }

    return {
        ...plan,
        stripeSubscriptionId: authProfile.stripeSubscriptionId,
        stripeCurrentPeriodEnd: authProfile.stripeCurrentPeriodEnd,
        stripeCustomerId: authProfile.stripeCustomerId,
        isSubscribed,
        isCanceled
    }
}