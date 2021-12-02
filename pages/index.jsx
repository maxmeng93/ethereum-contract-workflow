import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Web3 from 'web3';
import Layout from './components/Layout';
import List from './List';

const Home = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(async () => {
    const web3 = new Web3(window.web3.currentProvider);

    const accounts = await web3.eth.getAccounts();

    if (accounts.length === 0) {
      console.log('请先连接钱包');
      return;
    }

    let balances = await Promise.all(accounts.map(x => web3.eth.getBalance(x)));

    balances = balances.map(wei => {
      wei = web3.utils.toBN(wei);
      return web3.utils.fromWei(wei, 'ether');
    });

    console.log({ accounts, balances });

    setAccounts(accounts);
  }, []);

  return (
    <>
      <Head>
        <title>众筹 DApp</title>
      </Head>
      <Layout accounts={accounts}>
        <List></List>
      </Layout>
    </>
  )
};

export default Home;
