import { toast } from 'react-toastify'
import React, { useEffect } from 'react'
import { useEthers } from '@usedapp/core'

const NetworkErrorDisplay = () => {
  const { chainId } = useEthers()

  useEffect(() => {
    if (chainId && chainId !== 5)
      toast.error(`chain ${chainId} not supported. connect to goerli chain.`)
  }, [chainId])

  return <></>
}

export default NetworkErrorDisplay
