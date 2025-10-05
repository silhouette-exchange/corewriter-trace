import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoreWriter Trace',
  description: 'View comprehensive transaction information and decode Hyperliquid CoreWriter actions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
