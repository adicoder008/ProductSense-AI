import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ProductSense AI",
  description: "AI-powered shopping intelligence API"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
