import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Staff Panel - University Admissions',
  description: 'University admission staff management system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: [
    { color: '#1f1f2e' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
