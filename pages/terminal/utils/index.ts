import { gql } from '@apollo/client'
import axios from 'axios'
import { textLine, textWord } from 'crt-terminal'
import { formatEther } from 'ethers/lib/utils'
import { DocumentNode } from 'graphql'
import { client } from '../../../apollo/client'
import { comDetails, userProfileQuery } from '../../../apollo/queries'

export const getIpfsText = async (path: string) => {
  try {
    const res = await axios.get(`https://ipfs.infura.io/ipfs/${path}`)
    return res?.data
  } catch (err) {
    console.log('getIpfsText error: ', err, path)
    return path
  }
}

export const makeCommissionString = (
  commission: Commission,
  index: number | null,
  includeDetails: boolean
) => {
  const { winningAuthor, reward, entryCount, timestamp, content, id, commissioner } = commission
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
    `

  const characters = `
${index ? `index ${index}` : ''}
    COMMISION: #${id}
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

export const fetchCommissions = async (getCommissionsQuery: DocumentNode) => {
  const res = await client.query({ query: getCommissionsQuery, fetchPolicy: 'no-cache' })

  const commissions = res?.data?.commissions

  const commissionsWithIps = await Promise.all(
    commissions.map(async (com: Commission) => {
      const ipfsData = await getIpfsText(com.prompt)
      return { ...com, content: ipfsData }
    })
  )
  return commissionsWithIps
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
