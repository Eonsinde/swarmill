"use client"
import { memo, useState } from "react"
import { Document, Page } from "react-pdf"
import SimpleBar from "simplebar-react"
import { Expand, Loader2 } from "lucide-react"
import { useResizeDetector } from "react-resize-detector"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
    url: string
}

const PDFFullScreen = ({ url }: Props) => {
    const { toast } = useToast();
    const { ref, width } = useResizeDetector();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>();
    
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v)
                    setIsOpen(v)
            }}
        >
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild
            >
                <Button
                    className="gap-1.5"
                    variant="ghost"
                    aria-label="full screen"
                >
                    <Expand className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full">
                <SimpleBar
                    className="max-h-[calc(100vh-10rem)] mt-6"
                    autoHide={false}
                >
                    <div ref={ref}>
                        <Document
                            className="max-h-full"
                            file={url}
                            loading={
                                <div className="flex justify-center items-center">
                                    <Loader2 className="my-24 h-6 w-6 text-muted-foreground animate-spin" />
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: "Issues loading PDF",
                                    description: "Please try again or reload page",
                                    variant: "destructive"
                                })
                            }}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            {new Array(numPages).fill(0).map((_, i) => (
                                <Page
                                    key={i}
                                    width={width ?? 1}
                                    pageNumber={i + 1}
                                />
                            ))}
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    );
}
 
export default memo(PDFFullScreen)