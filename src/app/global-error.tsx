"use client"
import { useEffect } from "react"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error]);
    
    return (
        <div className="min-h-[calc(100vh-56px)] flex justify-center items-center overflow-hidden">
            <div className="flex flex-col justify-center items-center space-y-4 text-center">
                <Image
                    src={"/svgs/error.svg"}
                    height={300}
                    width={300}
                    alt="logo"
                />
                <h2 className="mt-1 font-bold text-4xl sm:text-5xl">
                    Something went wrong!
                </h2>
                <button
                    className={buttonVariants({
                        variant: "ghost",
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