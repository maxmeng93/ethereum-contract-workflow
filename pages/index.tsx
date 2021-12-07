import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProjectList from "../lib/projectList";
import Project from "../lib/project";
import { Row, Col, Card, Statistic } from "antd";
import web3 from "web3";
import Layout from "./components/Layout";

const InfoBlock = (props: {title: string, description: string}) => {
  const { title, description } = props;
  return (
    <Card.Grid>
      <Statistic title={description} value={title}></Statistic>
    </Card.Grid>
  );
};

export default function Index () {
  const [projects, setProjects] = useState([]);

  useEffect(async () => {
    const addressList = await ProjectList.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map((address) => Project(address).methods.getSummary().call())
    );

    const data = addressList.map((address, i) => {
      const [
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner,
      ] = Object.values(summaryList[i]);
      return {
        address,
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner,
      };
    });

    setProjects(data);
  }, []);

  return (
    <Layout>
      <Row gutter={[16, 16]}>
        {projects.map((project: any) => (
          <Col
            key={project.address}
            xs={{ span: 24, offset: 0 }}
            sm={{ span: 12, offset: 0 }}
            md={{ span: 12, offset: 0 }}
            lg={{ span: 12, offset: 0 }}
            xl={{ span: 12, offset: 0 }}
            xxl={{ span: 8, offset: 0 }}
          >
            <Card
              title={project.description}
              actions={[
                <Link key="detail" href={`/projects/${project.address}`}>查看详情</Link>,
              ]}
            >
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
          </Col>
        ))}
      </Row>
    </Layout>
  );
};
