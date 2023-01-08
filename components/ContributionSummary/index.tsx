import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const ContributionSummary = ({ contribution }: { contribution: Contribution }) => {
  const { author, entry, total } = contribution
  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <Link href={`/user/${author.id}`}>
        <a>
          <TypeOut>AUTHOR {truncate(author.id)}</TypeOut>
        </a>
      </Link>
      <Link href={`/entry/${entry.id}`}>
        <div>
          <TypeOut>ENTRY {truncate(entry.id)}</TypeOut>
          <TypeOut>CONTENT</TypeOut>
          <InterplanetaryContent path={entry.ipfsPath} />
        </div>
      </Link>
      <TypeOut>TOTAL {total}</TypeOut>
    </div>
  )
}

export default ContributionSummary
