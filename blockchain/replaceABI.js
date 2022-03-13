const fs = require('fs')
const path = './build/contracts/Factory.json'
const factoryBuf = fs.readFileSync(path)
const factoryJSON = JSON.parse(factoryBuf)
const abi = factoryJSON.abi
const abiString = JSON.stringify(abi)
fs.mkdir('../subgraph/abis', { recursive: true }, (err) => {
  if (err) throw err
})
fs.writeFileSync('../subgraph/abis/Factory.json', abiString, { recursive: true })
console.log('New factory contract build ABI successfully written to subgraph directory.')
