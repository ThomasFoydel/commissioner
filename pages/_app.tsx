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
          </Head>
          <Header />
          {getLayout(<AnyComponent {...pageProps} />)}
        </DappProvider>
      </ApolloProvider>
    </ThemeProvider>
  )
}

export default MyApp
