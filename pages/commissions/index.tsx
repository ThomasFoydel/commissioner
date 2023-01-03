import { useQuery } from '@apollo/client'
import Link from 'next/link'
import React, { useState } from 'react'
import InterplanetaryContent from '../../components/InterplanetaryContent'
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
            <Commission key={commission.id} commission={commission} />
          ))}
      </div>
    </div>
  )
}

const Commission = ({ commission }: { commission: Commission }) => {
  const {
    id,
    prompt,
    active,
    reward,
    minTime,
    timestamp,
    entryCount,
    commissioner,
    winningAuthor,
    submittedEntries,
  } = commission
  return (
    <Link href={`/commission/${commission.id}`}>
      <div className="m-2 p-2 border rounded-sm cursor-pointer">
        <p>COMMISSION {id}</p>
        <InterplanetaryContent path={prompt} />
        <p>COMMISSIONER: {commissioner.id}</p>
        <p>REWARD: {reward}</p>
        <p>{active ? 'ACTIVE' : 'COMPLETED'}</p>
      </div>
    </Link>
  )
}

export default Commissions
