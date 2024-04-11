import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import TrpcProvider from "@/providers/trpc-provider"
import Navbar from "@/components/navbar"
import ModalProvider from "@/providers/modal-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Swarmill",
  description: "Your SAAS platform for a great PDF research",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen font-sans antialiased grainy",
        inter.className
      )}>
        <TrpcProvider>
          <Navbar />
          <ModalProvider />
          {children}
        </TrpcProvider>
      </body>
    </html>
  )
}
