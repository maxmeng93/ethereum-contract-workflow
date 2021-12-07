import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  message,
  Card,
  Statistic,
  Progress,
  InputNumber,
  Button,
  Spin,
  Table,
} from "antd";
import web3 from "../../../lib/web3";
import Project from "../../../lib/project";
import Layout from "../../components/Layout";

const InfoBlock = (props) => {
  const { title, description } = props;
  return (
    <Card.Grid>
      <Statistic title={description} value={title}></Statistic>
    </Card.Grid>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      query: context.query,
    },
  };
}

const PaymentTable = (props) => {
  const { investorCount, data, address, owner } = props;
  const [loading, setLoading] = useState(false);

  // 投票
  const approvePayment = async (i) => {
    try {
      setLoading(true);
      const accounts = await web3.eth.getAccounts();
      const investor = accounts[0];

      const contract = Project(address);
      await contract.methods
        .approvePayment(i)
        .send({ from: investor, gas: "5000000" });

      message.success("投票成功");

      setTimeout(() => {
        location.reload();
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 资金划转
  const doPayment = async (i) => {
    try {
      setLoading(true);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      if (sender !== owner) {
        throw message.warning("只有管理员才能划转资金");
      }

      const contract = Project(address);
      await contract.methods
        .doPayment(i)
        .send({ from: sender, gas: "5000000" });

      message.success("资金划转成功");

      setTimeout(() => {
        location.reload();
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "支出理由",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "支出金额",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => {
        return web3.utils.fromWei(amount, "ether");
      },
    },
    {
      title: "收款人",
      dataIndex: "receiver",
      key: "receiver",
    },
    {
      title: "已完成？",
      dataIndex: "completed",
      key: "completed",
      render: (text) => {
        return text ? "是" : "否";
      },
    },
    {
      title: "投票状态",
      dataIndex: "voterCount",
      key: "voterCount",
      render: (text, record) => {
        return `${record.voterCount}/${investorCount}`;
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (text, row, index) => {
        const buttons = [];
        if (!row.completed) {
          buttons.push(
            <Button key="1" type="link" onClick={() => approvePayment(index)}>
              投赞成票
            </Button>
          );
        }

        if (!row.completed && row.voterCount / investorCount > 0.5) {
          buttons.push(
            <Button type="link" onClick={() => doPayment(index)}>
              资金划转
            </Button>
          );
        }

        return buttons;
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table columns={columns} dataSource={data} rowKey="description" />
    </Spin>
  );
};

const ProjectDetail = (props) => {
  const { query } = props;
  const { address } = query;

  const [loading, setLoading] = useState(false);
  const [invest, setInvest] = useState(0);
  const [project, setProject] = useState({
    description: "",
    minInvest: "0",
    maxInvest: "0",
    goal: "0",
    balance: "0",
    investorCount: "0",
    paymentCount: "0",
    owner: "",
  });

  useEffect(async () => {
    const contract = Project(address);
    const summary = await contract.methods.getSummary().call();
    const [
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
    ] = Object.values(summary);

    const tasks = [];
    for (let i = 0; i < paymentCount; i++) {
      tasks.push(contract.methods.payments(i).call());
    }
    const payments = await Promise.all(tasks);

    setProject({
      address: query.address,
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
      payments,
    });
  }, []);

  const submit = async () => {
    const { minInvest, maxInvest } = project;
    const minInvestInEther = web3.utils.fromWei(minInvest, "ether");
    const maxInvestInEther = web3.utils.fromWei(maxInvest, "ether");

    if (invest <= 0) {
      return message.warning("投资金额必须大于0");
    }
    if (invest < minInvestInEther) {
      return message.warning("投资金额必须大于最小投资金额");
    }
    if (invest > maxInvestInEther) {
      return message.warning("投资金额必须小于最大投资金额");
    }

    setLoading(true);

    try {
      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      // 发起转账
      const contract = Project(project.address);
      await contract.methods.contribute().send({
        from: owner,
        value: web3.utils.toWei(`${invest}`, "ether"),
        gas: "5000000",
      });

      message.success("投资成功");

      setTimeout(() => {
        location.reload();
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Spin spinning={loading}>
        <Card title={project.description}>
          <Progress
            percent={
              (web3.utils.fromWei(project.balance, "ether") /
                web3.utils.fromWei(project.goal, "ether")) *
              100
            }
          />

          <InfoBlock
            title={`${web3.utils.fromWei(project.goal, "ether")} ETH`}
            description="募资上限"
          />
          <InfoBlock
            title={`${web3.utils.fromWei(project.minInvest, "ether")} ETH`}
            description="最小投资金额"
          />
          <InfoBlock
            title={`${web3.utils.fromWei(project.maxInvest, "ether")} ETH`}
            description="最大投资金额"
          />
          <InfoBlock
            title={`${project.investorCount}人`}
            description="参投人数"
          />
          <InfoBlock
            title={`${web3.utils.fromWei(project.balance, "ether")} ETH`}
            description="已募资金额"
          />
        </Card>

        <InputNumber
          addonAfter="eth"
          min={0}
          value={invest}
          onChange={setInvest}
        ></InputNumber>

        <Button type="primary" onClick={() => submit()}>
          立即投资
        </Button>
      </Spin>

      <Card title="资金支持请求">
        <Button type="primary">
          <Link href={`/projects/${address}/payments/create`}>
            创建资金支出请求
          </Link>
        </Button>
        <PaymentTable
          data={project.payments}
          investorCount={project.investorCount}
          address={address}
          owner={project.owner}
        ></PaymentTable>
      </Card>
    </Layout>
  );
};

export default ProjectDetail;
