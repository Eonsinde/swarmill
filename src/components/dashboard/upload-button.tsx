"use client"
import useModalStore from "@/hooks/use-modal-store"
import { Button } from "@/components/ui/button"

const UploadButton = () => {
    const { onOpen } = useModalStore();

    return (
        <Button
            variant="primary"
            onClick={() => onOpen("uploadModal")}
        >
            Upload PDF
        </Button>
    )
}
 
export default UploadButton;