"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs"
import { usePathname } from "next/navigation"
import useModalStore from "@/hooks/use-modal-store"
import { ArrowRight, Gem, Menu } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"

type Props = {
    isAuth: boolean
}

const MobileNavbar = ({ isAuth }: Props) => {
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { onOpen } = useModalStore();

    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    const closeOnCurrent = (href: string) => {
        if (pathname === href)
            toggleOpen();
    }

    useEffect(() => {
        if (isOpen)  toggleOpen();
    }, [pathname]);

    return (
        <div className="block md:hidden">
            <Menu
                className="relative z-50 h-5 w-5"
                onClick={toggleOpen}
            />
            {isOpen ? (
                <div className="fixed inset-0 z-0 w-full animate-in slide-in-from-top-5 fade-in-20">
                    <ul className="absolute bg-background border-b border-border w-full grid gap-3 pt-20 pb-8 px-10 shadow-xl">
                        {!isAuth ? (
                            <>
                                <Link
                                    className={buttonVariants({
                                        className: "flex justify-between items-center w-full font-semibold",
                                        variant: "link"
                                    })}
                                    href="/pricing"
                                    onClick={() => closeOnCurrent("/pricing")}
                                >
                                    Pricing <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <li className="my-3 h-px w-full bg-secondary" />
                                <li>
                                    <Button
                                        className="flex justify-between items-center w-full font-semibold"
                                        variant="link"
                                        onClick={() => {
                                            onOpen("authModal")
                                            toggleOpen()
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </li>
                            </>
                        ) : (
                            <>
                                <Link
                                    className={buttonVariants({
                                        className: "flex justify-between items-center w-full font-semibold",
                                        variant: "link"
                                    })}
                                    href="/pricing"
                                    onClick={() => closeOnCurrent("/pricing")}
                                >
                                    Pricing <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <li className="my-3 h-px w-full bg-secondary" />
                                <Link
                                    className={buttonVariants({
                                        className: "flex justify-between items-center w-full font-semibold",
                                        variant: "link"
                                    })}
                                    href="/dashboard"
                                    onClick={() => closeOnCurrent("/dashboard")}
                                >
                                    Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <li className="my-3 h-px w-full bg-secondary" />
                                <Link
                                    className={buttonVariants({
                                        className: "flex justify-between items-center w-full font-semibold",
                                        variant: "link"
                                    })}
                                    href="/dashboard/billing"
                                    onClick={() => closeOnCurrent("/dashboard")}
                                >
                                    <span className="inline-flex items-center">
                                        <Gem className="mr-2 h-4 w-4 bg-rose500" /> Billing
                                    </span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <li className="my-3 h-px w-full bg-secondary" />
                                <LogoutLink
                                    className={buttonVariants({
                                        className: "flex justify-between items-center w-full font-semibold",
                                        variant: "link"
                                    })}
                                >
                                    Sign Out
                                </LogoutLink>
                            </>
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    )
}
 
export default MobileNavbar