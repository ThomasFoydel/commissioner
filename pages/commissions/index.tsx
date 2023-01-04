import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import CommissionForm from '../../components/CommissionForm'
import CommissionSummary from '../../components/CommissionSummary'
import { makeCommissionQuery } from '../terminal/utils'

const Commissions = () => {
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data, refetch } = useQuery(makeCommissionQuery(order, direction, page, perPage))
  const commissions = data?.commissions
  return (
    <div>
      <h2>COMMISSIONS</h2>
      <div>
        {commissions &&
          commissions.map((commission: Commission) => (
            <CommissionSummary key={commission.id} commission={commission} />
          ))}
      </div>
      <CommissionForm onComplete={refetch} />
    </div>
  )
}

export default Commissions
