import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'

const EntrySummary = ({ entry, authorId }: { entry: Entry; authorId?: string }) => (
  <Link href={`/entry/${entry.id}`}>
    <div className="m-2 p-2 crt-border rounded-sm cursor-pointer">
      <p>ENTRY {truncate(entry.id)}</p>
      <p>AUTHOR {truncate(authorId || entry.author.id)}</p>
      <div>
        CONTENT <InterplanetaryContent path={entry.ipfsPath} />
      </div>
      <p>
        {entry.voteAmount} {Number(entry.voteAmount) === 1 ? 'VOTE' : 'VOTES'}
      </p>
    </div>
  </Link>
)

export default EntrySummary
