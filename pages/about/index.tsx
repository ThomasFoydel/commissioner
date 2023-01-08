import { NextPage } from 'next'
import { H, Level } from 'react-accessible-headings'
import { aboutMessage } from '../terminal/utils/messages'
import TypeOut from '../../components/TypeOut'
import Layout from '../layouts/CRT'

const About = () => (
  <main>
    <H>
      <TypeOut>ABOUT</TypeOut>
    </H>
    <Level>
      {aboutMessage.split('- ').map((line: string) => (
        <TypeOut key={line}>- {line}</TypeOut>
      ))}
    </Level>
  </main>
)

About.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default About
