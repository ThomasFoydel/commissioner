import Link from 'next/link'
import { NextPage } from 'next'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import CommissionSummary from '../../components/CommissionSummary'
import CommissionSorter from '../../components/CommissionSorter'
import PageSelector from '../../components/PageSelector'
import { makeCommissionQuery } from '../../utils/terminal'
import TypeOut from '../../components/TypeOut'
import Layout from '../layouts/CRT'

const Commissions = () => {
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data, loading } = useQuery(makeCommissionQuery(order, direction, page, perPage))
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
            !loading &&
            commissions.map((commission: Commission) => (
              <CommissionSummary key={commission.id} commission={commission} />
            ))}
        </div>
        <PageSelector onChange={setPage} page={page} />

        <Link style={{ textShadow: 'none' }} href="/create">
          <TypeOut>
            <p className="button block mt-4 w-[256px] center text-center">CREATE COMMISSION</p>
          </TypeOut>
        </Link>
      </Level>
    </div>
  )
}

Commissions.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Commissions
