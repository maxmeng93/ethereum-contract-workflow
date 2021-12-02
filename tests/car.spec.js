const path = require('path');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

// 1. 拿到 bytecode
const contractPath = path.resolve(__dirname, '../compiled/Car.json');
const { abi, evm } = require(contractPath);

// 2. 配置 provider
const web3 = new Web3(ganache.provider());

let accounts;
let contract;
const initialBrand = 'AUDI';

describe('contract', () => {
  // 3. 每次跑单元测试都需要部署全新的合约实例，起到隔离作用
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    console.log('合约部署账户：', accounts[0]);

    contract = await new web3.eth.Contract(abi)
      .deploy({ data: evm.bytecode.object, arguments: [initialBrand] })
      .send({ from: accounts[0], gas: 1000000 });
  });

  // 4. 编写单元测试
  it('deploy a contract', () => {
    assert.ok(contract.options.address);
  });

  it('has initial brand', async () => {
    const brand = await contract.methods.brand().call();
    assert.equal(brand, initialBrand);
  });

  it('can change the brand', async () => {
    const newBrand = 'BMW';
    await contract.methods.setBrand(newBrand).send({ from: accounts[0] });
    const brand = await contract.methods.brand().call();
    assert.equal(brand, newBrand);
  });
});