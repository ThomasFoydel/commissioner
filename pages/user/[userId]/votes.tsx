import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import VoteSummary from '../../../components/VoteSummary'
import LoadingDots from '../../../components/LoadingDots'
import { userVotesQuery } from '../../../apollo/queries'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'

const UserVotes = () => {
  const { account } = useEthers()
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()

  const { data, loading } = useQuery(userVotesQuery, { variables: { userId } })
  const votes = data?.votes

  if (votes === undefined && !loading) return <TypeOut>NO VOTES FOUND BY USER {userId}</TypeOut>
  if (votes === undefined) return <LoadingDots />

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

UserVotes.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserVotes
