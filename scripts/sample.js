// import HDWalletProvider from "@truffle/hdwallet-provider";
// import Web3 from "web3";
// import address from "../address.json";
// import ProjectList from "../compiled/ProjectList.json";
// import { memonic, rinkebyUrl } from "./config";
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const address = require('../address.json');
const ProjectList = require('../compiled/ProjectList.json');
const { memonic, rinkebyUrl } = require('../config');

const web3 = new Web3(new HDWalletProvider(memonic, rinkebyUrl));
const contract = new web3.eth.Contract(ProjectList.abi, address);

(async () => {
  const accounts = await web3.eth.getAccounts();

  const projects = [
    {
      description: "Ethereum DApp Tutorial",
      minInvest: web3.utils.toWei("0.01", "ether"),
      maxInvest: web3.utils.toWei("0.1", "ether"),
      goal: web3.utils.toWei("1", "ether"),
    },
    {
      description: "Ethereum Video Tutorial",
      minInvest: web3.utils.toWei("0.1", "ether"),
      maxInvest: web3.utils.toWei("1", "ether"),
      goal: web3.utils.toWei("5", "ether"),
    },
  ];

  const owner = accounts[0];
  const results = await Promise.all(
    projects.map((x) =>
      contract.methods
        .createProject(x.description, x.minInvest, x.maxInvest, x.goal)
        .send({ from: owner, gas: "5000000" })
    )
  );

  console.log(results);

  process.exit();
})();
