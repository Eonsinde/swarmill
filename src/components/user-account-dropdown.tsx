import Image from "next/image"
import Link from "next/link"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Gem } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icons } from "@/components/dashboard/chat/icons"

type Props = {
    name: string
    email: string
    imageUrl: string
}

const UserAccountDropdown = ({ name, email, imageUrl }: Props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="overflow-visible"
                asChild
            >
                <Button
                    className="h-8 w-8 aspect-square rounded-full hover:opacity-80"
                    onClick={() => true}
                    variant="secondary"
                >
                    <Avatar className="relative h-8 w-8">
                        {imageUrl ? (
                            <div className="relative aspect-square h-full w-full">
                                <Image
                                    src={imageUrl}
                                    fill
                                    alt={"user avatar"}
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ) : (
                            <AvatarFallback>
                                <span className="sr-only">{name}</span>
                                <Icons.user className="h-4 w-4" />
                            </AvatarFallback>
                        )}
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    {name && (
                        <p className="font-medium text-sm">
                            {name}
                        </p>
                    )}
                    {email && (
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {email}
                        </p>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="w-full cursor-pointer"
                        href="/dashboard"
                    >
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="w-full cursor-pointer"
                        href="/dashboard/billing"
                    >
                        <Gem className="text-rose-600 h-4 w-4 mr-1.5" /> Billing
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LogoutLink className="cursor-pointer">
                        Log out
                    </LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserAccountDropdown