import { gql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { formatEther } from 'ethers/lib/utils'
import { textLine, textWord } from 'crt-terminal'
import { comDetails, userCommissionsQuery, userProfileQuery } from '../../../apollo/queries'
import { readTextFromIpfs } from '../../../utils/ipfs/client'
import { client } from '../../../apollo/client'

export const getIpfsText = async (path: string) => {
  try {
    return await readTextFromIpfs(path)
  } catch (err) {
    return path
  }
}

export const timeStringFromSeconds = (secondsRemaining: number, exact = true) => {
  let seconds = secondsRemaining || 0
  seconds = Number(seconds)
  seconds = Math.abs(seconds)

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

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

export const makeCommissionString = (
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
  } = commission
  const creation = new Date(Number(timestamp) * 1000)
  const winner = `${
    winningAuthor
      ? `
    WINNING AUTHOR: ${winningAuthor}`
      : ''
  }`

  const details = `
    COMMISSIONER: ${commissioner.id}
    ENTRY COUNT: ${entryCount}
    ${
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
    }
    `

  const characters = `
${index ? `index ${index}` : ''}
    COMMISION: ${id}
    CREATED: ${creation.toLocaleTimeString()} ${creation.toLocaleDateString()}${
    includeDetails
      ? details
      : `
    `
  }REWARD: ${formatEther(reward)} ETH${winner}
    PROMPT: ${!includeDetails && content.length > 140 ? content.slice(0, 140) + '...' : content}
  
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

export const fetchCommissions = async (getCommissionsQuery: DocumentNode) => {
  const res = await client.query({ query: getCommissionsQuery, fetchPolicy: 'no-cache' })
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

  const ipfsData = await getIpfsText(commission.prompt)
  return { ...commission, content: ipfsData }
}

export const makeCommissionQuery = (
  order: string,
  direction: string,
  page: number,
  perPage: number
) => {
  const noOrder = order === 'none'
  const orderField = order === 'created' ? 'timestamp' : order
  const orderText = noOrder ? '' : `orderBy: ${orderField}, orderDirection: ${direction},`
  const paginationText = `skip: ${perPage * page}, first: ${perPage}`
  const args = `(${orderText}${paginationText})`
  return gql`
        query getCommissions {
            commissions${args} {
                id
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
                winningAuthor
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
  perPage: number
) => {
  const noSort = field === 'none'
  let fieldName = field === 'created' ? 'timestamp' : 'vote' ? 'voteAmount' : field
  const sortText = noSort ? '' : `orderBy: ${fieldName}, orderDirection: ${direction}, `
  const paginationText = `skip: ${perPage * page}, first: ${perPage}, `
  return gql`
        query getEntries($id: String) {
            entries(${sortText}${paginationText}where: { commission: $id }) {
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

export const getUserCommissions = async (userId: string) => {
  const res = await client.query({
    query: userCommissionsQuery,
    variables: { userId },
    fetchPolicy: 'no-cache',
  })
  const commissions = res?.data?.commissions
  const commissionsWithPromptContent = await addCommissionPromptContent(commissions)
  return commissionsWithPromptContent
}
