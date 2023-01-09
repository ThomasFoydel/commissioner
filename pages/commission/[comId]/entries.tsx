import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import { comDetails, makeCommissionEntriesQuery } from '../../../apollo/queries'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import EntrySummary from '../../../components/EntrySummary'
import PageSelector from '../../../components/PageSelector'
import EntrySorter from '../../../components/EntrySorter'
import EntryForm from '../../../components/EntryForm'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'

const Entries = () => {
  const router = useRouter()
  const { comId } = router.query
  const { account } = useEthers()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')

  const { data: comData } = useQuery(comDetails, { variables: { comId } })
  const {
    data: entriesData,
    refetch: entriesRefetch,
    loading,
  } = useQuery(makeCommissionEntriesQuery(order, direction, page, perPage), {
    variables: { comId },
  })
  const entries = entriesData?.entries
  const commission = comData?.commission
  const [enterFormOpen, setEnterFormOpen] = useState(false)

  if (!commission) return <></>

  const { active, commissioner } = commission

  const userHasAlreadyEntered =
    account &&
    entries &&
    entries.some((entry: Entry) => entry?.author?.id === account.toLowerCase())

  const userCanEnter =
    !loading &&
    account &&
    active &&
    commissioner.id !== account.toLowerCase() &&
    !userHasAlreadyEntered

  const entrySuccess = () => {
    setTimeout(() => {
      entriesRefetch()
      setEnterFormOpen(false)
    }, 1500)
  }

  return (
    <div>
      <Link href={`/commission/${commission.id}`}>
        <a>
          <H>
            <TypeOut>ENTRIES FOR COMMISSION {commission.id}</TypeOut>
          </H>
        </a>
      </Link>
      <Level>
        <div>
          <TypeOut>PROMPT</TypeOut>
          <InterplanetaryContent path={commission.prompt} />
        </div>

        {userCanEnter && (
          <div>
            <button onClick={() => setEnterFormOpen((o) => !o)}>
              <TypeOut>ENTER COMMISSION</TypeOut>
            </button>
            {enterFormOpen && <EntryForm id={String(comId)} onComplete={entrySuccess} />}
          </div>
        )}
        <EntrySorter
          onDirectionChange={setDirection}
          onOrderChange={setOrder}
          onPerPageChange={setPerPage}
        />
        {entries && !loading && (
          <>
            {entries.length === 0 ? (
              <p>NO ENTRIES MADE FOR THIS COMMISSION</p>
            ) : (
              entries.map((entry: Entry) => <EntrySummary key={entry.id} entry={entry} />)
            )}
          </>
        )}
        <PageSelector onChange={setPage} page={page} />
      </Level>
    </div>
  )
}

Entries.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default Entries
