import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const ContributionSummary = ({ contribution }: { contribution: Contribution }) => {
  const { author, entry, total } = contribution
  return (
    <Link href={`/contribution/${contribution.id}`}>
      <div className="m-2 p-2 crt-border rounded-sm">
        <TypeOut>AUTHOR {truncate(author.id)}</TypeOut>
        <div>
          <TypeOut>ENTRY {truncate(entry.id)}</TypeOut>
          <TypeOut>CONTENT</TypeOut>
          <InterplanetaryContent path={entry.ipfsPath} maxChars={100} />
        </div>

        <TypeOut>TOTAL {total}</TypeOut>
      </div>
    </Link>
  )
}

export default ContributionSummary
