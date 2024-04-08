import Link from "next/link"
import Image from "next/image"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { buttonVariants } from "@/components/ui/button"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import { ArrowRight } from "lucide-react"

const Navbar = () => {
    return (
        <nav className="h-14 sticky top-0 inset-x-0 z-30 w-full border-b border-border backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="h-14 flex justify-between items-center">
                    <Link
                        className="z-40 flex items-center font-semibold"
                        href="/"
                    >
                        <Image
                            className="bg-rose-600"
                            src={"/svgs/swarmill.svg"}
                            height={30}
                            width={30}
                            alt="logo"
                        />
                        <span className="ml-1">Smarmill.</span>
                    </Link>
                    {/* TODO: add mobile navbar */}
                    <div className="hidden sm:flex items-center space-x-4">
                        <>
                            <Link
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "sm"
                                })}
                                href="/pricing"
                            >
                                Pricing
                            </Link>
                            <LoginLink
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "sm"
                                })}
                            >
                                Sign In
                            </LoginLink>
                            <RegisterLink
                                className={buttonVariants({
                                    size: "sm"
                                })}
                            >
                                Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                            </RegisterLink>
                        </>
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    );
}
 
export default Navbar;