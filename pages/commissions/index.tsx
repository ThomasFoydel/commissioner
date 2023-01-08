import Link from 'next/link'
import { NextPage } from 'next'
import React, { ChangeEvent, useState } from 'react'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../components/CommissionSummary'
import { makeCommissionQuery } from '../terminal/utils'
import TypeOut from '../../components/TypeOut'
import Layout from '../layouts/CRT'

const orderOptions = [
  { value: 'reward', label: 'reward' },
  { value: 'entryCount', label: 'entry count' },
  { value: 'created', label: 'created' },
  { value: 'minTime', label: 'min time' },
  { value: 'none', label: 'none' },
]
const directionOptions = [
  { value: 'asc', label: 'ascending' },
  { value: 'desc', label: 'descending' },
]
const perPageOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
]

const Commissions = () => {
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data, refetch } = useQuery(makeCommissionQuery(order, direction, page, perPage))
  const commissions = data?.commissions

  const handleOrder = (e: ChangeEvent<HTMLSelectElement>) => setOrder(e.target.value)
  const handleDirection = (e: ChangeEvent<HTMLSelectElement>) => setDirection(e.target.value)
  const handlePerPage = (e: ChangeEvent<HTMLSelectElement>) => setPerPage(+e.target.value)

  return (
    <div>
      <H>
        <TypeOut>COMMISSIONS</TypeOut>
      </H>
      <Level>
        <select onChange={handleOrder}>
          {orderOptions.map(({ value, label }) => (
            <option value={value}>{label}</option>
          ))}
        </select>
        <select onChange={handleDirection}>
          {directionOptions.map(({ value, label }) => (
            <option value={value}>{label}</option>
          ))}
        </select>
        <select onChange={handlePerPage}>
          {perPageOptions.map(({ value, label }) => (
            <option value={value}>{label}</option>
          ))}
        </select>
        <div>
          {commissions &&
            commissions.map((commission: Commission) => (
              <CommissionSummary key={commission.id} commission={commission} />
            ))}
        </div>
        <Link href="/create">
          <a className="text-center">
            <TypeOut>CREATE COMMISSION</TypeOut>
          </a>
        </Link>
      </Level>
    </div>
  )
}

Commissions.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Commissions
