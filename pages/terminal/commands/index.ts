import { Contract } from 'ethers'
import { DocumentNode } from 'graphql'
import { Interface, parseEther } from 'ethers/lib/utils'
import { JsonRpcSigner } from '@ethersproject/providers'
import commissionAbi from '../../../utils/ethers/ABIs/commissionABI.json'
import { ErrorResponse, MetaMaskError } from '../../../utils/types/error'
import { uploadTextToIpfs } from '../../../utils/ipfs/client'
import { client } from '../../../apollo/client'
import {
  directions,
  entriesPerPage,
  entrySortFields,
  commissionsPerPage,
  commissionOrderFields,
} from '../../../utils/constants'
import {
  getUser,
  getIpfsText,
  fetchCommission,
  fetchCommissions,
  makeCommissionString,
} from '../utils'

export const handleDisplayCommissions = async (
  printLine: Function,
  loading: Function,
  setCommissionsDisplayed: Function,
  getCommissionsQuery: DocumentNode,
  page: number,
  user?: User
) => {
  loading(true)
  printLine(`COMMISSIONS${user ? ` BY USER ${user.id}` : ''}`)
  printLine(`page ${page + 1}`)
  const coms = await fetchCommissions(getCommissionsQuery, user)
  setCommissionsDisplayed(coms)
  const comStrings = coms.map((com, i) => makeCommissionString(com, i + 1, false))
  comStrings.forEach((com) => printLine(com))
  printLine('\n\n')
  printLine('commands: next, back, sort (field), details (index#), go (page)')
  loading(false)
}

export const handleDisplayCommissionDetails = async (
  printLine: Function,
  loading: Function,
  commission: Commission,
  account: string
) => {
  loading(true)
  const characters = makeCommissionString(commission, null, true)
  loading(false)
  printLine(characters)
  printLine(`
    `)

  const { commissioner, timestamp, minTime } = commission
  const now = Date.now() / 1000
  const secondsPassed = now - Number(timestamp)
  const minTimePassed = secondsPassed > Number(minTime)
  const commissionerOptions = `cancel, ${minTimePassed ? 'select winner' : ''}`
  printLine(
    `commands: view entries, create-entry, ${
      commissioner.id === account.toLowerCase() ? commissionerOptions : ''
    }view commissioner, return`
  )
  loading(false)
}

export const createCommissionIPFS = async (content: string, error: Function) => {
  let path: string
  try {
    path = await uploadTextToIpfs(content)
  } catch (err) {
    error(err)
  }
  return path || ''
}

export const handleIPFSInput = async (
  command: string,
  printLine: Function,
  setPath: Function,
  loading: Function
) => {
  printLine('uploading your content to ipfs...')
  loading(true)
  const handleIPFSError = (err: ErrorResponse) => console.log('handleIPFSError: ', err)
  const ipfsPath = await createCommissionIPFS(command, handleIPFSError)
  if (ipfsPath.length === 0) {
    printLine('IPFS upload failed...')
    loading(false)
    return false
  }
  setPath(ipfsPath)
  printLine('ipfs content uploaded. path:')
  printLine(ipfsPath)
  printLine('enter initial reward amount (in eth): ')
  loading(false)
  return true
}
export const handleRewardInput = async (
  reward: string,
  setReward: Function,
  printLine: Function,
  loading: Function
) => {
  loading(true)
  if (isNaN(Number(reward))) {
    printLine('invalid entry. please enter a valid number for the initial reward.')
    loading(false)
    return false
  }

  printLine(`initial reward of ${reward} eth selected.`)

  printLine('please enter a minimum time in days (at least 2): ')

  setReward(reward)
  loading(false)
  return true
}

export const handleMinTimeInput = async (
  minTime: string,
  setMinTime: Function,
  printLine: Function
) => {
  if (isNaN(Number(minTime))) {
    printLine(
      'invalid entry. minimum time must be a number.\nplease select a minimum time in days:'
    )
    return false
  }
  if (Number(minTime) < 2) {
    printLine(
      'invalid entry. minimum time must be at least 2 days.\nplease select a minimum time in days:'
    )
    return false
  }
  setMinTime(minTime)
  printLine(`selected minimum time: ${minTime} days`)
  printLine('do you wish to proceed? (yes/no)')
  return true
}

export const handleCreateCommission = async (
  command: string,
  reward: string,
  minTime: string,
  path: string,
  setPage: Function,
  loading: Function,
  factoryContract: Contract | null,
  printLine: Function,
  setTransactionHash: Function
) => {
  if (command.toLowerCase() === 'yes') {
    if (!factoryContract)
      return printLine(
        'commission creation failed. no connection to factory contract, please your check metamask connection.'
      )

    loading(true)

    printLine('approve in metamask')
    const options = { value: parseEther(reward).toString() }
    const numberDays = Number(minTime)
    const minTimeSeconds = numberDays * 24 * 60 * 60
    try {
      const tx = await factoryContract.createCommission(path, minTimeSeconds, options)
      printLine(`creating your commission... transaction hash ${tx.hash}`)
      setTransactionHash(tx.hash)
      printLine('hang tight this will take a minute...')
      const receipt = await tx.wait()
      if (receipt) printLine('successfully uploaded')
      const comId = receipt.events[0].args.commission
      printLine(`commission address: ${comId}`)
      setPage('commission-success')
    } catch (err) {
      if (err instanceof ErrorResponse) {
        if (err.code === 4001)
          printLine('user rejected transaction in metamask. would you like to try again? (yes/no)')
        else
          printLine(
            'commission creation error... error message: ' +
              JSON.stringify(err.message) +
              '. would you like to try again? (yes/no)'
          )
      }
    }

    loading(false)
  } else {
    setPage('home')
    printLine('okay. what do you want to do instead?')
  }
}

export const handleEntryIpfs = async (
  content: string,
  setEntryPath: Function,
  loading: Function,
  printLine: Function
) => {
  loading(true)
  try {
    const path = await uploadTextToIpfs(content)
    setEntryPath(path)
    loading(false)
    printLine(`ipfs upload successful. ipfs path: ${path}`)
    printLine('do you want to proceed? (yes/no)')
    return true
  } catch (err) {
    printLine('ipfs upload failed')
    loading(false)
    return false
  }
}

const commissionInterface = new Interface(commissionAbi)

export const handleCreateEntry = async (
  command: string,
  commission: Commission,
  entryPath: string,
  signer: JsonRpcSigner,
  printLine: Function,
  userId: string
) => {
  if (command.toLowerCase() === 'yes') {
    const userAlreadyEntered = commission?.submittedEntries
      ?.map((entry: Entry) => entry.author.id)
      .includes(userId)
    if (userAlreadyEntered) return printLine('you already entered this commission')

    const commissionContract = new Contract(commission.id, commissionInterface, signer)
    try {
      printLine('please approve transaction with metamask')
      const tx = await commissionContract.submitEntry(entryPath)
      printLine(`creating entry...`)
      printLine(`transaction hash: ${tx.hash}`)
      const receipt = await tx.wait()
      if (receipt) {
        printLine(`entry created`)
        return true
      }
    } catch (err) {
      printLine('transaction failed.')
      if (err instanceof MetaMaskError) {
        if (err.code === 4001) {
          printLine('user rejected transaction in metamask')
        } else {
          printLine(`error: ${JSON.stringify(err.message)}`)
        }
      }
      printLine('would you like to try again? (yes/no)')
    }
  } else {
    printLine('okay. what would you like to do?')
    return false
  }
}

const processEntry = (entry: Entry, i: number | null) => {
  const { id, contributions, author, voteAmount, content, ipfsPath, timestamp } = entry
  const voters = contributions.map((v) => v?.vote?.voter?.id)
  const displayVoters = voters.length > 0 ? voters.join(',') : 'no voters yet'
  const displayContent =
    content.length < 120 || i === null ? content.slice(0, 888) : `${content.slice(0, 120)}...`
  const index =
    typeof i === 'number'
      ? `
INDEX ${i + 1}`
      : ''
  return `${index}
    ID: ${id}
    TIMESTAMP: ${timestamp}
    AUTHOR: ${author?.id}
    VOTES: ${voteAmount}
    IPFS PATH: ${ipfsPath}
    VOTERS: ${displayVoters}
    CONTENT: ${displayContent}
    `
}

const getEntryContent = async (entry: Entry) => {
  const { ipfsPath } = entry
  const content = await getIpfsText(ipfsPath)
  return { ...entry, content }
}

export const handleDisplayEntries = async (
  commission: Commission,
  printLine: Function,
  setDisplayedEntries: Function,
  getEntriesQuery: DocumentNode
) => {
  printLine(`ENTRIES FOR COMMISSION ${commission.id}`)
  const variables = { id: commission.id }
  const res = await client.query({
    query: getEntriesQuery,
    variables,
    fetchPolicy: 'no-cache',
  })
  const entries = res?.data?.entries
  const entriesWithContent = await Promise.all(entries.map(getEntryContent))
  setDisplayedEntries(entriesWithContent)
  const entryStrings = entriesWithContent.map(processEntry)
  entryStrings.forEach((entry) => printLine(entry))
  if (entryStrings.length === 0) printLine('empty page')
  printLine('commands: next, create-entry, previous, entry details (index#)')
}

export const fetchEntriesOfCommission = async (
  commission: Commission,
  setDisplayedEntries: Function,
  getEntriesQuery: DocumentNode
) => {
  const variables = { id: commission.id }
  const res = await client.query({
    query: getEntriesQuery,
    variables,
    fetchPolicy: 'no-cache',
  })
  const entries = res?.data?.entries
  const entriesWithContent = await Promise.all(entries.map(getEntryContent))
  setDisplayedEntries(entriesWithContent)
  return entriesWithContent
}

export const handleDisplayEntryDetails = async (
  entry: Entry,
  setSelectedEntry: Function,
  printLine: Function
) => {
  const entryWithContent = await getEntryContent(entry)
  setSelectedEntry(entryWithContent)
  const entryText = processEntry(entryWithContent, null)
  printLine(`DETAILS FOR ENTRY ${entryWithContent.id}`)
  printLine(entryText)
  printLine('commands: vote, return')
  return true
}

export const handleVoteInput = async (
  amount: string,
  entry: Entry,
  printLine: Function,
  handleVoteInput: Function
) => {
  if (!amount || isNaN(Number(amount))) {
    return false
  } else {
    handleVoteInput(amount)
    printLine(`selected vote amount: ${amount} eth`)
    printLine(`selected entry id: ${entry.id}`)
    printLine('proceed? (yes/no)')
    return true
  }
}

export const handleVote = async (
  amount: string,
  entry: Entry,
  printLine: Function,
  signer: JsonRpcSigner,
  commission: Commission,
  loading: Function
) => {
  if (!amount || isNaN(Number(amount))) {
    printLine(`invalid vote amount. please try again.`)
    return false
  }
  try {
    const options = { value: parseEther(amount).toString() }
    const commissionFactory = new Contract(commission.id, commissionInterface, signer)
    const tx = await commissionFactory.vote(entry?.author?.id, options)
    if (tx) {
      loading(true)
      printLine(`processing vote... transaction hash: ${tx.hash}`)
    }
    const receipt = await tx.wait()
    if (receipt) printLine(`vote successful. transaction hash: ${tx.hash}`)
  } catch (err) {
    if (err instanceof ErrorResponse) printLine(`transaction failed: error: ${err.message}`)
  }
  loading(false)
}

export const handleDisplayUser = async (
  account: string,
  printLine: Function,
  setSelectedUser: Function,
  setPage: Function
) => {
  try {
    const user: User = await getUser(account)
    setSelectedUser(user)
    setPage('profile')
    if (!user) return printLine(`user ${account} not found`)
    printLine(`user id ${account}`)
    printLine(`commissions created: ${user.commissionsCreated}`)
    printLine(`commissions cancelled: ${user.commissionsCancelled}`)
    printLine(`commissions won: ${user.commissionsWon}`)
    printLine(`entries made: ${user.entriesMade}`)
    printLine(`tips earned: ${user.tipsEarned}`)
    printLine(`value earned: ${user.votesEarned}`)
    printLine(`value contributed: ${user.valueContributed}`)
    printLine(`votes cast: ${user.votesCast}`)
    printLine('commands: user commissions, user entries')
  } catch (err) {
    printLine(err.message)
  }
}

export const handleCreateEntryPage = (
  account: string,
  printLine: Function,
  selectedCommission: Commission,
  setPage: Function
) => {
  if (!account) return printLine('error: metamask not connected')
  if (selectedCommission) {
    if (
      selectedCommission.submittedEntries
        .map((e: Entry) => e.author.id)
        .includes(account.toLowerCase())
    ) {
      return printLine('error: you have already entered this commission')
    }
    if (selectedCommission?.commissioner?.id === account.toLowerCase()) {
      return printLine('error: you cannot enter your own commission')
    }
    printLine('please enter the content of your entry: ')
    setPage('input-entry')
  }
}

export const handleConfirmEntry = async (
  command: string,
  selectedCommission: Commission,
  signer: JsonRpcSigner,
  account: string,
  entryPath: string,
  printLine: Function,
  loading: Function,
  refetchAndDisplayCommission: Function,
  userId: string
) => {
  if (selectedCommission && signer && account) {
    loading(true)
    const proceed = await handleCreateEntry(
      command,
      selectedCommission,
      entryPath,
      signer,
      printLine,
      userId
    )

    if (proceed)
      setTimeout(() => {
        refetchAndDisplayCommission()
        loading(false)
      }, 3000)
    else loading(false)
  } else {
    printLine(!selectedCommission ? 'no selected commission' : 'metamask not connected')
  }
}

export const handleViewEntries = async (
  selectedCommission: Commission,
  printLine: Function,
  loading: Function,
  clear: Function,
  setPage: Function,
  setEntriesPagination: Function,
  displayEntries: Function
) => {
  if (!selectedCommission) return printLine('no commission selected')
  if (Number(selectedCommission.entryCount) === 0)
    return printLine('no entries yet. be the first...')
  loading(true)
  clear()
  setPage('entries')
  setEntriesPagination(0)
  await displayEntries(selectedCommission, null)
  loading(false)
}

export const handleEntryDetails = async (
  loading: Function,
  clear: Function,
  displayedEntries: Entry[],
  printLine: Function,
  command: string,
  setPage: Function,
  displayEntryDetails: Function
) => {
  loading(true)
  clear()
  if (!displayedEntries) return printLine('error: no entries selected')
  const index = Number(command.split('entry details')[1])
  if (!index || isNaN(index) || !Object.keys(displayedEntries).includes(String(index - 1))) {
    loading(false)
    return printLine('invalid entry index')
  }
  setPage('entry-details')
  await displayEntryDetails(displayedEntries[index - 1])
  loading(false)
}

export const handleStartVote = async (
  page: string,
  printLine: Function,
  selectedEntry: Entry,
  account: string,
  setPage: Function
) => {
  if (page !== 'entry-details') return printLine("first you must navigate to an entry's details")
  if (!selectedEntry) return printLine('no entry selected')
  if (selectedEntry?.author?.id === account?.toLocaleLowerCase())
    return printLine('error: you cant vote for your own entry')

  printLine('select vote amount (in eth):')
  setPage('vote-input')
}

export const handleVoteAmount = async (
  selectedEntry: Entry,
  printLine: Function,
  command: string,
  setVoteAmount: Function,
  setPage: Function
) => {
  if (!selectedEntry) return printLine('no entry selected')
  const proceed = await handleVoteInput(command, selectedEntry, printLine, setVoteAmount)
  if (proceed) setPage('vote')
}

export const handleConfirmVote = async (
  command: string,
  selectedEntry: Entry,
  selectedCommission: Commission,
  printLine: Function,
  signer: JsonRpcSigner,
  voteAmount: string,
  loading: Function
) => {
  if (command === 'yes') {
    if (!selectedEntry || !selectedCommission)
      return printLine('error: no entry/commission selected')
    if (!signer) return printLine('error: metamask not connected')
    await handleVote(
      String(voteAmount),
      selectedEntry,
      printLine,
      signer,
      selectedCommission,
      loading
    )
  } else {
    printLine('okay. what would you like to do?')
  }
}

export const handleCommissionDetails = async (
  index: number,
  commissionsDisplayed: Commission[],
  printLine: Function,
  clear: Function,
  setPage: Function,
  setSelectedCommission: Function,
  setEntriesPagination: Function,
  displayCommissionDetails: Function
) => {
  if (!commissionsDisplayed) return printLine('no commissions selected')
  if (
    !index ||
    isNaN(Number(index)) ||
    !Object.keys(commissionsDisplayed).includes(String(index - 1))
  ) {
    return printLine('invalid index')
  }
  clear()
  setPage('details')
  setSelectedCommission(commissionsDisplayed[Number(index) - 1])
  setEntriesPagination(0)
  displayCommissionDetails(commissionsDisplayed[Number(index) - 1])
}

export const handleDisplayCommissionDetailsById = async (
  printLine: Function,
  loading: Function,
  id: string,
  setSelectedCommission: Function,
  account: string
) => {
  const commission = await fetchCommission(id)
  setSelectedCommission(commission)
  handleDisplayCommissionDetails(printLine, loading, commission, account)
}

export const handleCommissionsDirection = async (
  direction: string,
  printLine: Function,
  clear: Function,
  loading: Function,
  setOrderCommissionsDirection: Function,
  makeCommissionQuery: Function,
  orderCommissionsBy: string,
  setCommissionPagination: Function,
  displayCommissions: Function,
  selectedUser?: User
) => {
  if (!directions.includes(direction)) {
    return printLine('invalid direction. valid directions: asc, desc')
  }
  clear()
  loading(true)
  setOrderCommissionsDirection(direction)
  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    direction,
    0,
    commissionsPerPage,
    selectedUser
  )
  setCommissionPagination(0)
  displayCommissions(getCommissionsQuery, 0, selectedUser)
  loading(false)
}

export const handleSortCommissions = async (
  command: string,
  printLine: Function,
  clear: Function,
  loading: Function,
  setOrderCommissionsBy: Function,
  makeCommissionQuery: Function,
  orderCommissionsDirection: string,
  setCommissionPagination: Function,
  displayCommissions: Function,
  selectedUser?: User
) => {
  const field = command.split('sort ')[1]?.trim()
  if (!commissionOrderFields.includes(field)) {
    return printLine(`invalid sort field. valid sort fields: ${commissionOrderFields.join(', ')}`)
  }
  clear()
  loading(true)
  setOrderCommissionsBy(field)
  const getCommissionsQuery = makeCommissionQuery(
    field,
    orderCommissionsDirection,
    0,
    commissionsPerPage,
    selectedUser
  )
  setCommissionPagination(0)
  displayCommissions(getCommissionsQuery, 0, selectedUser)
  loading(false)
}

export const handleCommissionsNext = async (
  clear: Function,
  loading: Function,
  makeCommissionQuery: Function,
  orderCommissionsBy: string,
  orderCommissionsDirection: string,
  commissionPagination: number,
  setCommissionPagination: Function,
  displayCommissions: Function,
  selectedUser?: User
) => {
  clear()
  loading(true)
  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    orderCommissionsDirection,
    commissionPagination + 1,
    commissionsPerPage,
    selectedUser
  )
  setCommissionPagination((p: number) => p + 1)
  displayCommissions(getCommissionsQuery, commissionPagination + 1, selectedUser)
  loading(false)
}

export const handleCommissionsBack = async (
  commissionPagination: number,
  printLine: Function,
  clear: Function,
  loading: Function,
  makeCommissionQuery: Function,
  orderCommissionsBy: string,
  orderCommissionsDirection: string,
  setCommissionPagination: Function,
  displayCommissions: Function,
  selectedUser: User
) => {
  if (commissionPagination === 0) return printLine('already at page one')
  clear()
  loading(true)
  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    orderCommissionsDirection,
    commissionPagination - 1,
    commissionsPerPage,
    selectedUser
  )
  setCommissionPagination((p) => p - 1)
  displayCommissions(getCommissionsQuery, commissionPagination - 1, selectedUser)
  loading(false)
}

export const handleCommissionsPageSelect = async (
  pageNumber: number,
  printLine: Function,
  clear: Function,
  loading: Function,
  makeCommissionQuery: Function,
  orderCommissionsBy: string,
  orderCommissionsDirection: string,
  setCommissionPagination: Function,
  displayCommissions: Function,
  selectedUser?: User
) => {
  if (pageNumber < 0 || isNaN(pageNumber)) return printLine('invalid page number')
  clear()
  loading(true)
  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    orderCommissionsDirection,
    pageNumber,
    commissionsPerPage,
    selectedUser
  )
  setCommissionPagination(pageNumber)
  displayCommissions(getCommissionsQuery, pageNumber, selectedUser)
  loading(false)
}

export const handleEntriesSort = async (
  field: string,
  selectedCommission: Commission,
  printLine: Function,
  setEntriesPagination: Function,
  setSortEntriesBy: Function,
  makeEntriesQuery: Function,
  sortEntriesDirection: string,
  displayEntries: Function
) => {
  if (!selectedCommission) return printLine('no commission selected')
  if (!entrySortFields.includes(field))
    return printLine(`invalid field "${field}". valid entry fields: ${entrySortFields.join(', ')}`)
  setEntriesPagination(0)
  setSortEntriesBy(field)
  const query = makeEntriesQuery(field, sortEntriesDirection, 0, entriesPerPage)
  displayEntries(selectedCommission, query)
}

export const handleEntriesPageSelect = async (
  pageNumber: number,
  selectedCommission: Commission,
  printLine: Function,
  clear: Function,
  loading: Function,
  makeEntriesQuery: Function,
  sortEntriesBy: string,
  sortEntriesDirection: string,
  setEntriesPagination: Function,
  displayEntries: Function
) => {
  if (!selectedCommission) return printLine('no selected commission')
  if (pageNumber < 0 || isNaN(pageNumber)) return printLine('invalid page number')
  clear()
  loading(true)
  const query = makeEntriesQuery(sortEntriesBy, sortEntriesDirection, pageNumber, entriesPerPage)
  setEntriesPagination(pageNumber)
  displayEntries(selectedCommission, query)
  loading(false)
}

export const handleCancelCommission = async (
  account: string,
  selectedCommission: Commission,
  signer: JsonRpcSigner,
  printLine: Function,
  loading: Function
) => {
  if (account.toLowerCase() !== selectedCommission.commissioner.id)
    return printLine('only the commissioner may cancel this')
  if (selectedCommission.entryCount > 0)
    return printLine('cannot cancel commission once entries have been made')
  const commissionContract = new Contract(selectedCommission.id, commissionInterface, signer)
  loading(true)
  printLine('complete transaction in metamask')
  try {
    const tx = await commissionContract.cancel()
    printLine(`processing transaction ${tx.hash}...`)
    await tx.wait()
    printLine('transaction succesful')
    printLine(`commission ${selectedCommission.id} cancelled`)
  } catch (err) {
    if (err.code === 4001) printLine('user rejected transaction in metamask')
    else printLine(`transaction error: ${err.message}`)
  }
  loading(false)
}

export const handleChooseWinner = async (
  selectedCommission: Commission,
  account: string,
  printLine: Function,
  signer: JsonRpcSigner,
  loading: Function
) => {
  const now = Date.now() / 1000
  const secondsPassed = now - Number(selectedCommission.timestamp)
  if (account !== selectedCommission.commissioner.id) {
    if (secondsPassed < 2 * 24 * 60 * 60) {
      return printLine('only the commissioner may select winner')
    }
  }
  if (secondsPassed < Number(selectedCommission.minTime))
    return printLine('minimum time has not passed')
  if (selectedCommission.entryCount < 1) return printLine('no entries yet')
  const commissionContract = new Contract(selectedCommission.id, commissionInterface, signer)
  loading(true)
  const tx = await commissionContract.chooseWinner()
  printLine(`processing transaction... transaction hash: ${tx.hash}`)
  try {
    await tx.wait()
    printLine(`transaction ${tx.hash} successful`)
    printLine(`commission ${selectedCommission.id} complete`)
    printLine(`thank you for your commission, user ${account}`)
  } catch (err) {
    printLine('transaction error')
  }
  loading(true)
}

export const handleEntriesBackPage = (
  entriesPagination: number,
  printLine: Function,
  selectedCommission: Commission,
  clear: Function,
  loading: Function,
  makeEntriesQuery: Function,
  sortEntriesBy: string,
  sortEntriesDirection: string,
  setEntriesPagination: Function,
  displayEntries: Function
) => {
  if (entriesPagination === 0) return printLine('already at page one')
  if (!selectedCommission) return printLine('no selected commission')
  clear()
  loading(true)
  const query = makeEntriesQuery(
    sortEntriesBy,
    sortEntriesDirection,
    entriesPagination - 1,
    entriesPerPage
  )
  setEntriesPagination((p) => p - 1)
  displayEntries(selectedCommission, query)
  loading(false)
}

export const handleEntriesNextPage = (
  selectedCommission: Commission,
  printLine: Function,
  clear: Function,
  loading: Function,
  makeEntriesQuery: Function,
  sortEntriesBy: string,
  sortEntriesDirection: string,
  entriesPagination: number,
  setEntriesPagination: Function,
  displayEntries: Function
) => {
  if (!selectedCommission) return printLine('no selected commission')
  clear()
  loading(true)
  const query = makeEntriesQuery(
    sortEntriesBy,
    sortEntriesDirection,
    entriesPagination + 1,
    entriesPerPage
  )
  setEntriesPagination((p) => p + 1)
  displayEntries(selectedCommission, query)
  loading(false)
}

export const handleEntriesDirection = (
  direction: string,
  selectedCommission: Commission,
  printLine: Function,
  setSortEntriesDirection: Function,
  setEntriesPagination: Function,
  makeEntriesQuery: Function,
  sortEntriesBy: string,
  displayEntries: Function
) => {
  if (!selectedCommission) return printLine('no commission selected')
  if (!directions.includes(direction)) {
    return printLine('invalid direction. valid directions: asc, desc')
  }
  setSortEntriesDirection(direction)
  setEntriesPagination(0)
  const query = makeEntriesQuery(sortEntriesBy, direction, 0, entriesPerPage)
  displayEntries(selectedCommission, query)
}
