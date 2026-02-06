import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Books - Accounting Dashboard',
  description: 'Financial management and accounting dashboard',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'https://www.mekcosupply.ca/static/images/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: 'https://www.mekcosupply.ca/static/images/favicon.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: 'https://www.mekcosupply.ca/static/images/favicon.png',
        type: 'image/png',
        sizes: '16x16',
      },
    ],
    apple: 'https://www.mekcosupply.ca/static/images/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
