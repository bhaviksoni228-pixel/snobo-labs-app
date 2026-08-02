import type { Metadata } from 'next'
import { Space_Grotesk, Rajdhani } from 'next/font/google'
import Script from 'next/script'
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://snobolabs.in/#organization',
      name: 'Snobo Labs',
      url: 'https://snobolabs.in',
      logo: 'https://snobolabs.in/symbol.png',
      founder: { '@id': 'https://snobolabs.in/about#bhaviksoni' },
      description:
        'Snobo Labs builds AI agents, websites, and WhatsApp-native CRMs for small businesses — fast, direct, and without account managers.',
    },
    {
      '@type': 'Person',
      '@id': 'https://snobolabs.in/about#bhaviksoni',
      name: 'Bhavik Soni',
      jobTitle: 'Founder & CEO',
      worksFor: { '@id': 'https://snobolabs.in/#organization' },
      url: 'https://snobolabs.in/about',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${rajdhani.variable}`}>
      <body className="font-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        {children}
        <ChatWidget />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}