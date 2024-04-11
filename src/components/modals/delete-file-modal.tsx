"use client"
import { useMemo } from "react"
import useModalStore from "@/hooks/use-modal-store"
import { trpc } from "@/app/_trpc/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const DeleteFileModal = () => {
    const utils = trpc.useUtils();
    const { isOpen, type, data, onClose } = useModalStore();

    const isModalOpen = useMemo(() => isOpen && type === "deleteFile", [isOpen, type, data]);

    const { mutate: deleteMutate, isLoading } = trpc.deleteFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate();
            onClose();
        }
    });

    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={onClose}
        >
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Delete File</DialogTitle>
                    <DialogDescription>
                        Are you sure want to remove this file? <span className="font-semibold text-rose-600">{data?.name}</span> and your conversations will permanently be deleted
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="w-full flex justify-end items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => deleteMutate({ id: data.id })}
                            disabled={isLoading}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
 
export default DeleteFileModal