const factoryAddress = '0x04cAd3baf5A3bdc3E2df6D1fe1A1380D3B80032b'

export const config = { factoryAddress }

const chains = {
  1: {
    factoryAddress: '0x04cAd3baf5A3bdc3E2df6D1fe1A1380D3B80032b', // ropsten address, need to replace
  },
  3: {
    factoryAddress: '0x04cAd3baf5A3bdc3E2df6D1fe1A1380D3B80032b',
  },
}
const getConfig = (chainId: number) => {
  const id = chainId || 1
  const chainConfig = chains[id as keyof typeof chains]
  return chainConfig
}

export default getConfig
