import Link from 'next/link'
import { formatEther } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../InterplanetaryContent'
import TypeOut from '../TypeOut'

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
      <div className="m-2 p-2 crt-border rounded-sm cursor-pointer">
        <H>
          <TypeOut>COMMISSION {id}</TypeOut>
        </H>
        <Level>
          <InterplanetaryContent path={prompt} />
          <TypeOut>COMMISSIONER: {commissionerId || commissioner.id}</TypeOut>
          <TypeOut>REWARD: {formatEther(reward)} ETH</TypeOut>
          <TypeOut>{active ? 'ACTIVE' : 'COMPLETED'}</TypeOut>
        </Level>
      </div>
    </Link>
  )
}

export default CommissionSummary
