import React from 'react'
import { NextPage } from 'next'
import Typist from 'react-typist'
import 'react-typist/dist/Typist.css'
import Layout from './layouts/CRT'

const Home = () => {
  return (
    <Typist avgTypingDelay={175} stdTypingDelay={40} className="text-2xl">
      <span>Wake up Neo...</span>
      <Typist.Backspace count={14} delay={2000} />
      <span>The Matrix has you...</span>
      <Typist.Backspace count={21} delay={3000} />
      <span>Follow the white rabbit.</span>
      <Typist.Backspace count={24} delay={5000} />
      <Typist.Delay ms={5000} />
      <span>Knock, knock, Neo.</span>
    </Typist>
  )
}

Home.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Home
