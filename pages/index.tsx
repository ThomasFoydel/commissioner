import { NextPage } from 'next'
import { aboutMessage } from './terminal/utils/messages'
import styles from '../styles/Home.module.css'
import Layout from './layouts/CRT'

const Home = () => (
  <div>
    <main className={styles.greenText}>
      {aboutMessage.split('- ').map((line: string) => (
        <p>- {line}</p>
      ))}
    </main>

    <footer></footer>
  </div>
)

Home.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Home
