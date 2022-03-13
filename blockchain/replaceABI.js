const fs = require('fs')
const factoryPath = './build/contracts/Factory.json'
const factoryBuf = fs.readFileSync(factoryPath)
const factoryJSON = JSON.parse(factoryBuf)
const factoryAbi = factoryJSON.abi
const factoryString = JSON.stringify(factoryAbi)
fs.mkdir('../utils/ethers/ABIs/', { recursive: true }, (err) => {
  if (err) throw err
})
fs.writeFileSync('../utils/ethers/ABIs/factoryABI.json', factoryString, { recursive: true })
console.log('New factory contract ABI successfully written to utils directory.')

const commissionPath = './build/contracts/Commission.json'
const commissionBuf = fs.readFileSync(commissionPath)
const commissionJSON = JSON.parse(commissionBuf)
const commissionAbi = commissionJSON.abi
const commissionString = JSON.stringify(commissionAbi)
fs.writeFileSync('../utils/ethers/ABIs/commissionABI.json', commissionString, {
  recursive: true,
})
console.log('New commission contract ABI successfully written to utils directory.')
