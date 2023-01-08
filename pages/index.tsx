import { NextPage } from 'next'
import { aboutMessage } from './terminal/utils/messages'
import TypeOut from '../components/TypeOut'
import Layout from './layouts/CRT'

const Home = () => (
  <main>
    {aboutMessage.split('- ').map((line: string) => (
      <TypeOut key={line}>- {line}</TypeOut>
    ))}
  </main>
)

Home.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Home
