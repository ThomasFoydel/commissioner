import { toast } from 'react-toastify'
import React, { useEffect } from 'react'
import { useEthers } from '@usedapp/core'

const NetworkErrorDisplay = () => {
  const { chainId, active, activateBrowserWallet } = useEthers()

  useEffect(() => {
    if (!active) {
      toast.error('metamask not connected')
      activateBrowserWallet()
    }
    if (chainId && chainId !== 5) toast.error('connect to goerli chain')
  }, [chainId, active, activateBrowserWallet])

  return <></>
}

export default NetworkErrorDisplay
