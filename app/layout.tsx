import type { Metadata } from 'next'
import { Space_Grotesk, Rajdhani } from 'next/font/google'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'Snobo Labs — Intelligence Beyond Limits',
  description:
    'Websites, AI agents, and WhatsApp CRMs — built fast, built by the person who actually codes it. Live in 7 days.',
  metadataBase: new URL('https://snobolabs.in'),
  openGraph: {
    title: 'Snobo Labs — Intelligence Beyond Limits',
    description: 'AI agents, websites, and CRMs. Built fast, built direct.',
    url: 'https://snobolabs.in',
    siteName: 'Snobo Labs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${rajdhani.variable}`}>
      <body className="font-body">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
