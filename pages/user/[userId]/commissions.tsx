import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../../components/CommissionSummary'
import { userCommissionsQuery } from '../../../apollo/queries'
import Layout from '../../layouts/CRT'

const UserCommissions = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const { data } = useQuery(userCommissionsQuery, { variables: { userId } })
  const commissions = data?.commissions
  if (!commissions) return <></>

  return (
    <div>
      <H>ALL COMMISSIONS BY USER {userId}</H>
      <Level>
        <div>
          {commissions.map((commission: Commission) => (
            <CommissionSummary key={commission.id} commission={commission} />
          ))}
        </div>
      </Level>
    </div>
  )
}

UserCommissions.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserCommissions
