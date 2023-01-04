import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'

const EntrySummary = ({ entry, authorId }: { entry: Entry; authorId?: string }) => (
  <Link href={`/entry/${entry.id}`}>
    <div className="m-2 p-2 border rounded-sm cursor-pointer">
      <p>ENTRY {truncate(entry.id)}</p>
      <p>AUTHOR {truncate(authorId || entry.author.id)}</p>
      <p>
        CONTENT <InterplanetaryContent path={entry.ipfsPath} />
      </p>
      <p>
        {entry.voteAmount} {Number(entry.voteAmount) === 1 ? 'VOTE' : 'VOTES'}
      </p>
    </div>
  </Link>
)

export default EntrySummary
