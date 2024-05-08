"use client"
import { useMemo } from "react"
import useModalStore from "@/hooks/use-modal-store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog"
import FileUpload from "@/components/file-upload"
 
const UploadModal = () => {
    const { isOpen, type, onClose } = useModalStore();

    const isOpened = useMemo(() => isOpen && type === "uploadModal", [isOpen, type]);

    return (
        <Dialog
            open={isOpened}
            onOpenChange={onClose}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader />
                <FileUpload  />
            </DialogContent>
        </Dialog>
    );
}
 
export default UploadModal;