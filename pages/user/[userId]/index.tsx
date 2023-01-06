import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { userProfileQuery, userVotesQuery } from '../../../apollo/queries'
import CommissionSummary from '../../../components/CommissionSummary'
import EntrySummary from '../../../components/EntrySummary'
import VoteSummary from '../../../components/VoteSummary'

const UserProfile = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const { data } = useQuery(userProfileQuery, { variables: { id: userId } })
  const user: User | undefined = data?.user
  const res = useQuery(userVotesQuery, { variables: { userId } })
  const votes: Vote[] | undefined = res?.data?.votes

  if (!user) return <></>

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
      <p>USER {userId}</p>

      <p>COMMISSIONS CREATED {commissionsCreated}</p>
      <p>COMMISSIONS COMPLETED {commissionsCompleted}</p>
      <p>COMMISSIONS CANCELLED {commissionsCancelled}</p>

      {commissions.length > 0 && <p>COMMISSIONS</p>}
      {commissions.slice(0, 3).map((commission: Commission) => (
        <CommissionSummary key={commission.id} commission={commission} commissionerId={id} />
      ))}
      {commissions.length > 3 && <Link href={`/user/commissions/${id}`}>SEE ALL COMMISSIONS</Link>}

      <p>ENTRIES MADE {entriesMade}</p>
      <p>COMMISSIONS WON {commissionsWon}</p>
      <p>VOTES EARNED {votesEarned}</p>
      <p>VOTES CAST {votesCast}</p>
      <p>VALUE CONTRIBUTED {valueContributed}</p>
      <p>TIPS EARNED {tipsEarned}</p>

      {ownEntries.length > 0 && <p>ENTRIES</p>}
      {ownEntries.slice(0, 3).map((entry: Entry) => (
        <EntrySummary key={entry.id} entry={entry} authorId={id} />
      ))}
      {ownEntries.length > 3 && <Link href={`/user/${id}/entries`}>SEE ALL ENTRIES</Link>}

      {votes && votes.length > 0 && <p>VOTES</p>}
      {votes && votes.slice(0, 3).map((vote: Vote) => <VoteSummary key={vote.id} vote={vote} />)}
      {votes && votes.length > 3 && <Link href={`/user/${id}/votes`}>SEE ALL VOTES</Link>}
    </div>
  )
}

export default UserProfile
