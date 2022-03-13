export interface iUser {
  id: string
  commissions: [iCommission]
  ownEntries: [iEntry]
  entriesMade: string
  commissionsCreated: string
  commissionsCompleted: string
  commissionsCancelled: string
  commissionsWon: string
  votesEarned: string
  votesClaimed: string
  votesCast: string
  tipsEarned: string
  valueContributed: string
}

export interface iVote {
  id: string
  contributions: [iContribution]
  voter: iUser
  commission: iCommission
}

export interface iContribution {
  id: string
  transactionHashes: [string]
  author: iUser
  entry: iEntry
  total: string
  vote: iVote
}

export interface iEntry {
  id: string
  contributions: [iContribution]
  author: iUser
  voteAmount: string
  commission: iCommission
  ipfsPath: string
  content: string
  timestamp: string
}

export interface iCommission {
  id: string
  submittedEntries: [iEntry]
  commissioner: iUser
  winningAuthor: iUser
  entryCount: number
  prompt: string
  content: string
  reward: string
  timestamp: string
}

export class ErrorResponse {
  constructor(public message: string, public status: number, public code: number) {}
}

export class MetaMaskError {
  constructor(public message: string, public stack: string, public code: number) {}
}
