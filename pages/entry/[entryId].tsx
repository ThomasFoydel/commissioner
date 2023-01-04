import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { entryDetails } from '../../apollo/queries'
import { truncate } from '../../utils'

const EntryDetails = () => {
  const { account } = useEthers()
  const {
    query: { entryId },
  } = useRouter()

  const { data, refetch } = useQuery(entryDetails, { variables: { entryId } })
  const entry: Entry | undefined = data?.entry
  if (!entry) return <></>
  const { id, author, voteAmount, commission, ipfsPath, timestamp, contributions } = entry

  return (
    <div className="m-2 p-2 border rounded-sm">
      <p>
        {account === author.id.toLocaleLowerCase() && 'YOUR '}ENTRY {truncate(id)}
      </p>
      <p>AUTHOR {author.id}</p>
      <p>SUBMITTED {new Date(+timestamp * 1000).toLocaleString()}</p>
      <p>VOTES {voteAmount}</p>
      <p>
        COMMISSION PROMPT <InterplanetaryContent path={commission.prompt} />
      </p>
      <p>
        ENTRY CONTENT <InterplanetaryContent path={ipfsPath} />
      </p>
      {contributions.map((contribution) => (
        <Contribution key={contribution.id} contribution={contribution} />
      ))}
    </div>
  )
}

const Contribution = ({ contribution }: { contribution: Contribution }) => (
  <div className="m-2 p-2 border rounded-sm">
    <p>CONTRIBUTION {truncate(contribution.id)}</p>
    <p>TOTAL {contribution.total}</p>
    <p>CONTRIBUTOR {contribution.vote.voter}</p>
  </div>
)

export default EntryDetails
