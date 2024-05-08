// holds the appRouter and our procedures(routes)
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { db } from "@/lib/db"
import { privateProcedure, publicProcedure, router } from "./trpc"
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe"
import { getURL } from "@/lib/absolute-url"
import { QUERY_LIMIT } from "../config/constants"
import { PLANS } from "@/config/payment-plans"

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession();
        const kindleUser = await getUser();

        if (!kindleUser)
            throw new TRPCError({ code: "UNAUTHORIZED" });

        // check if user is in the database
        const user = await db.profile.findFirst({
            where: {
                kindleUserId: kindleUser.id
            }
        });

        if (!user) {
            // create new user instance
            await db.profile.create({
                data: {
                    kindleUserId: kindleUser.id,
                    email: kindleUser.email!,
                    imageUrl: kindleUser.picture!,
                    name: kindleUser.given_name + " " + kindleUser.family_name
                }
            })
        }

        return { success: true }
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { kindleUserId } = ctx;

        return await db.file.findMany({
            where: {
                ownerId: kindleUserId
            }
        });
    }),
    getFileUploadStatus: privateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const file = await db.file.findFirst({
            where: {
                id: input.id,
                ownerId: ctx.kindleUserId
            }
        });

        if (!file) return { status: "PENDING" as const }

        return { status: file.uploadStatus }
    }),
    getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
        const { kindleUserId } = ctx;

        const existingFile = db.file.findFirst({
            where: {
                key: input.key,
                ownerId: kindleUserId
            }
        });

        if (!existingFile) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

        return existingFile;
    }),
    deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const { kindleUserId } = ctx;

        const file = await db.file.findFirst({
            where: {
                id: input.id,
                ownerId: kindleUserId
            }
        });

        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

        await db.file.delete({
            where: {
                id: input.id
            }
        });

        return file;
    }),
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string()
            })
        )
        .query(async ({ ctx, input }) => {
            const { kindleUserId } = ctx;
            const { fileId, cursor } = input;

            const limit = input.limit ?? QUERY_LIMIT;

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    ownerId: kindleUserId
                }
            });

            if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

            const messages = await db.message.findMany({
                where: {
                    fileId
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    text: true,
                    isUserMessage: true,
                    createdAt: true
                }
            });

            let nextCursor: typeof cursor | undefined = undefined;

            if (messages.length > limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            return {
                messages,
                nextCursor
            }
        }),
    createStripeCheckoutSession: privateProcedure
        .input(z.object({ cancel_url: z.string().nullish() }).nullish())
        .mutation(async ({ ctx, input }) => {
            const { kindleUserId } = ctx;

            // const cancel_url = input?.cancel_url ? absoluteUrl(input?.cancel_url) : null;
            // const billingUrl = absoluteUrl("/dashboard/billing");

            const cancel_url = input?.cancel_url ? `${getURL()}${input?.cancel_url}` : null;
            const billingUrl = `${getURL()}dashboard/billing`;

            const authProfile = await db.profile.findFirst({
                where: {
                    kindleUserId
                }
            });

            if (!authProfile) throw new TRPCError({ code: "UNAUTHORIZED" });

            const subscriptionPlan = await getUserSubscriptionPlan();

            if (subscriptionPlan.isSubscribed && authProfile.stripeCustomerId) {
                // redirect user to billing page since they have an active subscription already
                const stripeSession = await stripe.billingPortal.sessions.create({
                    customer: authProfile.stripeCustomerId,
                    return_url: cancel_url ?? billingUrl
                });

                return { url: stripeSession.url }
            }

            const stripeSession = await stripe.checkout.sessions.create({
                success_url: billingUrl,
                cancel_url: cancel_url ?? billingUrl,
                payment_method_types: ["card", "paypal"],
                mode: "subscription",
                billing_address_collection: "auto",
                line_items: [
                    {
                        price: PLANS.find(plan => plan.name === "Pro")?.pricing.priceIds.test,
                        quantity: 1
                    }
                ],
                metadata: {
                    kindleUserId
                }
            });

            return { url: stripeSession.url }
        })
});

export type AppRouter = typeof appRouter