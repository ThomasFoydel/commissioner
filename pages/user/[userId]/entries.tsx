import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { userEntriesQuery } from '../../../apollo/queries'
import EntrySummary from '../../../components/EntrySummary'

const UserEntries = () => {
  const {
    query: { userId },
  } = useRouter()
  const { data } = useQuery(userEntriesQuery, { variables: { userId } })
  const entries = data?.entries
  if (!entries) return <></>

  return (
    <div>
      <p>ALL ENTRIES BY USER {userId}</p>
      <div>
        {entries.map((entry: Entry) => (
          <EntrySummary key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}

export default UserEntries