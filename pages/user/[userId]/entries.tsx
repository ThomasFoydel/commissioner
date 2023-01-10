import { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import EntrySummary from '../../../components/EntrySummary'
import { makeUserEntriesQuery } from '../../../apollo/queries'
import PageSelector from '../../../components/PageSelector'
import EntrySorter from '../../../components/EntrySorter'
import LoadingDots from '../../../components/LoadingDots'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'

const UserEntries = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data, loading } = useQuery(makeUserEntriesQuery(order, direction, page, perPage), {
    variables: { userId },
  })
  const entries = data?.entries

  if (entries === undefined && !loading) return <TypeOut>NO ENTRIES FOUND BY USER {userId}</TypeOut>
  if (entries === undefined) return <LoadingDots />

  return (
    <div>
      <H>
        <TypeOut>ALL ENTRIES BY USER {userId}</TypeOut>
      </H>
      <Level>
        <EntrySorter
          onDirectionChange={setDirection}
          onOrderChange={setOrder}
          onPerPageChange={setPerPage}
        />

        {entries &&
          !loading &&
          entries.map((entry: Entry) => <EntrySummary key={entry.id} entry={entry} />)}
        <PageSelector onChange={setPage} page={page} />
      </Level>
    </div>
  )
}

UserEntries.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserEntries
