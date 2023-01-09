import Link from 'next/link'
import { NextPage } from 'next'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../components/CommissionSummary'
import CommissionSorter from '../../components/CommissionSorter'
import { makeCommissionQuery } from '../terminal/utils'
import TypeOut from '../../components/TypeOut'
import Layout from '../layouts/CRT'
import PageSelector from '../../components/PageSelector'

const Commissions = () => {
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data } = useQuery(makeCommissionQuery(order, direction, page, perPage))
  const commissions = data?.commissions

  return (
    <div>
      <H>
        <TypeOut>COMMISSIONS</TypeOut>
      </H>
      <Level>
        <CommissionSorter
          onDirectionChange={setDirection}
          onOrderChange={setOrder}
          onPerPageChange={setPerPage}
        />
        <div>
          {commissions &&
            commissions.map((commission: Commission) => (
              <CommissionSummary key={commission.id} commission={commission} />
            ))}
        </div>
        <PageSelector onChange={setPage} page={page} />

        <Link href="/create">
          <a
            className="button block mt-4 w-[200px] center text-center"
            style={{ textShadow: 'none' }}
          >
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
