import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import { commmissionWithoutEntries, makeCommissionEntriesQuery } from '../../../apollo/queries'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import EntrySummary from '../../../components/EntrySummary'
import PageSelector from '../../../components/PageSelector'
import EntrySorter from '../../../components/EntrySorter'
import LoadingDots from '../../../components/LoadingDots'
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

  const { data: comData, loading: comLoading } = useQuery(commmissionWithoutEntries, {
    variables: { comId },
  })
  const { data: entriesData, loading } = useQuery(
    makeCommissionEntriesQuery(order, direction, page, perPage),
    {
      variables: { comId },
      pollInterval: 4000,
    }
  )
  const entries = entriesData?.entries
  const commission = comData?.commission
  const [enterFormOpen, setEnterFormOpen] = useState(false)

  if (!loading && !comLoading && commission === undefined && entries === undefined) {
    return <TypeOut>ENTRY DATA FOR COMMISSION {comId} NOT FOUND</TypeOut>
  }
  if (commission === undefined || entries === undefined) return <LoadingDots />

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
    setEnterFormOpen(false)
  }

  return (
    <div>
      <Link href={`/commission/${commission.id}`}>
        <H>
          <TypeOut>ENTRIES FOR COMMISSION {commission.id}</TypeOut>
        </H>
      </Link>
      <Level>
        <div>
          <TypeOut>PROMPT</TypeOut>
          <InterplanetaryContent path={commission.prompt} maxChars={100} />
        </div>

        {userCanEnter && (
          <div>
            <button className="button" onClick={() => setEnterFormOpen((o) => !o)}>
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
