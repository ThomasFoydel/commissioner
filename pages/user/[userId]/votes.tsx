import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import { userVotesQuery } from '../../../apollo/queries'
import { truncate } from '../../../utils'

const UserVotes = () => {
  const { account } = useEthers()
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()

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
  const { contributions, commission } = vote

  return (
    <div className="m-2 p-2 border rounded-sm">
      <Link href={`/commission/${commission.id}`}>
        <div>
          <p>COMMISSION {truncate(commission.id)}</p>
          <p>
            PROMPT <InterplanetaryContent path={commission.prompt} />
          </p>
        </div>
      </Link>

      {contributions.map((contribution) => (
        <div className="m-2 p-2 border rounded-sm">
          <Link href={`/user/${contribution.author.id}`}>
            <p>AUTHOR {truncate(contribution.author.id)}</p>
          </Link>
          <Link href={`/entry/${contribution.entry.id}`}>
            <div>
              <p>ENTRY {truncate(contribution.entry.id)}</p>
              <p>
                CONTENT <InterplanetaryContent path={contribution.entry.ipfsPath} />
              </p>
            </div>
          </Link>
          <p>TOTAL {contribution.total}</p>
        </div>
      ))}
    </div>
  )
}
export default UserVotes
