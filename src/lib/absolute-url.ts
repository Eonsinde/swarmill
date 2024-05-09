import { Metadata } from "next"

export const absoluteUrl = (path: string) => {
    if (typeof window !== undefined) return path
    
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}${path}`
    return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

export const getURL = () => {
    let url =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        "http://localhost:3000/";
    
    url = url.includes("http") ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

    return url;
}

export const constructMetadata = ({
    title= "Swarmill - Saas for Students, Educators & Researchers",
    description="Swamrill is an open-source software that makes chatting with your PDF files very easy. This can be very useful to speed up research work",
    image="/thumbnail.png",
    icons="favicon.ico",
    noIndex=false
}: {
    title?: string
    description?: string
    image?: string
    icons?: string
    noIndex?: boolean
} = {}): Metadata => {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@eonsinde"
        },
        icons,
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://swarmill.netlify.app"),
        themeColor: "#09090b",
        ...(noIndex && {
            robots: {
                index: false,
                follow: false
            }
        })
    }
}