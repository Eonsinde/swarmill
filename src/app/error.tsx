"use client"
import Image from "next/image"

const Error = () => {
    return (
        <div className="h-[calc(100vh-56rem)] overflow-hidden">
            <div className="flex flex-col space-y-2 text-center">
                <Image
                    className="bg-rose-600"
                    src={"/svgs/swarmill.svg"}
                    height={500}
                    width={500}
                    alt="logo"
                />
                <h2 className="mt-1 font-bold text-4xl sm:text-5xl">
                    Wrong Adress Hit!
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    The page you requested isn't available on our server lad
                </p>
            </div>
        </div>
    )
}
 
export default Error