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

  /*
   * CANONICAL URL
   *
   * Tells Google that the HTTPS homepage is
   * the preferred/original version of the page.
   */
  alternates: {
    canonical: 'https://snobolabs.in/',
  },

  /*
   * FAVICON
   *
   * Uses the dynamic site-icon route.
   * This allows the logo to eventually be
   * changed from the admin panel.
   */
  icons: {
    icon: [
      {
        url: '/api/site-icon',
      },
    ],
    shortcut: '/api/site-icon',
    apple: '/api/site-icon',
  },

  /*
   * OPEN GRAPH
   *
   * Used when Snobo Labs pages are shared on
   * WhatsApp, Facebook, LinkedIn, etc.
   */
  openGraph: {
    title: 'Snobo Labs — Intelligence Beyond Limits',

    description:
      'AI agents, websites, and CRMs. Built fast, built direct.',

    url: 'https://snobolabs.in',

    siteName: 'Snobo Labs',

    type: 'website',

    images: [
      {
        url: 'https://snobolabs.in/icon.svg',
        width: 1536,
        height: 1536,
        alt: 'Snobo Labs logo',
      },
    ],
  },

  /*
   * TWITTER / X
   */
  twitter: {
    card: 'summary',

    title: 'Snobo Labs — Intelligence Beyond Limits',

    description:
      'AI agents, websites, and CRMs. Built fast, built direct.',

    images: ['https://snobolabs.in/icon.svg'],
  },
}

/*
 * GOOGLE ANALYTICS
 *
 * If NEXT_PUBLIC_GA_ID is not configured,
 * Analytics simply won't load.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/*
 * ORGANIZATION STRUCTURED DATA
 *
 * Helps search engines understand that
 * Snobo Labs is an organization and identifies
 * its official logo.
 */
const ORG_JSON_LD = {
  '@context': 'https://schema.org',

  '@graph': [
    {
      '@type': 'Organization',

      '@id': 'https://snobolabs.in/#organization',

      name: 'Snobo Labs',

      url: 'https://snobolabs.in',

      logo: {
        '@type': 'ImageObject',

        url: 'https://snobolabs.in/icon.svg',

        width: 1536,

        height: 1536,
      },

      image: 'https://snobolabs.in/icon.svg',

      founder: {
        '@id': 'https://snobolabs.in/about#bhaviksoni',
      },

      description:
        'Snobo Labs builds AI agents, websites, and WhatsApp-native CRMs for small businesses — fast, direct, and without account managers.',
    },

    {
      '@type': 'Person',

      '@id': 'https://snobolabs.in/about#bhaviksoni',

      name: 'Bhavik Soni',

      jobTitle: 'Founder & CEO',

      worksFor: {
        '@id': 'https://snobolabs.in/#organization',
      },

      url: 'https://snobolabs.in/about',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${rajdhani.variable}`}
    >
      <body className="font-body">

        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORG_JSON_LD),
          }}
        />

        {/* Main website */}
        {children}

        {/* Snobo Chat */}
        <ChatWidget />

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />

            <Script
              id="ga-init"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag(){
                  dataLayer.push(arguments);
                }

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