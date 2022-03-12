const Migrations = artifacts.require("Migrations")
const factory = artifacts.require("../contracts/Factory.sol")
const SafeMath = artifacts.require("../contracts/SafeMath.sol")

module.exports = function (deployer) {
  deployer.deploy(SafeMath)
  deployer.link(SafeMath, factory)
  deployer.deploy(factory)
  deployer.deploy(Migrations)
}
