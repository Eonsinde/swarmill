"use client"
import { useEffect } from "react"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("\n\n\nCaught by global error page: ", error)
    }, [error]);

    return (
        <div className="min-h-[calc(100vh-56px)] flex justify-center items-center overflow-hidden">
            <div className="flex flex-col items-center space-y-5 text-center">
                <Image
                    src={"/svgs/error.svg"}
                    height={300}
                    width={300}
                    alt="logo"
                />
                <h2 className="mt-1 font-bold text-2xl sm:text-3xl md:text-5xl text-center">
                    Something went wrong!
                </h2>
                <button
                    className={buttonVariants({
                        variant: "outline",
                        size: "lg"
                    })}
                    onClick={() => reset()}
                >
                    Try again
                </button>
            </div>
        </div>
    )
}