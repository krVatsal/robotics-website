import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Bebas_Neue, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import SmoothScrollProvider from "@/components/smooth-scroll-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bebasNeue = Bebas_Neue({ subsets: ["latin"], variable: "--font-bebas", weight: "400" })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-mono", weight: ["400", "500", "600"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "MNNIT Robotics Club",
  description: "The official Robotics Club of MNNIT Allahabad.",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SmoothScrollProvider>
              {children}
            </SmoothScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
