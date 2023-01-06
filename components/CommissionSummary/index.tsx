import Link from 'next/link'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../InterplanetaryContent'

const CommissionSummary = ({
  commission,
  commissionerId,
}: {
  commission: Commission
  commissionerId?: string
}) => {
  const {
    id,
    prompt,
    active,
    reward,
    minTime,
    timestamp,
    entryCount,
    commissioner,
    winningAuthor,
    submittedEntries,
  } = commission
  return (
    <Link href={`/commission/${commission.id}`}>
      <div className="m-2 p-2 border rounded-sm cursor-pointer">
        <H>COMMISSION {id}</H>
        <Level>
          <InterplanetaryContent path={prompt} />
          <p>COMMISSIONER: {commissionerId || commissioner.id}</p>
          <p>REWARD: {reward}</p>
          <p>{active ? 'ACTIVE' : 'COMPLETED'}</p>
        </Level>
      </div>
    </Link>
  )
}

export default CommissionSummary
