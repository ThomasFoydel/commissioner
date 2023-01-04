import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import CommissionSummary from '../../components/CommissionSummary'
import { makeCommissionQuery } from '../terminal/utils'

const Commissions = () => {
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data } = useQuery(makeCommissionQuery(order, direction, page, perPage))
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
    </div>
  )
}



export default Commissions