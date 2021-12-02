import React, { useState, useEffect } from 'react';
import ProjectList from '../lib/projectList';
import Project from '../lib/project';
import { Row, Col, Card } from 'antd';
import styles from './styles.module.scss';

export default () => {
  const [projects, setProjects] = useState([]);

  useEffect(async () => {
    const addressList = await ProjectList.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map(address => Project(address).methods.getSummary().call())
    );
    

    const data = addressList.map((address, i) => {
      const [description, minInvest, maxInvest, goal, balance, investorCount, paymentCount, owner] = Object.values(
        summaryList[i]
      );
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
    <Row>
      {projects.map((project, i) => (
        <Col key={project.address} xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 1 }}>
          <Card 
            title={project.description} 
            actions={[
              <span>立即投资</span>,
              <span>查看详情</span>,
            ]}
          >
            <p className={styles.address}>{project.address}</p>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
