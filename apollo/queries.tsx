import { gql } from '@apollo/client'

// votes field on submittedEntries is [Contribution]
const comFields = `
    id
    commissioner {
        id
    }
    submittedEntries @Entry {
        id
        ipfsPath       
        votes {
            total
            vote {
                voter {
                    id
                }
            }
        }
        author {
            id
            commissionsWon
            entriesMade
        }
        voteAmount
    }
    entryCount
    prompt
    winningAuthor
    reward
    timestamp
`

export const comDetails = gql`
    query getComDetail($comId: String!) {
        commission(id: $comId) {
            ${comFields}
        }
    }
`

export const userProfileFields = `
    commissions {
        submittedEntries @Entry {
            id
            author {
                id
            }
            voteAmount
        }
        winningAuthor {
            id
        }
        id
        entryCount
        prompt
        reward
        timestamp
    }
    ownEntries {
        id
        ipfsPath
        votes {
            total
            vote {
                voter {
                    id
                }
            }
        }
        voteAmount
        commission {
            id
            reward
            prompt
        }
    }
    entriesMade 
    commissionsCreated
    commissionsCompleted
    commissionsCancelled
    commissionsWon
    votesEarned
    votesClaimed
    votesCast
    tipsEarned 
    valueContributed
`

export const userProfileQuery = gql`
        query getUserDetails($id: String!) {
            user(id: $id) {
                ${userProfileFields}
            }
        }
    `
