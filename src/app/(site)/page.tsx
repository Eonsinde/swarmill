import Link from "next/link"
import Image from "next/image"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import GetStartedButton from "@/components/get-started-button"

const Home = () => {
    return (
        <>
            <MaxWidthWrapper className="flex flex-col justify-center items-center mb-12 mt-28 sm:mt-40 text-center">
                <div className="flex justify-center items-center space-x-2 max-w-fit mx-auto mb-4 py-2 px-7 bg-white hover:bg-white-50 border border-gray-200 hover:border-gray-300 shadow-md backdrop-blur rounded-full overflow-hidden transition-all">
                    <p className="text-sm font-semibold text-gray-700">
                        Swarmill is now active!
                    </p>
                </div>
                <h1 className="max-w-4xl font-bold text-5xl md:text-6xl lg:text-7xl">
                    Have a chat with your <span className="text-rose-600">Documents</span> in seconds
                </h1>
                <p className="mt-5 max-w-prose sm:text-lg text-muted-foreground">
                    Smarmill allows you to have conversations with any PDF document. Simply upload your file and start asking question right away
                </p>
                <GetStartedButton />
            </MaxWidthWrapper>
            {/* value proposition section */}
            <div>
                <div className="relative isolate">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 -top-40 sm:-top-80 -z-10 blur-3xl transform-gpu overflow-hidden"
                    >
                        <div
                            style={{
                                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
                            }}
                            className="relative left-[calc(50%-11rem)] sm:left-[calc(50%-30rem)] aspect-[1155/678] w-[16.125rem] sm:w-[40.12rem] md:w-[50.125rem] lg:w-[72.1875rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b1] to-[#fcaa89] opactiy-20"
                        />
                    </div>
                    <div className="mx-auto max-w-6xl px-6 lg:px-8">
                        <div className="mt-16 sm:mt-24 flow-root">
                            <div className="bg-gray-900/5 -m-2 lg:-m-4 p-2 lg:p-4 ring-1 ring-inset ring-gray-900/10 rounded-xl">
                                <Image
                                    className="bg-background p-2 sm:p-8 md:p-10 lg:p-20 shadow-2xl ring-1 ring-gray-900/10 rounded-md"
                                    src="/images/chat-preview.png"
                                    alt="product preview"
                                    width={1628}
                                    height={869}
                                    quality={100}
                                />
                            </div>
                        </div>
                    </div>
                    <div aria-hidden="true" className="pointer-events-none absolute right-0 -bottom-40 sm:-bottom-80 -z-10 blur-3xl transform-gpu overflow-hidden">
                        <div
                            style={{
                                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
                            }}
                            className="relative left-[calc(50%-13rem)] sm:left-[calc(50%-36rem)] aspect-[1155/678] w-[16.125rem] sm:w-[40.12rem] md:w-[50.125rem] lg:w-[72.1875rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b1] to-[#fcaa89] opactiy-20"
                        />
                    </div>
                </div>
            </div>
            {/* feature section */}
            <div className="mx-auto max-w-5xl mb-32 mt-32 sm:mt-56">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="mt-2 font-bold text-4xl sm:text-5xl">
                        Start chatting in minutes
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Chatting to your PDF files has been easier than with Smarmill
                    </p>
                </div>
                {/* steps */}
                <ol className="my-8 pt-0 md:pt-8 md:px-6 lg:px-4 md:flex space-x-0 md:space-x-6 lg:space-x-12 space-y-4 md:space-y-0">
                    <li className="md:flex-1">
                        <div className="flex flex-col space-y-2 py-2 md:pb-0 md:pt-4 px-4 md:px-0 border-t-2 border-border">
                            <span className="text-sm font-medium text-rose-600">Step 1</span>
                            <span className="text-xl font-semibold">Get Started</span>
                            <span className="mt-2 text-secondary-foreground">
                                Sign up for an account to begin. Upgrade to{" "}
                                <Link
                                    className="text-rose-700 underline underline-offset-2"
                                    href="/pricing"
                                >
                                    pro plan
                                </Link>
                                {" "}for more access and features.
                            </span>
                        </div>
                    </li>
                    <li className="md:flex-1">
                        <div className="flex flex-col space-y-2 py-2 md:pb-0 md:pt-4 px-4 md:px-0 border-t-2 border-border">
                            <span className="text-sm font-medium text-rose-600">Step 2</span>
                            <span className="text-xl font-semibold">Upload your PDF file</span>
                            <span className="mt-2 text-secondary-foreground">
                                We&apos;ll process your file and make it ready for you to converse with.
                            </span>
                        </div>
                    </li>
                    <li className="md:flex-1">
                        <div className="flex flex-col space-y-2 py-2 md:pb-0 md:pt-4 px-4 md:px-0 border-t-2 border-border">
                            <span className="text-sm font-medium text-rose-600">Step 3</span>
                            <span className="text-xl font-semibold">Start asking questions</span>
                            <span className="mt-2 text-secondary-foreground">
                                It&apos;s that simple. Try out Smarmill today - response time is really great
                            </span>
                        </div>
                    </li>
                </ol>
                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                    <div className="mt-16 sm:mt-24 flow-root">
                        <div className="bg-gray-900/5 -m-2 lg:-m-4 p-2 lg:p-4 ring-1 ring-inset ring-gray-900/10 rounded-xl">
                            <Image
                                className="bg-background rounded-md"
                                src="/images/upload-preview.png"
                                alt="uploading preview"
                                width={1684}
                                height={857}
                                quality={100}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default Home