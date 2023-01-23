import { gql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { formatEther } from 'ethers/lib/utils'
import { textLine, textWord } from 'crt-terminal'
import { comDetails, userProfileQuery } from '../../apollo/queries'
import { readTextFromIpfs } from '../ipfs/client'
import { client } from '../../apollo/client'
import axios from 'axios'

export const getIpfsText = async (path: string) => {
  try {
    return await readTextFromIpfs(path)
  } catch (err) {
    return path
  }
}

export const timeStringFromSeconds = (secondsRemaining: number, full = true, exact = false) => {
  let seconds = secondsRemaining || 0
  seconds = Number(seconds)
  seconds = Math.abs(seconds)

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (full) {
    let res = ''
    res += `${d}d `
    res += `${h}h `
    res += `${m}m `
    res += `${s}s `
    return res
  }
  if (exact) {
    let res = ''
    res += d > 0 ? `${d}d ` : ''
    res += h > 0 ? `${h}h ` : ''
    res += m > 0 ? `${m}m ` : ''
    res += s > 0 ? `${s}s ` : ''
    return res || '0s'
  }
  if (d > 0) return `${d} day${d > 1 ? 's' : ''}`
  if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`
  if (m > 0) return `${m} minute${m > 1 ? 's' : ''}`
  if (h > 0) return `${s} second${s > 1 ? 's' : ''}`
  if (s > 0) return `${s} second${s > 1 ? 's' : ''}`
}

export const makeCommissionString = async (
  commission: Commission,
  index: number | null,
  includeDetails: boolean
) => {
  const {
    winningAuthor,
    reward,
    entryCount,
    timestamp,
    content,
    id,
    commissioner,
    minTime,
    active,
    submittedEntries,
  } = commission
  const creation = new Date(Number(timestamp) * 1000)
  const winner = `${winningAuthor ? `\n    WINNING AUTHOR: ${winningAuthor.id}` : ''}`
  const winningEntry = submittedEntries.find((entry) => entry.author.id === winningAuthor?.id)
  const winningEntryContent = winningEntry
    ? (await axios(`/api/ipfs/${winningEntry.ipfsPath}`))?.data?.content
    : ''

  const winningEntryData = winningEntry ? `\n    WINNING ENTRY CONTENT: ${winningEntryContent}` : ''
  const triggerDetails =
    Number(timestamp) + Number(minTime) + 172800 < Date.now() / 1000 && active
      ? 'PUBLIC TRIGGER OPEN'
      : Number(timestamp) + Number(minTime) < Date.now() / 1000 && active
      ? `COMMISSIONER TRIGGER OPEN.\n${timeStringFromSeconds(
          172800 + Number(timestamp) + Number(minTime) - Date.now() / 1000
        )} UNTIL PUBLIC TRIGGER.`
      : `${timeStringFromSeconds(
          Number(timestamp) + Number(minTime) - Date.now() / 1000
        )}UNTIL COMMISSIONER TRIGGER OPENS.\n    ${timeStringFromSeconds(
          172800 + Number(timestamp) + Number(minTime) - Date.now() / 1000
        )}UNTIL PUBLIC TRIGGER OPENS.`

  const details = `
    COMMISSIONER: ${commissioner.id}
    ENTRY COUNT: ${entryCount}
    ${active ? triggerDetails : ''}\n    `

  const characters = `
${index ? `index ${index}` : ''}
    COMMISION: ${id}
    CREATED: ${creation.toLocaleTimeString()} ${creation.toLocaleDateString()}${
    includeDetails
      ? details
      : `
    `
  }REWARD: ${formatEther(reward)} ETH
    PROMPT: ${
      !includeDetails && content.length > 140 ? content.slice(0, 140) + '...' : content
    }${winner}${winningEntryData}
`
  return characters
}

export const line = (characters: string) =>
  textLine({
    words: [textWord({ characters })],
  })

export const addCommissionPromptContent = async (commissions: Commission[]) => {
  const commissionsWithIps = await Promise.all(
    commissions.map(async (com: Commission) => {
      const ipfsData = await getIpfsText(com.prompt)
      return { ...com, content: ipfsData }
    })
  )
  return commissionsWithIps
}

export const fetchCommissions = async (getCommissionsQuery: DocumentNode, user?: User) => {
  const q = {
    query: getCommissionsQuery,
    fetchPolicy: 'no-cache',
  }
  if (user) q['variables'] = { userId: user.id }
  const res = await client.query(q as any)
  const commissions = res?.data?.commissions
  const commissionsWithPromptContent = await addCommissionPromptContent(commissions)
  return commissionsWithPromptContent
}

export const fetchCommission = async (comId: string) => {
  const res = await client.query({
    query: comDetails,
    variables: { comId },
    fetchPolicy: 'no-cache',
  })
  const commission = res?.data?.commission
  if (commission) {
    const ipfsData = await getIpfsText(commission.prompt)
    return { ...commission, content: ipfsData }
  }
}

export const makeCommissionQuery = (
  order: string,
  direction: string,
  page: number,
  perPage: number,
  user?: User
) => {
  const noOrder = order === 'none'
  const orderField = order === 'created' ? 'timestamp' : order
  const orderText = noOrder ? '' : `orderBy: ${orderField}, orderDirection: ${direction},`
  const paginationText = `skip: ${perPage * page}, first: ${perPage}`
  const userArg = user ? `where: {commissioner: $userId},` : ''
  const args = `(${userArg}${orderText}${paginationText})`
  const userArgTypes = user ? '($userId: String)' : ''
  return gql`
    query getCommissions${userArgTypes} {
      commissions${args} {
        id
        canBeCancelled
        commissioner {
          id
        }
        submittedEntries {
          id
          author {
              id
          }
          voteAmount
          ipfsPath
          timestamp
        }
        entryCount
        prompt
        winningAuthor {
          id
        }
        reward
        timestamp
        minTime
        active
      }
    }
  `
}

export const makeEntriesQuery = (
  field: string,
  direction: string,
  page: number,
  perPage: number,
  selectedUser?: User
) => {
  const noSort = field === 'none'
  let fieldName = field === 'created' ? 'timestamp' : 'vote' ? 'voteAmount' : field
  const sortText = noSort ? '' : `orderBy: ${fieldName}, orderDirection: ${direction}, `
  const paginationText = `skip: ${perPage * page}, first: ${perPage}, `
  const argType = selectedUser ? '$userId' : '$id'
  const queryArg = selectedUser ? '{ author: $userId }' : '{ commission: $id }'
  return gql`
        query getEntries(${argType}: String) {
            entries(${sortText}${paginationText}where: ${queryArg}) {
                id
                timestamp
                contributions {
                    id
                    transactionHashes
                    author {
                        id
                    }
                    total
                    vote {
                        voter {
                            id
                        }
                    }
                }
                author {
                    id
                }
                voteAmount
                ipfsPath
            }
        }
    `
}

export const getUser = async (user: string) => {
  const res = await client.query({ query: userProfileQuery, variables: { id: user.toLowerCase() } })
  return res?.data?.user
}
