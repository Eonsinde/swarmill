import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { db } from "@/lib/db"
import Redirect from "@/components/redirect"
import Dashboard from "@/components/dashboard"

const page = async () => {
    const { getUser, isAuthenticated } = getKindeServerSession();

    if (!(await isAuthenticated()))
        return <Redirect route="/" />

    const kindleUser = await getUser();

    if (!kindleUser)
        return <Redirect route="/" />

    const authProfile = await db.profile.findFirst({
        where: {
            kindleUserId: kindleUser.id
        }
    });

    if (!authProfile)
        return redirect("/auth-callback");

    return (
        <Dashboard />
    );
}
 
export default page