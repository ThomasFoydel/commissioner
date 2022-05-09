import { useEthers } from '@usedapp/core'
import getConfig from '../config'

export default function () {
  const { chainId } = useEthers()
  return getConfig(chainId)
}
