// create our trpc router
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { initTRPC, TRPCError } from "@trpc/server"

const t = initTRPC.create();

const isAuth = t.middleware(async (opts) => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return opts.next({
        ctx: {
            kindleUserId: user.id,
            kindleUser: user
        }
    });
});

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)