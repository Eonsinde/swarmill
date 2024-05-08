"use client"
import { useCallback, useEffect, useState } from "react"
import { Document, Page } from "react-pdf"
import { VariableSizeList as List } from "react-window"
import { asyncMap } from "@wojtekmaj/async-array-utils"
import { Expand, Loader2 } from "lucide-react"
import { useResizeDetector } from "react-resize-detector"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const Row = ({ style, width, index }: { style: any, width: number, index: number }) => {
    return (
        <div style={style}>
            <Page
                pageIndex={index}
                width={width}
            />
        </div>
    )
}

type Props = {
    url: string
    activePageIndex: number
}

const PDFOptimizedFullScreen = ({ url, activePageIndex }: Props) => {
    const { toast } = useToast();
    const { ref, width } = useResizeDetector();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [pdf, setPdf] = useState<any>(null);
    const [pageViewports, setPageViewports] = useState<any>(null);

    /**
     * React-Window cannot get item size using async getter, therefore we need to
     * calculate them ahead of time.
     */
    useEffect(() => {
        setPageViewports(null);

        if (!pdf) {
            return;
        }

        (async () => {
            const pageNumbers = Array.from(new Array(pdf.numPages)).map(
                (_, index) => index + 1
            );

            const nextPageViewports = await asyncMap(pageNumbers, (pageNumber) =>
                pdf.getPage(pageNumber).then((page: any) => page.getViewport({ scale: 1 }))
            );

            setPageViewports(nextPageViewports);
        })();
    }, [pdf]);

    const onDocumentLoadSuccess = (nextPdf: any) => {
        setPdf(nextPdf);
    }

    const getPageHeight = useCallback((pageIndex: number) => {
        if (!pageViewports) {
            throw new Error("getPageHeight() called too early");
        }

        const pageViewport = pageViewports[pageIndex];
        const scale = width! / pageViewport.width;
        const actualHeight = pageViewport.height * scale;

        return actualHeight;
    }, [pageViewports, width]);

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
                        
                        {pdf && pageViewports ? (
                            <List
                                width={width!}
                                height={500 * 1.6}
                                estimatedItemSize={500 * 1.6}
                                itemCount={pdf.numPages}
                                itemSize={getPageHeight}
                                initialScrollOffset={(860 * 2) * activePageIndex}
                            >
                                {({ index, style }) => (
                                    <Row
                                        style={style}
                                        width={width!}
                                        index={index}
                                    />
                                )}
                            </List>
                        ) : null}
                    </Document>
                </div>
            </DialogContent>
        </Dialog>
    )
}
 
export default PDFOptimizedFullScreen