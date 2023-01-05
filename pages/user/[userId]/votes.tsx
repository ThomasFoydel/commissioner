import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { useRouter } from 'next/router'
import React from 'react'
import { userVotesQuery } from '../../../apollo/queries'

const UserVotes = () => {
  const { account } = useEthers()
  const {
    query: { userId },
  } = useRouter()

  const res = useQuery(userVotesQuery, { variables: { userId } })
  const votes = res?.data?.votes
  if (!votes) return <></>
  return (
    <div>
      <p>{account && userId === account.toLowerCase() ? 'YOUR' : userId} CONTRIBUTIONS</p>
      {votes.length === 0 && 'NO VOTES'}
      {votes.map((vote: Vote) => (
        <VoteSummary key={vote.id} vote={vote} />
      ))}
    </div>
  )
}

const VoteSummary = ({ vote }: { vote: Vote }) => {
  const { contributions, id, commission } = vote
  console.log({ contributions, id, commission })
  return <>vote summary</>
}
export default UserVotes
