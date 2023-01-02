import { create as ipfsHttpClient } from 'ipfs-http-client'

const id = process.env.IPFS_PROJECT_ID
const secret = process.env.IPFS_PROJECT_SECRET
const auth = 'Basic ' + Buffer.from(id + ':' + secret).toString('base64')

const ipfs = ipfsHttpClient({
  url: 'https://ipfs.infura.io:5001/api/v0',
  headers: {
    authorization: auth,
  },
})

export default ipfs
