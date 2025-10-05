import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoreWriter Trace',
  description: 'Decode Hyperliquid CoreWriter actions from transaction logs',
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

