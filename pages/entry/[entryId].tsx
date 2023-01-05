import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { entryDetails } from '../../apollo/queries'
import { truncate } from '../../utils'
import Link from 'next/link'
import VoteForm from '../../components/VoteForm'

const EntryDetails = () => {
  const { account } = useEthers()
  const router = useRouter()
  const entryId = String(router.query.entryId).toLowerCase()

  const { data, refetch } = useQuery(entryDetails, { variables: { entryId } })
  const entry: Entry | undefined = data?.entry
  if (!entry) return <></>
  const { id, author, voteAmount, commission, ipfsPath, timestamp, contributions } = entry

  return (
    <div className="m-2 p-2 border rounded-sm">
      <p>
        {account === author.id.toLocaleLowerCase() && 'YOUR '}ENTRY {truncate(id)}
      </p>
      <Link href={`/user/${author.id}`}>
        <p>AUTHOR {author.id}</p>
      </Link>
      <p>SUBMITTED {new Date(+timestamp * 1000).toLocaleString()}</p>
      <p>VOTES {voteAmount}</p>
      <Link href={`/commission/${commission.id}`}>
        <p>
          COMMISSION PROMPT <InterplanetaryContent path={commission.prompt} />
        </p>
      </Link>
      <p>
        CONTENT <InterplanetaryContent path={ipfsPath} />
      </p>

      <VoteForm onSuccess={refetch} entry={entry} commission={commission} />

      {contributions.map((contribution) => (
        <Contribution key={contribution.id} contribution={contribution} />
      ))}
    </div>
  )
}

const Contribution = ({ contribution }: { contribution: Contribution }) => (
  <div className="m-2 p-2 border rounded-sm">
    <Link href={`/user/${contribution.vote.voter.id}`}>
      <p>CONTRIBUTOR {contribution.vote.voter.id}</p>
    </Link>
    <p>TOTAL {contribution.total}</p>
  </div>
)

export default EntryDetails
