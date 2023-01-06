import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { H, Level } from 'react-accessible-headings'
import EntrySummary from '../../../components/EntrySummary'
import { userEntriesQuery } from '../../../apollo/queries'

const UserEntries = () => {
  const router = useRouter()
  const userId = String(router.query.userId).toLowerCase()
  const { data } = useQuery(userEntriesQuery, { variables: { userId } })
  const entries = data?.entries
  if (!entries) return <></>

  return (
    <div>
      <H>ALL ENTRIES BY USER {userId}</H>
      <Level>
        <div>
          {entries.map((entry: Entry) => (
            <EntrySummary key={entry.id} entry={entry} />
          ))}
        </div>
      </Level>
    </div>
  )
}

export default UserEntries
