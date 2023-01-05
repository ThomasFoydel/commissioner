import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'

const ContributionSummary = ({ contribution }: { contribution: Contribution }) => {
  const { author, entry, total } = contribution
  return (
    <div className="m-2 p-2 border rounded-sm">
      <Link href={`/user/${author.id}`}>
        <p>AUTHOR {truncate(author.id)}</p>
      </Link>
      <Link href={`/entry/${entry.id}`}>
        <div>
          <p>ENTRY {truncate(entry.id)}</p>
          <p>
            CONTENT <InterplanetaryContent path={entry.ipfsPath} />
          </p>
        </div>
      </Link>
      <p>TOTAL {total}</p>
    </div>
  )
}

export default ContributionSummary
