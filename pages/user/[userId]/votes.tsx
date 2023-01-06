import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import VoteSummary from '../../../components/VoteSummary'
import { userVotesQuery } from '../../../apollo/queries'

const UserVotes = () => {
  const { account } = useEthers()
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()

  const res = useQuery(userVotesQuery, { variables: { userId } })
  const votes = res?.data?.votes
  if (!votes) return <></>
  return (
    <div>
      <H>{account && userId === account.toLowerCase() ? 'YOUR' : userId} CONTRIBUTIONS</H>
      <Level>
        {votes.length === 0 && 'NO VOTES'}
        {votes.map((vote: Vote) => (
          <VoteSummary key={vote.id} vote={vote} />
        ))}
      </Level>
    </div>
  )
}

export default UserVotes
