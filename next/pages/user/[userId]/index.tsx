import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import { userProfileQuery, userVotesQuery } from '../../../apollo/queries'
import CommissionSummary from '../../../components/CommissionSummary'
import EntrySummary from '../../../components/EntrySummary'
import VoteSummary from '../../../components/VoteSummary'
import LoadingDots from '../../../components/LoadingDots'
import TypeOut from '../../../components/TypeOut'
import Layout from '../../layouts/CRT'

const UserProfile = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const { data, loading } = useQuery(userProfileQuery, { variables: { id: userId } })
  const user: User | undefined = data?.user
  const res = useQuery(userVotesQuery, { variables: { userId } })
  const votes: Vote[] | undefined = res?.data?.votes

  if (!user && !loading) {
    return (
      <TypeOut>
        NO PROFILE YET FOR {userId}.<br />
        SUBMIT A TRANSACTION TO GET STARTED.
      </TypeOut>
    )
  }

  if (user === undefined) return <LoadingDots />

  const {
    id,
    votesCast,
    ownEntries,
    tipsEarned,
    commissions,
    entriesMade,
    votesEarned,
    commissionsWon,
    valueContributed,
    commissionsCreated,
    commissionsCancelled,
    commissionsCompleted,
  } = user
  return (
    <div>
      <H>
        <TypeOut>USER {userId}</TypeOut>
      </H>
      <Level>
        <TypeOut>COMMISSIONS CREATED {commissionsCreated}</TypeOut>
        <TypeOut>COMMISSIONS COMPLETED {commissionsCompleted}</TypeOut>
        <TypeOut>COMMISSIONS CANCELLED {commissionsCancelled}</TypeOut>

        {commissions.length > 0 && <TypeOut>COMMISSIONS</TypeOut>}
        {commissions.slice(0, 3).map((commission: Commission) => (
          <CommissionSummary key={commission.id} commission={commission} commissionerId={id} />
        ))}
        {commissions.length > 3 && (
          <Link href={`/user/${id}/commissions`}>
            <TypeOut>SEE ALL COMMISSIONS</TypeOut>
          </Link>
        )}

        <TypeOut>ENTRIES MADE {entriesMade}</TypeOut>
        <TypeOut>COMMISSIONS WON {commissionsWon}</TypeOut>
        <TypeOut>VOTES EARNED {votesEarned}</TypeOut>
        <TypeOut>VOTES CAST {votesCast}</TypeOut>
        <TypeOut>VALUE CONTRIBUTED {valueContributed}</TypeOut>
        <TypeOut>TIPS EARNED {tipsEarned}</TypeOut>

        {ownEntries.length > 0 && <TypeOut>ENTRIES</TypeOut>}
        {ownEntries.slice(0, 3).map((entry: Entry) => (
          <EntrySummary key={entry.id} entry={entry} authorId={id} />
        ))}
        {ownEntries.length > 3 && (
          <Link href={`/user/${id}/entries`}>
            <TypeOut>SEE ALL ENTRIES</TypeOut>
          </Link>
        )}

        {votes && votes.length > 0 && <TypeOut>VOTES</TypeOut>}
        {votes && votes.slice(0, 3).map((vote: Vote) => <VoteSummary key={vote.id} vote={vote} />)}
        {votes && votes.length > 3 && (
          <Link href={`/user/${id}/votes`}>
            <TypeOut>SEE ALL VOTES</TypeOut>
          </Link>
        )}
      </Level>
    </div>
  )
}

UserProfile.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default UserProfile
