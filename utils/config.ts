const factoryAddress = '0xf7869Ae40d6ABC0844c626BE38B8B884F81621f7'

export const config = { factoryAddress }

const chains = {
  1: {
    factoryAddress: '0xf7869Ae40d6ABC0844c626BE38B8B884F81621f7', // goerli address, need to replace
  },
  5: {
    factoryAddress: '0xf7869Ae40d6ABC0844c626BE38B8B884F81621f7',
  },
}
const getConfig = (chainId: number) => {
  const id = chainId || 1
  const chainConfig = chains[id as keyof typeof chains]
  return chainConfig || chains[0]
}

export default getConfig
