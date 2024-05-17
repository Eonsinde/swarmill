"use client"
import Image from "next/image"

const NotFound = () => {
    return (
        <div className="min-h-[calc(100vh-56px)] flex justify-center items-center overflow-hidden">
            <div className="flex flex-col justify-center items-center space-y-2 text-center">
                <Image
                    src={"/svgs/not-found.svg"}
                    height={400}
                    width={400}
                    alt="logo"
                />
                <h2 className="mt-1 font-bold text-4xl md:text-5xl">
                    Wrong Route!
                </h2>
                <p className="mt-2 text-base md:text-lg text-muted-foreground">
                    The page you requested isn&apos;t available on our server
                </p>
            </div>
        </div>
    )
}
 
export default NotFound