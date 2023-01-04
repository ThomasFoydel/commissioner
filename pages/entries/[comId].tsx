import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import React from 'react'
import { entriesForCommissionQuery } from '../../apollo/queries'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { truncate } from '../../utils'

const Entries = () => {
  const router = useRouter()
  const { comId } = router.query
  const entryRes = useQuery(entriesForCommissionQuery, { variables: { comId } })
  const entries = entryRes?.data?.entries
 
  if (!entryRes?.data?.entries) return <></>
  return (
    <div>
      {entries.length === 0 ? (
        <p>NO ENTRIES MADE FOR COMMISSION {comId}</p>
      ) : (
        entries.map((entry: Entry) => <IndividualEntry key={entry.id} entry={entry} />)
      )}
    </div>
  )
}

const IndividualEntry = ({ entry }: { entry: Entry }) => {
  return (
    <div>
      <p>ENTRY {truncate(entry.id)}</p>
      <p>{new Date(+entry.timestamp * 1000).toLocaleString()}</p>
      <p>
        CONTENT <InterplanetaryContent path={entry.ipfsPath} />
      </p>
      <p>VOTES {entry.voteAmount}</p>
    </div>
  )
}

export default Entries
