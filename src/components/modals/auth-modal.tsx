"use client"
import { useMemo, useState } from "react"
import Image from "next/image"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useModalStore from "@/hooks/use-modal-store"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
 
const formSchema = z.object({
    email: z.string().email("Must be a valid email")
});

const AuthModal = () => {
    const { isOpen, type, onClose } = useModalStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const isOpened = useMemo(() => isOpen && type === "authModal", [isOpen, type]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        window.location.replace(`/api/auth/login?connection_id=${process.env.NEXT_PUBLIC_KINDE_CONNECTION_EMAIL_PASSWORDLESS || ""}&login_hint=${values.email}`);
    }

    return (
        <Dialog
            open={isOpened}
            onOpenChange={onClose}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start your journey with Smarmill</DialogTitle>
                    <DialogDescription>
                        Create an account or login to use our services
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your email address"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            name="email"
                        />
                        <Button
                            className="w-full"
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>
                </Form>
                <div className="space-y-4">
                    <div className="relative flex justify-center items-center">
                        <p className="z-10 text-sm px-2 bg-background">Continue With</p>
                        <Separator className="absolute" />
                    </div>
                    <LoginLink
                        className={buttonVariants({
                            className: "w-full flex items-center space-x-2",
                            variant: "outline"
                        })}
                    >
                        <Image
                            src={"/svgs/google.svg"}
                            height={20}
                            width={20}
                            alt="logo"
                        />
                        <span>Sign with Email</span>
                    </LoginLink>
                    <div className="text-sm">
                        Don&apos;t have an account?{' '}
                        <RegisterLink
                            className="text-rose-600 hover:text-rose-600/90 hover:underline transition-all"
                            authUrlParams={{
                                connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_EMAIL_PASSWORDLESS || ""
                            }}
                        >
                            create account
                        </RegisterLink>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
 
export default AuthModal;