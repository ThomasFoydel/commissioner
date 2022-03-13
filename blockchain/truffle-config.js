module.exports = {
  mocha: {
    reporter: 'eth-gas-reporter',
  },
  compilers: {
    solc: {
      version: '0.8.4',
    },
  },
  db: {
    enabled: false,
  },
}
