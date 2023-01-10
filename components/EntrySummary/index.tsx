import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const EntrySummary = ({ entry, authorId }: { entry: Entry; authorId?: string }) => (
  <Link href={`/entry/${entry.id}`}>
    <a>
      <div className="m-2 p-2 crt-border rounded-sm cursor-pointer">
        <TypeOut>ENTRY {truncate(entry.id)}</TypeOut>
        <TypeOut>AUTHOR {truncate(authorId || entry.author.id)}</TypeOut>
        <TypeOut>CREATED {new Date(+entry.timestamp * 1000).toLocaleString()}</TypeOut>
        <TypeOut>CONTENT</TypeOut>
        <InterplanetaryContent path={entry.ipfsPath} maxChars={1000} />
        <TypeOut>
          {entry.voteAmount} {Number(entry.voteAmount) === 1 ? 'VOTE' : 'VOTES'}
        </TypeOut>
      </div>
    </a>
  </Link>
)

export default EntrySummary
