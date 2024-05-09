"use client"
import { useMemo, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { useResizeDetector } from "react-resize-detector"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import SimpleBar from "simplebar-react"
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PDFOptimizedFullScreen from "@/components/dashboard/pdf-optimized-full-screen"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import "simplebar-react/dist/simplebar.min.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

type Props = {
    url: string
}

const PDFRenderer = ({ url }: Props) => {
    const { toast } = useToast();

    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [renderedScale, setRenderedScale] = useState<number | null>(null);
    // transforms
    const [pageScale, setPageScale] = useState<number>(1);
    const [pageRotation, setPageRotation] = useState<number>(0);

    const isLoading = useMemo(() => renderedScale !== pageScale, [renderedScale, pageScale]);

    const CustomPageValidator = useMemo(() => 
        z.object({
            page: z.string().refine(num => Number(num) > 0 && Number(num) <= numPages!)
        })
    , [numPages]);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof CustomPageValidator>>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(CustomPageValidator)
    });

    const { ref, width } = useResizeDetector();

    const onDocumentLoadSuccess = ({ numPages: pNumPages }: { numPages: number }) => {
        setNumPages(pNumPages)
    }

    const onSubmit = ({ page }: z.infer<typeof CustomPageValidator>) => {
        setCurrentPage(Number(page))
        setValue("page", String(page))
    }

    return (
        <div className="w-full bg-secondary flex flex-col items-center shadow rounded-md">
            <div className="h-14 w-full px-2 flex justify-between items-center border-b border-border">
                <div className="hidden md:flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        aria-label="previous page"
                        disabled={currentPage <= 1}
                        onClick={() => {
                            setCurrentPage(prev => (prev - 1 > 1) ? prev - 1 : 1)
                            setValue("page", String(currentPage - 1))
                        }}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register("page")}
                            className={cn(
                                "h-8 w-12",
                                errors?.page && "focus-visible:ring-red-500"
                            )}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    handleSubmit(onSubmit)()
                            }}
                        />
                        <p className="text-muted-foreground text-sm space-x-1">
                            <span>/</span>
                            <span>{numPages ?? "x"}</span>
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        aria-label="next page"
                        disabled={!numPages || currentPage >= numPages!}
                        onClick={() => {
                            setCurrentPage(prev => (prev + 1 > numPages!) ? numPages! : prev + 1)
                            setValue("page", String(currentPage + 1))
                        }}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
                <div className="w-full md:w-auto flex justify-between items-center space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="gap-1.5"
                                aria-label="zoom"
                                variant="ghost"
                            >
                                <Search className="h-4 w-4" />
                                {pageScale * 100}%
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setPageScale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPageScale(1.5)}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPageScale(2)}>
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPageScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div>
                        <Button
                            onClick={() => setPageRotation(prev => prev + 90)}
                            variant="ghost"
                            aria-label="rotate by 90Degs"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <PDFOptimizedFullScreen
                            url={url}
                            activePageIndex={currentPage-1}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 max-h-screen w-full">
                <SimpleBar
                    className="max-h-[calc(100vh-10rem)]"
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
                            {isLoading && renderedScale ? (
                                <Page
                                    key={`@${renderedScale}`}
                                    width={width ?? 1}
                                    pageNumber={currentPage}
                                    scale={renderedScale}
                                    rotate={pageRotation}
                                />
                            ) : null}
                            <Page
                                key={`@${pageScale}`}
                                className={cn(isLoading ? "hidden" : "")}
                                width={width ?? 1}
                                pageNumber={currentPage}
                                scale={pageScale}
                                rotate={pageRotation}
                                loading={
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="my-24 h-6 w-6 text-muted-foreground animate-spin" />
                                    </div>
                                }
                                onRenderSuccess={() => setRenderedScale(pageScale)}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>
            <div className="h-14 w-full px-2 flex md:hidden justify-center items-center border-t border-border">
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        aria-label="previous page"
                        disabled={currentPage <= 1}
                        onClick={() => {
                            setCurrentPage(prev => (prev - 1 > 1) ? prev - 1 : 1)
                            setValue("page", String(currentPage - 1))
                        }}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register("page")}
                            className={cn(
                                "h-8 w-12",
                                errors?.page && "focus-visible:ring-red-500"
                            )}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    handleSubmit(onSubmit)()
                            }}
                        />
                        <p className="text-muted-foreground text-sm space-x-1">
                            <span>/</span>
                            <span>{numPages ?? "x"}</span>
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        aria-label="next page"
                        disabled={!numPages || currentPage >= numPages!}
                        onClick={() => {
                            setCurrentPage(prev => (prev + 1 > numPages!) ? numPages! : prev + 1)
                            setValue("page", String(currentPage + 1))
                        }}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
 
export default PDFRenderer