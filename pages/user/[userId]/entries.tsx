import { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import EntrySummary from '../../../components/EntrySummary'
import { makeUserEntriesQuery } from '../../../apollo/queries'
import EntrySorter from '../../../components/EntrySorter'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'

const UserEntries = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const [order, setOrder] = useState('created')
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  const { data } = useQuery(makeUserEntriesQuery(order, direction, page, perPage), {
    variables: { userId },
  })
  const entries = data?.entries
  
  if (!router?.query?.userId) return <></>

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

        {entries && entries.map((entry: Entry) => <EntrySummary key={entry.id} entry={entry} />)}
      </Level>
    </div>
  )
}

UserEntries.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserEntries
