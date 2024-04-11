"use client"
import { useState, useEffect } from "react"
import AuthModal from "@/components/modals/auth-modal"
import UploadModal from "@/components/modals/upload-modal"

const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted)
        return null

    return (
        <>
            <AuthModal />
            <UploadModal />
        </>
    );
}
 
export default ModalProvider;