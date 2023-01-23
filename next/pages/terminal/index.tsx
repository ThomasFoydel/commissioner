import { Contract } from 'ethers'
import { DocumentNode } from 'graphql'
import { useEthers } from '@usedapp/core'
import { Interface } from 'ethers/lib/utils'
import { useEventQueue } from 'crt-terminal'
import React, { useState, useEffect } from 'react'
import { fetchCommission, line, makeCommissionQuery, makeEntriesQuery } from '../../utils/terminal'
import { commissionsPerPage, entriesPerPage } from '../../utils/constants'
import factoryABI from '../../utils/ethers/ABIs/factoryABI.json'
import useGetConfig from '../../utils/customHooks/useGetConfig'
import Display from '../../components/TerminalDisplay'
import {
  handleDisplayCommissionDetails,
  handleDisplayCommissions,
  fetchEntry,
  handleCreateCommission,
  handleEntryIpfs,
  handleIPFSInput,
  handleMinTimeInput,
  handleRewardInput,
  handleDisplayEntries,
  handleDisplayEntryDetails,
  handleDisplayUser,
  handleCreateEntryPage,
  handleConfirmEntry,
  handleViewEntries,
  handleEntryDetails,
  handleStartVote,
  handleVoteAmount,
  handleConfirmVote,
  handleCommissionDetails,
  handleCommissionsDirection,
  handleSortCommissions,
  handleCommissionsNext,
  handleCommissionsBack,
  handleCommissionsPageSelect,
  handleEntriesSort,
  handleEntriesPageSelect,
  handleCancelCommission,
  handleChooseWinner,
  handleEntriesBackPage,
  handleEntriesNextPage,
  handleEntriesDirection,
  handleDisplayCommissionDetailsById,
  handleAddReward,
  handleTipWinner,
  handleTipCommissioner,
} from '../../utils/terminal/commands'

const bannerText = `\nCOMMISSIONER\ncommissions create help man about profile`

const commands = {
  home: 'commissions, create, help, man, about, profile',
  commissions: 'next, back, sort (field), direction (asc/desc), details (index#), page (page#)',
  details: 'view entries, create entry, view commissioner, return',
  entries: 'next, previous, entry details (index#)',
  profile: 'user commissions, user entries',
}

const Terminal = () => {
  const eventQueue = useEventQueue()
  const [page, setPage] = useState('home')
  const [commissionPagination, setCommissionPagination] = useState(0)
  const [commissionsDisplayed, setCommissionsDisplayed] = useState<[Commission]>()
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>()
  const [selectedCommission, setSelectedCommission] = useState<Commission>()
  const [selectedEntry, setSelectedEntry] = useState<Entry>()
  const [voteAmount, setVoteAmount] = useState<string>()
  const [promptPath, setPromptPath] = useState('')
  const [entryPath, setEntryPath] = useState('')
  const [reward, setReward] = useState('0')
  const [minTime, setMinTime] = useState('0')
  const [entriesPagination, setEntriesPagination] = useState(0)
  const [transactionHash, setTransactionHash] = useState('')
  const [orderCommissionsBy, setOrderCommissionsBy] = useState('created')
  const [orderCommissionsDirection, setOrderCommissionsDirection] = useState('desc')
  const [sortEntriesBy, setSortEntriesBy] = useState('none')
  const [sortEntriesDirection, setSortEntriesDirection] = useState('asc')
  const { print, clear, loading, lock, focus } = eventQueue.handlers
  const [selectedUser, setSelectedUser] = useState<User | null>()

  const printLine = (content: string) => print([line(content)])

  useEffect(() => {
    document.getElementById('crt-command-line-input').setAttribute('autocomplete', 'off')
  }, [])

  const config = useGetConfig()
  const { account, library } = useEthers()
  const signer = library && account ? library.getSigner(String(account)) : null
  const factoryInterface = new Interface(factoryABI)
  const factoryContract = signer
    ? new Contract(config.factoryAddress, factoryInterface, signer)
    : null

  const getEntriesQuery = makeEntriesQuery(
    sortEntriesBy,
    sortEntriesDirection,
    entriesPagination,
    entriesPerPage,
    selectedUser
  )

  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    orderCommissionsDirection,
    commissionPagination,
    commissionsPerPage,
    selectedUser
  )

  const stateVals = {
    sortEntriesDirection,
    sortEntriesBy,
    entriesPagination,
    account,
    // orderCommissionsBy,
    // orderCommissionsDirection,
    // commissionPagination,
    selectedUser,
    page,
    selectedCommission,
    selectedEntry: selectedEntry?.id,
  }
  const printState = () => {
    for (const [key, value] of Object.entries(stateVals))
      printLine(`${key}: ${typeof value === 'object' ? value.id : value}`)
  }

  const homePage = () => {
    clear()
    printLine(bannerText)
    setPage('home')
  }
  const returnToPreviousPage = () => {
    clear()
    if (page === 'details') {
      if (selectedUser) {
        displayUserCommissions(selectedUser)
        setPage('user-commissions')
      } else {
        displayCommissions(null, commissionPagination)
        setPage('commissions')
      }
      return
    }
    if (page === 'entries') {
      setPage('details')
      if (selectedCommission) displayCommissionDetails(selectedCommission)
      return setEntriesPagination(0)
    }
    if (page === 'entry-details') {
      if (selectedCommission) displayEntries(selectedCommission, null)
      return setPage('entries')
    }
    if (page === 'user-entries') {
      setPage('profile')
      return displayUserProfile()
    }
    if (page === 'vote') {
      if (selectedEntry) refetchAndDisplayEntryDetails(false)
      return setPage('entry-details')
    }
    if (page === 'confirm-entry') {
      return createEntryPage()
    }
    return homePage()
  }
  const commissionsPage = () => {
    clear()
    setPage('commissions')
    setSelectedUser(null)
    displayCommissions(null, commissionPagination)
  }

  const displayCommissions = (query: DocumentNode | null, page: number, user?: User) => {
    const q = makeCommissionQuery(
      orderCommissionsBy,
      orderCommissionsDirection,
      commissionPagination,
      commissionsPerPage,
      user
    )
    handleDisplayCommissions(printLine, loading, setCommissionsDisplayed, query || q, page, user)
  }

  const displayUserCommissions = (user: User) => {
    setPage('user-commissions')
    displayCommissions(getCommissionsQuery, commissionPagination, user)
  }

  const displayCommissionDetails = (com: Commission) =>
    handleDisplayCommissionDetails(printLine, loading, com, account)

  const displayEntryDetails = (entry: Entry) =>
    handleDisplayEntryDetails(entry, setSelectedEntry, printLine)

  const refetchAndDisplayEntryDetails = async (pollForVoteChange = true) => {
    if (!selectedCommission) return printLine('error: no selected commission')
    if (!selectedEntry) return printLine('error: no selected entry')
    setPage('entry-details')
    printLine('fetching updated entry data...')
    const updateAndDisplayState = (newEntry: Entry) => {
      const updatedEntries: Entry[] = displayedEntries.map((entry) =>
        entry.id === newEntry.id ? newEntry : entry
      )
      setDisplayedEntries(updatedEntries)
      setSelectedEntry(newEntry)
      clear()
      handleDisplayEntryDetails(newEntry, setSelectedEntry, printLine)
    }

    let updatedEntry = await fetchEntry(selectedEntry.id)
    let attempts = 0
    const pollForIt = async () => {
      attempts++
      if (attempts > 100) return printLine('error fetching updated data')
      updatedEntry = await fetchEntry(selectedEntry.id)
      if (updatedEntry.voteAmount === selectedEntry.voteAmount) {
        setTimeout(pollForIt, 1000)
      } else {
        updateAndDisplayState(updatedEntry)
      }
    }

    if (pollForVoteChange) pollForIt()
    else updateAndDisplayState(updatedEntry)
  }

  const refetchAndDisplayCommission = async () => {
    if (!selectedCommission) return printLine('error: no selected commission')
    const commission = await fetchCommission(selectedCommission.id)
    setSelectedCommission(commission)
    setCommissionsDisplayed((coms: any) => {
      const index = coms.findIndex((com: any) => com.id === selectedCommission.id)
      const edited = coms.splice(index, commission)
      return edited
    })
    clear()
    displayCommissionDetails(commission)
    setPage('details')
  }
  const displayEntries = (com: Commission, query: DocumentNode | null) =>
    handleDisplayEntries(
      printLine,
      setDisplayedEntries,
      query || getEntriesQuery,
      com,
      selectedUser
    )

  const createEntryPage = () =>
    handleCreateEntryPage(account, printLine, selectedCommission, setPage)

  const confirmEntry = (command: string) =>
    handleConfirmEntry(
      command,
      selectedCommission,
      signer,
      account,
      entryPath,
      printLine,
      loading,
      refetchAndDisplayCommission,
      account
    )

  const viewEntries = () =>
    handleViewEntries(
      selectedCommission,
      printLine,
      loading,
      clear,
      setPage,
      setEntriesPagination,
      displayEntries,
      selectedUser
    )

  const entryDetails = (command: string) =>
    handleEntryDetails(
      loading,
      clear,
      displayedEntries,
      printLine,
      command,
      setPage,
      displayEntryDetails
    )
  const startVote = () => handleStartVote(page, printLine, selectedEntry, account, setPage)

  const voteAmountInput = async (command: string) =>
    handleVoteAmount(selectedEntry, printLine, command, setVoteAmount, setPage)

  const confirmVoteInput = (command: string) =>
    handleConfirmVote(
      command,
      selectedEntry,
      selectedCommission,
      printLine,
      signer,
      voteAmount,
      loading,
      refetchAndDisplayEntryDetails
    )
  const handleReward = async (command: string) => {
    const proceed = await handleRewardInput(command, setReward, printLine, loading)
    if (proceed) setPage('input-mintime')
  }

  const handleMinTime = async (command: string) => {
    const proceed = await handleMinTimeInput(command, setMinTime, printLine)
    if (proceed) setPage('create-commission')
  }

  const commissionDetails = (index: number) =>
    handleCommissionDetails(
      index,
      commissionsDisplayed,
      printLine,
      clear,
      setPage,
      setSelectedCommission,
      setEntriesPagination,
      displayCommissionDetails
    )

  const displayCommissionDetailsById = (id: string) =>
    handleDisplayCommissionDetailsById(printLine, loading, id, setSelectedCommission, account)

  const handleCommissionInput = async (command: string) => {
    if (!library || !account) return printLine('metamask not connected')
    const comId = await handleCreateCommission(
      command,
      reward,
      minTime,
      promptPath,
      setPage,
      loading,
      factoryContract,
      printLine,
      setTransactionHash
    )
    if (comId) {
      clear()
      setPage('details')
      try {
        displayCommissionDetailsById(comId.toLowerCase())
      } catch (err) {
        printLine(err.message)
      }
    }
  }

  const commissionsDirection = (direction: string) =>
    handleCommissionsDirection(
      direction,
      printLine,
      clear,
      loading,
      setOrderCommissionsDirection,
      makeCommissionQuery,
      orderCommissionsBy,
      setCommissionPagination,
      displayCommissions,
      selectedUser
    )

  const sortCommissions = (command: string) =>
    handleSortCommissions(
      command,
      printLine,
      clear,
      loading,
      setOrderCommissionsBy,
      makeCommissionQuery,
      orderCommissionsDirection,
      setCommissionPagination,
      displayCommissions,
      selectedUser
    )

  const commissionsNext = () => {
    handleCommissionsNext(
      clear,
      loading,
      makeCommissionQuery,
      orderCommissionsBy,
      orderCommissionsDirection,
      commissionPagination,
      setCommissionPagination,
      displayCommissions,
      selectedUser
    )
  }

  const commissionsBack = () => {
    handleCommissionsBack(
      commissionPagination,
      printLine,
      clear,
      loading,
      makeCommissionQuery,
      orderCommissionsBy,
      orderCommissionsDirection,
      setCommissionPagination,
      displayCommissions,
      selectedUser
    )
  }

  const commissionsPageSelect = (pageNumber: number) =>
    handleCommissionsPageSelect(
      pageNumber,
      printLine,
      clear,
      loading,
      makeCommissionQuery,
      orderCommissionsBy,
      orderCommissionsDirection,
      setCommissionPagination,
      displayCommissions,
      selectedUser
    )

  const entriesSort = (field: string) =>
    handleEntriesSort(
      field,
      selectedCommission,
      printLine,
      setEntriesPagination,
      setSortEntriesBy,
      makeEntriesQuery,
      sortEntriesDirection,
      displayEntries,
      selectedUser
    )

  const entriesDirection = (direction: string) =>
    handleEntriesDirection(
      direction,
      selectedCommission,
      printLine,
      setSortEntriesDirection,
      setEntriesPagination,
      makeEntriesQuery,
      sortEntriesBy,
      displayEntries,
      selectedUser
    )

  const entriesNextPage = () =>
    handleEntriesNextPage(
      selectedCommission,
      printLine,
      clear,
      loading,
      makeEntriesQuery,
      sortEntriesBy,
      sortEntriesDirection,
      entriesPagination,
      setEntriesPagination,
      displayEntries,
      selectedUser
    )

  const entriesBackPage = () =>
    handleEntriesBackPage(
      entriesPagination,
      printLine,
      selectedCommission,
      clear,
      loading,
      makeEntriesQuery,
      sortEntriesBy,
      sortEntriesDirection,
      setEntriesPagination,
      displayEntries,
      selectedUser
    )

  const entriesPageSelect = (pageNumber: number) =>
    handleEntriesPageSelect(
      pageNumber,
      selectedCommission,
      printLine,
      clear,
      loading,
      makeEntriesQuery,
      sortEntriesBy,
      sortEntriesDirection,
      setEntriesPagination,
      displayEntries,
      selectedUser
    )

  const cancelCommission = async () =>
    handleCancelCommission(account, selectedCommission, signer, printLine, loading)

  const chooseWinner = () =>
    handleChooseWinner(selectedCommission, account, printLine, signer, loading)

  const displayUserProfile = async (user?: string) =>
    handleDisplayUser(user || account, printLine, setSelectedUser, setPage)

  const addReward = (input: string) =>
    handleAddReward(
      selectedCommission,
      input,
      printLine,
      setPage,
      signer,
      refetchAndDisplayCommission
    )

  const tipWinner = (input: string) =>
    handleTipWinner(
      selectedCommission,
      input,
      printLine,
      setPage,
      signer,
      refetchAndDisplayCommission
    )

  const tipCommissioner = (input: string) =>
    handleTipCommissioner(
      selectedCommission,
      input,
      printLine,
      setPage,
      signer,
      refetchAndDisplayCommission
    )

  const viewEntryAuthor = () =>
    handleDisplayUser(selectedEntry.author.id, printLine, setSelectedUser, setPage)

  return (
    <Display
      props={{
        eventQueue,
        homePage,
        printLine,
        returnToPreviousPage,
        page,
        printState,
        stateVals,
        clear,
        commissionsPage,
        commissionDetails,
        setPage,
        setPromptPath,
        loading,
        handleReward,
        handleMinTime,
        handleCommissionInput,
        createEntryPage,
        setEntryPath,
        confirmEntry,
        viewEntries,
        entryDetails,
        startVote,
        voteAmountInput,
        confirmVoteInput,
        sortCommissions,
        commissionsDirection,
        commissionsNext,
        commissionsBack,
        commissionsPageSelect,
        cancelCommission,
        chooseWinner,
        entriesSort,
        entriesDirection,
        entriesNextPage,
        entriesBackPage,
        entriesPageSelect,
        displayUserProfile,
        bannerText,
        commands,
        handleIPFSInput,
        handleEntryIpfs,
        displayCommissionDetailsById,
        displayUserCommissions,
        addReward,
        tipWinner,
        tipCommissioner,
        viewEntryAuthor,
      }}
    />
  )
}

export default Terminal
