import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../components/CommissionSummary'
import CommissionForm from '../../components/CommissionForm'
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
      <H>COMMISSIONS</H>
      <Level>
        <div>
          {commissions &&
            commissions.map((commission: Commission) => (
              <CommissionSummary key={commission.id} commission={commission} />
            ))}
        </div>
        <CommissionForm onComplete={refetch} />
      </Level>
    </div>
  )
}

export default Commissions
