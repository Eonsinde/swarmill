"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useModalStore from "@/hooks/use-modal-store"

const Redirect = ({
    route,
    openAuth=true
}: {
    route: string,
    openAuth?: boolean
}) => {
    const router = useRouter();
    const { onOpen } = useModalStore();

    useEffect(() => {
        router.replace(route);

        if (openAuth)
            onOpen("authModal");
    }, []);

    return <></>
}
 
export default Redirect