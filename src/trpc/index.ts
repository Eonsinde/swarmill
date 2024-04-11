// holds the appRouter and our procedures(routes)
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { db } from "@/lib/db"
import { privateProcedure, publicProcedure, router } from "./trpc"

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
    })
});

export type AppRouter = typeof appRouter