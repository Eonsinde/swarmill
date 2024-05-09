"use client"
import { useState, useMemo, forwardRef } from "react"
import { twMerge } from "tailwind-merge"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { useRouter } from "next/navigation"
import useModalStore from "@/hooks/use-modal-store"
import { trpc } from "@/app/_trpc/client"
import { useUploadThing } from "@/lib/uploadthing"
import { Cloud, File, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { MAX_FILE_SIZE_FREE, MAX_FILE_SIZE_PRO } from "@/config/constants"

const variants = {
    base: "relative rounded-md flex flex-col justify-center items-center bg-muted/20 hover:bg-muted/30 border-[1px] border-dashed border-input transition-colors duration-200 ease-in-out cursor-pointer",
    image:
      "border-0 p-0 min-h-0 min-w-0 relative shadow-md bg-background rounded-md",
    active: "border-2",
    disabled:
      "bg-muted/10 border-muted cursor-default pointer-events-none",
    accept: "border border-rose-600 bg-rose-600 bg-opacity-10",
    reject: "border border-rose-700 bg-rose-700 bg-opacity-10",
};

const ERROR_MESSAGES = {
    fileTooLarge(maxSize: number) {
        return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
    },
    fileInvalidType() {
        return "Invalid file type.";
    },
    tooManyFiles(maxFiles: number) {
        return `You can only add ${maxFiles} file(s).`;
    },
    fileNotSupported() {
        return "The file is not supported.";
    }
};

type Props = {
    className?: string
    width?: number
    height?: number
    label?: string
    disabled?: boolean
    dropzoneOptions?: Omit<DropzoneOptions, "disabled">
}

const FileUpload = forwardRef<HTMLInputElement, Props>(({
    className,
    height=250,
    width,
    label,
    disabled,
    dropzoneOptions,
}: Props, ref) => {
    const router = useRouter();
    // user's subscription info is present in the data object
    const { data, onClose } = useModalStore();

    const { mutate: pollingMutate } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file?.id}`);
            onClose();
        },
        retry: true,
        retryDelay: 500
    });

    const { startUpload } = useUploadThing(data?.isSubscribed ? "proPDFUploader" : "freePDFUploader");

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isUploadError, setIsUploadError] = useState<boolean>(false);

    const startSimulatedProgress = () => {
        // to simulate progress for progress bar
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval);
                    return prevProgress;
                }

                return prevProgress + 5;
            })
        }, 500);

        return interval;
    }

    // dropzone configuration
    const {
        getRootProps,
        getInputProps,
        acceptedFiles,
        fileRejections,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: { "application/pdf": [] },
        multiple: false,
        disabled: disabled || isUploading,
        onFileDialogOpen: () => {
            setIsUploadError(false);
        },
        onDrop: async (acceptedFiles) => {
            // reset is upload error incase
            setIsUploadError(false);
            setIsUploading(true);

            const progressInterval = startSimulatedProgress();

            // the upload-thing core will help create the file after uploading it
            const res = await startUpload(acceptedFiles);

            if (!res) {
                setIsUploadError(true);
                setIsUploading(false);
                return;
            }

            if (!res[0]?.key) {
                setIsUploadError(true);
                setIsUploading(false);
                return;
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            // get the file that was created using the key, and redirect user
            pollingMutate({ key: res[0].key });
        },
        ...{
            ...dropzoneOptions,
            maxSize: data?.isSubscribed ? (MAX_FILE_SIZE_PRO * 1024 * 1024) : (MAX_FILE_SIZE_FREE * 1024 * 1024)
        }
    });

    // styling
    const dropZoneClassName = useMemo(
        () =>
            twMerge(
                variants.base,
                isFocused && variants.active,
                (disabled || isUploading) && variants.disabled,
                (isDragReject ?? fileRejections[0]) && variants.reject,
                isDragAccept && variants.accept,
                className
            ).trim(),
        [
            isFocused,
            fileRejections,
            isDragAccept,
            isDragReject,
            disabled,
            isUploading,
            className
        ]
    );

    // error validation messages
    const errorMessage = useMemo(() => {
        if (fileRejections[0]) {
            const { errors } = fileRejections[0];

            if (errors[0]?.code === 'file-too-large') {
                return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? data?.isSubscribed ? (MAX_FILE_SIZE_PRO * 1024 * 1024) : (MAX_FILE_SIZE_FREE * 1024 * 1024));
            } else if (errors[0]?.code === 'file-invalid-type') {
                return ERROR_MESSAGES.fileInvalidType();
            } else if (errors[0]?.code === 'too-many-files') {
                return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
            } else {
                return ERROR_MESSAGES.fileNotSupported();
            }
        } else if (isUploadError) {
            return "Something went wrong";
        }
        
        return undefined;
    }, [fileRejections, dropzoneOptions, isUploadError, data]);

    return (
        <div>
            <div
                {...getRootProps({
                    className: dropZoneClassName,
                    style: {
                        width: width ?? "100%",
                        height
                    }
                })}
            >
                {/* Main File Input */}
                <input
                    ref={ref}
                    {...getInputProps()}
                />
                {/* upload box */}
                <div className="relative flex flex-col justify-center items-center space-y-4">
                    <div className="flex flex-col justify-center items-center space-y-2 ">
                        <Cloud className="h-10 w-10  text-foreground" />
                        {label && <div className="text-sm">{label}</div>}
                        <div className="text-foreground">
                            <span className="font-semibold">Click to upload</span> or Drag & Drop
                        </div>
                        {/* TODO: dynamically set this based on user's subscription plan */}
                        <p className="text-sm text-muted-foreground">PDF (up to {data?.isSubscribed ? "16" : "4"}MB)</p>
                    </div>
                    {(acceptedFiles && acceptedFiles[0]) ? (
                        <div className="max-w-xs bg-muted/40 flex items-center divide-x divide-border rounded-md overflow-hidden">
                            <div className="py-2 px-3 h-full grid place-items-center">
                                <File className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="py-2 px-3 h-full text-sm truncate">
                                {acceptedFiles[0].name}
                            </div>
                        </div>
                    ): null}
                    {/* Error Text */}
                    {(errorMessage && !isUploading) && <div className="mt-1 text-sm text-rose-500">{errorMessage}</div>}
                </div>
                {/* progress bar */}
                {(isUploading && !isUploadError) && (
                    <>
                        <div className="mt-4 w-full max-w-xs mx-auto">
                            <Progress
                                className="h-1 w-full text-rose-600"
                                value={uploadProgress}
                                indicatorColor={(uploadProgress === 100) ? "bg-green-500" : ""}
                            />
                        </div>
                        {(uploadProgress === 100) && (
                            <div className="mt-2 flex justify-center items-center gap-1 text-sm text-center text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Redirecting...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
})

FileUpload.displayName = "FileUpload"

function formatFileSize(bytes?: number) {
    if (!bytes) {
        return '0 Bytes';
    }
    
    bytes = Number(bytes);
    
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
 
export default FileUpload;