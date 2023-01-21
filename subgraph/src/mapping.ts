import { BigInt } from '@graphprotocol/graph-ts'
import { User, Commission, Entry, Vote, Contribution } from '../generated/schema'
import {
  CommissionCancelled,
  CommissionCreated,
  EntrySubmitted,
  VoteSubmitted,
  WinnerTipped,
  WinnerChosen,
  RewardAdded,
} from '../generated/Factory/Factory'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

export function getUser(id: string): User {
  let user = User.load(id)
  if (!user) {
    user = new User(id)
    user.entriesMade = ZERO
    user.commissionsCreated = ZERO
    user.commissionsCompleted = ZERO
    user.commissionsCancelled = ZERO
    user.commissionsWon = ZERO
    user.votesEarned = ZERO
    user.votesCast = ZERO
    user.tipsEarned = ZERO
    user.valueContributed = ZERO
  }
  return user
}

export function getCommission(id: string): Commission {
  let commission = Commission.load(id)
  if (!commission) {
    commission = new Commission(id)
    commission.entryCount = ZERO
    commission.cancelled = false
    commission.active = true
    commission.complete = false
    commission.winningAuthor = null
    commission.canBeCancelled = true
  }
  return commission
}

export function getEntry(id: string): Entry {
  let entry = Entry.load(id)
  if (!entry) {
    entry = new Entry(id)
    entry.voteAmount = ZERO
  }
  return entry
}

export function getVote(id: string): Vote {
  let vote = Vote.load(id)
  if (!vote) {
    vote = new Vote(id)
  }
  return vote
}

export function getContribution(voteId: string, authorId: string): Contribution {
  const id = `${voteId}${authorId}`
  let contribution = Contribution.load(id)
  if (!contribution) {
    contribution = new Contribution(id)
    contribution.transactionHashes = []
  }
  return contribution
}

export function handleCommissionCancelled(event: CommissionCancelled): void {
  // (address indexed commission, uint256 indexed timestamp);
  const commissionId = event.params.commission.toHex()
  const commission = getCommission(commissionId)
  const commissioner = getUser(commission.commissioner)
  commissioner.commissionsCreated = commissioner.commissionsCreated.minus(ONE)
  commissioner.valueContributed = commissioner.valueContributed.minus(commission.reward)
  commission.canBeCancelled = false
  commission.cancelled = true

  commissioner.save()
  commission.save()
}

export function handleCommissionCreated(event: CommissionCreated): void {
  // (address indexed commissioner,uint indexed timestamp,uint reward,string prompt,address commission)
  const userId = event.params.commissioner.toHex()
  const commissionId = event.params.commission.toHex()

  const user = getUser(userId)
  user.commissionsCreated = user.commissionsCreated.plus(ONE)
  user.valueContributed = user.valueContributed.plus(event.params.reward)

  const commission = getCommission(commissionId)
  commission.commissioner = userId
  commission.reward = event.params.reward
  commission.prompt = event.params.prompt
  commission.timestamp = event.params.timestamp
  commission.minTime = event.params.minTime

  user.save()
  commission.save()
}

export function handleEntrySubmitted(event: EntrySubmitted): void {
  // (string ipfsPath, address author, address commission)
  const authorId = event.params.author.toHex()
  const commissionId = event.params.commission.toHex()
  const author = getUser(authorId)
  author.entriesMade = author.entriesMade.plus(ONE)
  const entry = getEntry(`${authorId}${commissionId}`)
  entry.author = authorId
  entry.commission = commissionId
  entry.ipfsPath = event.params.ipfsPath
  entry.timestamp = event.block.timestamp
  const commission = getCommission(commissionId)
  commission.entryCount = commission.entryCount.plus(ONE)
  commission.canBeCancelled = false

  entry.save()
  author.save()
  commission.save()
}

export function handleRewardAdded(event: RewardAdded): void {
  // (address indexed sender, uint256 indexed value, address indexed commission)
  const senderId = event.params.sender.toHex()
  const commissionId = event.params.commission.toHex()
  const commission = getCommission(commissionId)
  commission.reward = commission.reward.plus(event.params.value)
  const sender = getUser(senderId)
  sender.valueContributed = event.params.value
  if (sender.id !== commission.commissioner) commission.canBeCancelled = false

  commission.save()
  sender.save()
}

export function handleVoteSubmitted(event: VoteSubmitted): void {
  // (address indexed author, address indexed voter, uint256 amount, address commission)
  const authorId = event.params.author.toHex()
  const author = getUser(authorId)
  author.votesEarned = author.votesEarned.plus(event.params.amount)
  const voterId = event.params.voter.toHex()
  const voter = getUser(voterId)
  voter.votesCast = voter.votesCast.plus(event.params.amount)
  voter.valueContributed = voter.valueContributed.plus(event.params.amount)

  const commissionId = event.params.commission.toHex()
  const entryId = `${authorId}${commissionId}`
  const voteId = `${commissionId}${voterId}`

  const commission = getCommission(commissionId)
  const onepercent = event.params.amount.div(BigInt.fromI32(100))
  commission.reward = commission.reward.plus(onepercent)

  const vote = getVote(voteId)
  vote.voter = voterId
  vote.commission = commissionId

  const contribution = getContribution(voteId, authorId)
  const hashes = contribution.transactionHashes
  hashes.push(event.transaction.hash.toHexString())
  contribution.transactionHashes = hashes
  contribution.author = authorId
  contribution.entry = entryId
  contribution.total = contribution.total.plus(event.params.amount)
  contribution.vote = voteId

  const entry = getEntry(entryId)
  entry.author = authorId
  entry.voteAmount = entry.voteAmount.plus(event.params.amount)
  entry.commission = commissionId

  entry.save()
  contribution.save()
  vote.save()
  author.save()
  voter.save()
}

export function handleWinnerChosen(event: WinnerChosen): void {
  // (address winningAuthor, uint256 reward, address commission)
  const winnerId = event.params.winningAuthor.toHex()
  const winner = getUser(winnerId)
  winner.commissionsWon = winner.commissionsWon.plus(ONE)

  const commissionId = event.params.commission.toHex()
  const commission = getCommission(commissionId)
  commission.winningAuthor = winnerId
  commission.active = false
  commission.complete = true

  const commissionerUser = getUser(commission.commissioner)
  commissionerUser.commissionsCompleted = commissionerUser.commissionsCompleted.plus(ONE)

  winner.save()
  commission.save()
  commissionerUser.save()
}

export function handleWinnerTipped(event: WinnerTipped): void {
  // (address winningAuthor, uint256 amount, address commission, address tipper)
  const winnerId = event.params.winningAuthor.toHex()
  const winner = getUser(winnerId)
  winner.tipsEarned = winner.tipsEarned.plus(event.params.amount)

  const tipperId = event.params.tipper.toHex()
  const tipper = getUser(tipperId)
  tipper.valueContributed = tipper.valueContributed.plus(event.params.amount)

  winner.save()
  tipper.save()
}
