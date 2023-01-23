import Head from 'next/head'
import { ReactNode } from 'react'
import { NextComponentType } from 'next'
import { ThemeProvider } from 'next-themes'
import 'react-toastify/dist/ReactToastify.css'
import { ApolloProvider } from '@apollo/client'
import type { AppContext, AppInitialProps, AppLayoutProps } from 'next/app'
import NetworkErrorDisplay from '../components/NetworkErrorDisplay'
import DappProvider from '../utils/ethers/DappProvider'
import Header from '../components/Header'
import { client } from '../apollo/client'
import '../styles/globals.css'

const MyApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps,
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)
  const AnyComponent = Component as any

  return (
    <ThemeProvider enableSystem={true} attribute="class">
      <ApolloProvider client={client}>
        <DappProvider>
          <NetworkErrorDisplay />
          <Head>
            <title>COMMISSIONER</title>
            <meta
              name="description"
              content="Decentralized and censorship-resistant written content commissioning."
            />
            <link rel="icon" href="/favicon.ico" />

            {/* Primary Meta Tags  */}
            <title>Commissioner</title>
            <meta name="title" content="Commissioner" />
            <meta
              name="description"
              content="Decentralized, censorship-resistant, and market-driven written content."
            />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://commissioner.vercel.app" />
            <meta property="og:title" content="Commissioner" />
            <meta
              property="og:description"
              content="Decentralized, censorship-resistant, and market-driven written content."
            />
            <meta property="og:image" content="https://commissioner.vercel.app/preview.png" />

            {/* Twitter  */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content="https://commissioner.vercel.app" />
            <meta property="twitter:title" content="Commissioner" />
            <meta
              property="twitter:description"
              content="Decentralized, censorship-resistant, and market-driven written content."
            />
            <meta property="twitter:image" content="https://commissioner.vercel.app/preview.png" />
          </Head>
          <Header />
          {getLayout(<AnyComponent {...pageProps} />)}
        </DappProvider>
      </ApolloProvider>
    </ThemeProvider>
  )
}

export default MyApp
