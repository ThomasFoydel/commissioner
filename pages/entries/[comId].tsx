import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { comDetails } from '../../apollo/queries'
import EntryForm from '../../components/EntryForm'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { truncate } from '../../utils'

const Entries = () => {
  const { account } = useEthers()
  const router = useRouter()
  const { comId } = router.query
  const { data, refetch } = useQuery(comDetails, { variables: { comId } })
  const commission = data?.commission
  const entries = commission?.submittedEntries

  const [enterFormOpen, setEnterFormOpen] = useState(false)
  const toggleEnterForm = () => setEnterFormOpen((o) => !o)

  if (!commission) return <></>

  const userCanEnter =
    account &&
    commission?.commissioner?.id !== account &&
    entries.every((entry: Entry) => entry?.author?.id !== account.toLowerCase())

  return (
    <div>
      <p>ENTRIES FOR COMMISSION {commission.id}</p>
      <p>
        PROMPT <InterplanetaryContent path={commission.prompt} />
      </p>
      {userCanEnter && (
        <div>
          <button onClick={toggleEnterForm}>ENTER COMMISSION</button>
          {enterFormOpen && <EntryForm id={String(comId)} onComplete={refetch} />}
        </div>
      )}
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
    <div className="m-2 p-2 border rounded-sm">
      <p>ENTRY {truncate(entry.id)}</p>
      <p>AUTHOR {entry.author.id}</p>
      <p>{new Date(+entry.timestamp * 1000).toLocaleString()}</p>
      <p>
        CONTENT <InterplanetaryContent path={entry.ipfsPath} />
      </p>
      <p>VOTES {entry.voteAmount}</p>
    </div>
  )
}

export default Entries
