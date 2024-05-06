import { JSX } from "react"
import { AppRouter } from "@/trpc/index"
import { inferRouterOutputs } from "@trpc/server"

type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput["getFileMessages"]["messages"]

type OmitText = Omit<Messages[number], "text">

type ExtendedText = {
    text: string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText