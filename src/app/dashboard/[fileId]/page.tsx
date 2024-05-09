import { notFound, redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { db } from "@/lib/db"
import Redirect from "@/components/redirect"
import PDFRenderer from "@/components/dashboard/pdf-renderer"
import ChatWrapper from "@/components/dashboard/chat/chat-wrapper"

type Props = {
    params: {
        fileId: string
    }
}

const FileDetails = async ({ params: { fileId } }: Props) => {
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
        return redirect(`/auth-callback?origin=dashboard/${fileId}`);

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            ownerId: kindleUser.id
        }
    });

    if (!file) notFound();

    return (
        <div className="min-h-[calc(100vh-56px)] flex flex-col justify-between">
            <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
                {/* left side */}
                <div className="flex-1 xl:flex">
                    <div className="py-6 px-4 md:px-6 lg:pl-8 xl:pl-6 xl:flex-1">
                        <PDFRenderer url={file.url} />
                    </div>
                </div>
                {/* right side */}
                <div className="shrink-0 flex-[0.75] xl:w-96 border-t border-border lg:border-[1px] lg:border-t-0">
                    <ChatWrapper fileId={file.id} />
                </div>
            </div>
        </div>
    )
}
 

export default FileDetails