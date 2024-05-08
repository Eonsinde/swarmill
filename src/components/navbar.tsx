"use client"
import Link from "next/link"
import Image from "next/image"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import useModalStore from "@/hooks/use-modal-store"
import { ArrowRight } from "lucide-react"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import UserAccountDropdown from "@/components/user-account-dropdown"

const Navbar = () => {
    const { onOpen } = useModalStore();
    const { isLoading, user: kindleUser } = useKindeBrowserClient();

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
                        {!kindleUser ? (
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
                                <Button
                                    className={buttonVariants({
                                        size: "sm"
                                    })}
                                    onClick={() => onOpen("authModal")}
                                    disabled={isLoading!}
                                >
                                    Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                                </Button>
                            </>
                        ) : (
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
                                <UserAccountDropdown
                                    name={
                                        !kindleUser.family_name || !kindleUser.given_name
                                        ? "Your Account"
                                        : `${kindleUser.given_name} ${kindleUser.family_name}`
                                    }
                                    email={kindleUser.email ?? ""}
                                    imageUrl={kindleUser.picture ?? ""}
                                />
                            </>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    );
}
 
export default Navbar;