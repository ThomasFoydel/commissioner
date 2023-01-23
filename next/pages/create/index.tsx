import { NextPage } from 'next'
import { H, Level } from 'react-accessible-headings'
import CommissionForm from '../../components/CommissionForm'
import Layout from '../layouts/CRT'

const Create = () => {
  return (
    <div>
      <H>CREATE COMMISSION</H>
      <Level>
        <CommissionForm />
      </Level>
    </div>
  )
}

Create.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Create
