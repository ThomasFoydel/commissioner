import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import CommissionSummary from '../../../components/CommissionSummary'
import { userCommissionsQuery } from '../../../apollo/queries'

const UserCommissions = () => {
  const {
    query: { userId },
  } = useRouter()
  const { data } = useQuery(userCommissionsQuery, { variables: { userId } })
  const commissions = data?.commissions
  if (!commissions) return <></>

  return (
    <div>
      <p>ALL COMMISSIONS BY USER {userId}</p>
      <div>
        {commissions.map((commission: Commission) => (
          <CommissionSummary key={commission.id} commission={commission} />
        ))}
      </div>
    </div>
  )
}

export default UserCommissions
