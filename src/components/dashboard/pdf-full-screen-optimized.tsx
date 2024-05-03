"use client"
import { memo, useState, useCallback, useEffect, useRef } from "react"
import { Document, Page } from "react-pdf"
import SimpleBar from "simplebar-react"
import SimpleBarCore from "simplebar-core"
import { Expand, Loader2 } from "lucide-react"
import { useResizeDetector } from "react-resize-detector"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const FakePage = memo(({ width, numPages }: { width: number, numPages: number }) => {
    return (
        <div className="hidden">
            {Array.from(
                new Array(numPages),
                (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        width={width}
                        className="pdfPage"
                        renderMode="svg"
                        pageNumber={index + 1}
                    />
                ),
            )}
        </div>
    )
})

type Props = {
    url: string
    activePageNumber: number
}

const PDFFullScreenOptimized = ({ url, activePageNumber }: Props) => {
    const { toast } = useToast();
    const { ref, width } = useResizeDetector();

    const simpleBarRef = useRef<SimpleBarCore>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        simpleBarRef?.current?.el?.addEventListener("wheel", onScrollPDF);

        return () => simpleBarRef?.current?.el?.removeEventListener("wheel", onScrollPDF);
    }, [numPages]);
    
    const scrollToPreviousPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage, numPages]);

    const scrollToNextPage = useCallback(() => {
        if (currentPage < numPages!) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, numPages]);

    const onScrollPDF = useCallback((event: HTMLElementEventMap["wheel"]) => {
        let delta = null;

        if (event.deltaY) {
            delta = event.deltaY;
        } else {
            delta = -1 * event.deltaY;
        }

        console.log(
            "Delta",
            delta,
        );

        // This is where some customization can happen
        // if (delta < -50) {
        //     scrollToPreviousPage();
        // } else if (delta > 50) {
        //     scrollToNextPage();
        // }
    }, []);
    
    const onDocumentLoadSuccess = useCallback(({ numPages: pNumPages }: { numPages: number }) => {
        setCurrentPage(activePageNumber);
        setNumPages(pNumPages);
    }, [activePageNumber]);

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
                    ref={simpleBarRef}
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
                            <Page
                                key={`@_${currentPage}`}
                                width={width ?? 1}
                                pageNumber={currentPage}
                            />
                            <FakePage
                                width={width ?? 1}
                                numPages={numPages!}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    );
}
 
export default memo(PDFFullScreenOptimized)