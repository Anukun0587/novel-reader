import { ClerkProvider } from '@clerk/nextjs'
import { thTH } from '@clerk/localizations'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovelTH - อ่านนิยายออนไลน์',
  description: 'แพลตฟอร์มอ่านและเขียนนิยายออนไลน์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={thTH}>
      <html lang="th">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}