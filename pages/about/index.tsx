import { NextPage } from 'next'
import { aboutMessage } from '../terminal/utils/messages'
import TypeOut from '../../components/TypeOut'
import Layout from '../layouts/CRT'

const About = () => (
  <main>
    {aboutMessage.split('- ').map((line: string) => (
      <TypeOut key={line}>- {line}</TypeOut>
    ))}
  </main>
)

About.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default About
