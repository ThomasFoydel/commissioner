import React, { useState, useEffect } from 'react'
import { useEventQueue } from 'crt-terminal'
import { fetchCommission, line, makeCommissionQuery, makeEntriesQuery } from './utils'
import { Interface } from 'ethers/lib/utils'
import { useEthers } from '@usedapp/core'
import { Contract } from 'ethers'
import { DocumentNode } from 'graphql'
import factoryABI from '../../utils/ethers/ABIs/factoryABI.json'
import useGetConfig from '../../utils/customHooks/useGetConfig'
import { commissionsPerPage, entriesPerPage } from '../../utils/constants'
import Display from './Display'
import {
  handleDisplayCommissionDetails,
  handleDisplayCommissions,
  fetchEntriesOfCommission,
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
} from './commands'

const bannerText = `
COMMISSIONER
commissions create help man about profile
`

const commands = {
  home: 'commissions, create, help, man, about, profile',
  commissions: 'next, back, sort (field), details (index#), go (page)',
  details: 'view entries, create-entry, view commissioner, return',
  entries: 'next, previous, entry details (index#)',
  profile: 'user commissions, user entries',
}

const Terminal = () => {
  const eventQueue = useEventQueue()
  const [page, setPage] = useState('home')
  const [commissionPagination, setCommissionPagination] = useState(0)
  const [commissionsDisplayed, setCommissionsDisplayed] = useState<[Commission]>()
  const [displayedEntries, setDisplayedEntries] = useState<[Entry]>()
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
  const [selectedUser, setSelectedUser] = useState<User>()

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
    entriesPerPage
  )

  const getCommissionsQuery = makeCommissionQuery(
    orderCommissionsBy,
    orderCommissionsDirection,
    commissionPagination,
    commissionsPerPage
  )

  // const changePage = (page: string) => {
  //   printLine(`moved to ${page}. commands: ${commands[page as keyof typeof commands]}`)
  //   setPage(page)
  // }

  const stateVals = {
    sortEntriesDirection,
    sortEntriesBy,
    entriesPagination,
    account,
    // orderCommissionsBy,
    // orderCommissionsDirection,
    // commissionPagination,
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
      displayCommissions(null, commissionPagination)
      return setPage('commissions')
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
    if (page === 'vote') {
      if (selectedEntry) refetchAndDisplayEntryDetails()
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
    displayCommissions(null, commissionPagination)
  }

  const displayCommissions = (query: DocumentNode | null, page: number) =>
    handleDisplayCommissions(
      printLine,
      loading,
      setCommissionsDisplayed,
      query || getCommissionsQuery,
      page
    )

  const displayCommissionDetails = (com: Commission) =>
    handleDisplayCommissionDetails(printLine, loading, com, account)
  const displayEntryDetails = (entry: Entry) =>
    handleDisplayEntryDetails(entry, setSelectedEntry, printLine)
  const refetchAndDisplayEntryDetails = async () => {
    if (!selectedCommission) return printLine('error: no selected commission')
    if (!selectedEntry) return printLine('error: no selected entry')
    const entries = await fetchEntriesOfCommission(
      selectedCommission,
      setDisplayedEntries,
      getEntriesQuery
    )
    const newSelectedEntry = entries.filter((e) => e.id === selectedEntry.id)[0]
    setSelectedEntry(newSelectedEntry)
    handleDisplayEntryDetails(newSelectedEntry, setSelectedEntry, printLine)
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
    handleDisplayEntries(com, printLine, setDisplayedEntries, query || getEntriesQuery)

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
      displayEntries
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
      loading
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

  const handleCommissionInput = (command: string) => {
    if (!library || !account) return printLine('metamask not connected')
    handleCreateCommission(
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
      displayCommissions
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
      displayCommissions
    )

  const commissionsNext = () =>
    handleCommissionsNext(
      clear,
      loading,
      makeCommissionQuery,
      orderCommissionsBy,
      orderCommissionsDirection,
      commissionPagination,
      setCommissionPagination,
      displayCommissions
    )

  const commissionsBack = () =>
    handleCommissionsBack(
      commissionPagination,
      printLine,
      clear,
      loading,
      makeCommissionQuery,
      orderCommissionsBy,
      orderCommissionsDirection,
      setCommissionPagination,
      displayCommissions
    )

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
      displayCommissions
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
      displayEntries
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
      displayEntries
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
      displayEntries
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
      displayEntries
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
      displayEntries
    )

  const cancelCommission = async () =>
    handleCancelCommission(account, selectedCommission, signer, printLine, loading)

  const chooseWinner = () =>
    handleChooseWinner(selectedCommission, account, printLine, signer, loading)

  const displayUserProfile = async (user?: string) =>
    handleDisplayUser(user || account, printLine, setSelectedUser, setPage)

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
      }}
    />
  )
}

export default Terminal
