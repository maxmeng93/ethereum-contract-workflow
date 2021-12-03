import React, { useState, useEffect } from "react";
import {
  message,
  Card,
  Statistic,
  Progress,
  InputNumber,
  Button,
  Spin,
} from "antd";
import web3 from "../../../lib/web3";
import ProjectList from "../../../lib/projectList";
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
      const result = await contract.methods.contribute().send({
        from: owner,
        value: web3.utils.toWei(`${invest}`, "ether"),
        gas: "5000000",
      });

      message.success("投资成功");
      console.log(result);

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
          <Progress percent={30} />

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
    </Layout>
  );
};

export default ProjectDetail;
