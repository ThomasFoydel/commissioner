import { NextPage } from 'next'
import Typist from 'react-typist'
import 'react-typist/dist/Typist.css'
import { aboutMessage } from './terminal/utils/messages'
import styles from '../styles/Home.module.css'
import Layout from './layouts/CRT'

const Home = () => (
  <div>
    <main className={styles.greenText}>
      {aboutMessage.split('- ').map((line: string) => (
        <Typist cursor={{ hideWhenDone: true, hideWhenDoneDelay: 4000 }} key={line}>
          - {line}
        </Typist>
      ))}
    </main>
  </div>
)

Home.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Home
