import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { userProfileQuery } from '../../apollo/queries'
import CommissionSummary from '../../components/CommissionSummary'
import EntrySummary from '../../components/EntrySummary'

const UserProfile = () => {
  const {
    query: { userId },
  } = useRouter()
  const { data } = useQuery(userProfileQuery, { variables: { id: userId } })
  const user: User | undefined = data?.user
  if (!user) return <></>

  const {
    id,
    votesCast,
    ownEntries,
    tipsEarned,
    commissions,
    entriesMade,
    votesEarned,
    votesClaimed,
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

      {commissions.slice(0, 3).map((commission: Commission) => (
        <CommissionSummary key={commission.id} commission={commission} commissionerId={id} />
      ))}

      <p>ENTRIES MADE {entriesMade}</p>
      <p>COMMISSIONS WON {commissionsWon}</p>
      <p>VOTES EARNED {votesEarned}</p>
      <p>VOTES CAST {votesCast}</p>
      <p>VOTES CLAIMED {votesClaimed}</p>
      <p>VALUE CONTRIBUTED {valueContributed}</p>
      <p>TIPS EARNED {tipsEarned}</p>

      {ownEntries.slice(0, 3).map((entry: Entry) => (
        <EntrySummary key={entry.id} entry={entry} authorId={id} />
      ))}
    </div>
  )
}

export default UserProfile
