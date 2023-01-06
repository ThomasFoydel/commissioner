import { H, Level } from 'react-accessible-headings'
import CommissionForm from '../../components/CommissionForm'

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

export default Create
