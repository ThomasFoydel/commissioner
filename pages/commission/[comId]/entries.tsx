import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import EntryForm from '../../../components/EntryForm'
import { comDetails } from '../../../apollo/queries'
import { truncate } from '../../../utils'

const Entries = () => {
  const { account } = useEthers()
  const router = useRouter()
  const { comId } = router.query
  const { data, refetch } = useQuery(comDetails, { variables: { comId } })
  const commission = data?.commission
  const [enterFormOpen, setEnterFormOpen] = useState(false)

  if (!commission) return <></>

  const { active, submittedEntries, commissioner } = commission

  const userHasNotSubmittedEntry =
    account && submittedEntries.every((entry: Entry) => entry?.author?.id !== account.toLowerCase())
  const userCanEnter = account && active && commissioner.id !== account && userHasNotSubmittedEntry

  return (
    <div>
      <H>ENTRIES FOR COMMISSION {commission.id}</H>
      <Level>
        <p>
          PROMPT <InterplanetaryContent path={commission.prompt} />
        </p>
        {userCanEnter && (
          <div>
            <button onClick={() => setEnterFormOpen((o) => !o)}>ENTER COMMISSION</button>
            {enterFormOpen && <EntryForm id={String(comId)} onComplete={refetch} />}
          </div>
        )}
        {submittedEntries.length === 0 ? (
          <p>NO ENTRIES MADE FOR COMMISSION {comId}</p>
        ) : (
          submittedEntries.map((entry: Entry) => <IndividualEntry key={entry.id} entry={entry} />)
        )}
      </Level>
    </div>
  )
}

const IndividualEntry = ({ entry }: { entry: Entry }) => {
  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="m-2 p-2 border rounded-sm cursor-pointer">
        <H>ENTRY {truncate(entry.id)}</H>
        <Level>
          <p>AUTHOR {entry.author.id}</p>
          <p>{new Date(+entry.timestamp * 1000).toLocaleString()}</p>
          <p>
            CONTENT <InterplanetaryContent path={entry.ipfsPath} />
          </p>
          <p>VOTES {entry.voteAmount}</p>
        </Level>
      </div>
    </Link>
  )
}

export default Entries
