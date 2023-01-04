import Head from 'next/head'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import 'react-toastify/dist/ReactToastify.css'
import { ApolloProvider } from '@apollo/client'
import { ToastContainer } from 'react-toastify'
import DappProvider from '../utils/ethers/DappProvider'
import Header from '../components/Header'
import { client } from '../apollo/client'
import '../styles/globals.css'

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
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  )
}

export default MyApp
