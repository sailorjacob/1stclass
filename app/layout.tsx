import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '1ST CLASS STUDIOS',
    template: '%s | 1ST CLASS STUDIOS',
  },
  description: 'Professional recording studio located in Stamford, CT offering state-of-the-art equipment and expert engineers.',
  generator: 'Next.js',
  authors: [{ name: '1ST CLASS STUDIOS', url: 'https://1stclassstudios.com' }],
  openGraph: {
    title: '1ST CLASS STUDIOS',
    description:
      'Professional recording studio located in Stamford, CT offering state-of-the-art equipment and expert engineers.',
    url: 'https://1stclassstudios.com',
    siteName: '1ST CLASS STUDIOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1ST CLASS STUDIOS',
    description:
      'Professional recording studio located in Stamford, CT offering state-of-the-art equipment and expert engineers.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
