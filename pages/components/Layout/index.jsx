import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Web3 from "web3";
import { Layout, Menu, Button } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./style.module.scss";

const { Header, Sider, Content } = Layout;

export default (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const [accounts, setAccounts] = useState([]);

  useEffect(async () => {
    const web3 = new Web3(window.web3.currentProvider);

    const accounts = await web3.eth.getAccounts();

    if (accounts.length === 0) {
      console.log("请先连接钱包");
      return;
    }

    let balances = await Promise.all(
      accounts.map((x) => web3.eth.getBalance(x))
    );

    balances = balances.map((wei) => {
      wei = web3.utils.toBN(wei);
      return web3.utils.fromWei(wei, "ether");
    });

    console.log({ accounts, balances });

    setAccounts(accounts);
  }, []);

  return (
    <>
      <Head>
        <title>众筹 DApp</title>
      </Head>
      <Layout className={styles.layout}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className={styles.logo}>{collapsed ? "筹" : "众筹 DApp"}</div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1" icon={<UserOutlined />}>
              <Link href="/">项目列表</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className={styles["site-layout"]}>
          <Header
            className={styles["site-layout-background"]}
            style={{ padding: 0 }}
          >
            <div className={styles.headerWrap}>
              <div className={styles.left}>
                {React.createElement(
                  collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                  {
                    className: styles.trigger,
                    onClick: () => {
                      setCollapsed(!collapsed);
                    },
                  }
                )}
              </div>
              <div className={styles.right}>
                <Link href="/projects/create">发起项目</Link>
                {accounts.length > 0 ? (
                  <Button>{accounts[0]}</Button>
                ) : (
                  <Button
                    onClick={() =>
                      window.ethereum.request({ method: "eth_requestAccounts" })
                    }
                  >
                    连接钱包
                  </Button>
                )}
              </div>
            </div>
          </Header>
          <Content
            className={styles["site-layout-background"]}
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              overflowY: "auto",
            }}
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};
