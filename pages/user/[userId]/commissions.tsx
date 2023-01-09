import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../../components/CommissionSummary'
import { makeCommissionByUserQuery } from '../../../apollo/queries'
import CommissionSorter from '../../../components/CommissionSorter'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'
import { useState } from 'react'
import PageSelector from '../../../components/PageSelector'

const UserCommissions = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)
  const { data } = useQuery(makeCommissionByUserQuery(order, direction, page, perPage), {
    variables: { userId },
  })
  const commissions = data?.commissions
  if (!commissions) return <></>

  return (
    <div>
      <H>
        <TypeOut>ALL COMMISSIONS BY USER {userId}</TypeOut>
      </H>
      <Level>
        <CommissionSorter
          onDirectionChange={setDirection}
          onOrderChange={setOrder}
          onPerPageChange={setPerPage}
        />
        <div>
          {commissions.map((commission: Commission) => (
            <CommissionSummary key={commission.id} commission={commission} />
          ))}
        </div>
      </Level>
      <PageSelector onChange={setPage} page={page} />
    </div>
  )
}

UserCommissions.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserCommissions
