"use client"
import { useState } from "react"
import { Expand } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PDFFullScreen = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v)
                    setIsOpen(v)
            }}
        >
            <DialogTrigger>
                <Button
                    className="gap-1.5"
                    variant="ghost"
                    aria-label="full screen"
                >
                    <Expand className="h-4 w-4" />
                </Button>
            </DialogTrigger>
        </Dialog>
    );
}
 
export default PDFFullScreen;