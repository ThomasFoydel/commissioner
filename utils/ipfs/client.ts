import axios from 'axios'

export const uploadTextToIpfs = async (text: string) => {
  const res = await axios.post('/api/ipfs', { text })
  return res?.data?.path
}

export const readTextFromIpfs = async (path: string) => {
  const res = await axios(`http://ipfs.io/ipfs/${path}`)
  return res?.data
}
