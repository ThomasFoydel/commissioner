import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { ThemeProvider } from 'next-themes'
import { client } from '../apollo/client'
import DappProvider from '../ethers/DappProvider'
import Header from '../components/Header'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider enableSystem={true} attribute="class">
      <ApolloProvider client={client}>
        <DappProvider>
          <Head>
            <title>COMMISSIONER</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Header />
          <Component {...pageProps} />
        </DappProvider>
      </ApolloProvider>
    </ThemeProvider>
  )
}

export default MyApp
