import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { message, Form, Spin, Input, InputNumber, Button } from "antd";
import Layout from "../../../components/Layout";
import Project from "../../../../lib/project";
import web3 from "../../../../lib/web3";

export async function getServerSideProps(context) {
  return {
    props: {
      query: context.query,
    },
  };
}

const Payment = (props) => {
  const router = useRouter();
  const { query } = props;
  const { address } = query;

  const rules = [{ required: true, message: "字段必填" }];
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState({});

  useEffect(async () => {
    const contract = Project(address);

    const summary = await contract.methods.getSummary().call();
    const description = summary[0];
    const owner = summary[7];

    setProject({ address, description, owner });
  }, []);

  const onFinish = async (values) => {
    try {
      const { description, amount, receiver } = values;

      // 字段合规检查
      if (!description) {
        throw message.warning("支出理由不能为空");
      }
      if (amount <= 0) {
        throw message.warning("支出金额必须大于0");
      }
      if (!web3.utils.isAddress(receiver)) {
        throw message.warning("收款人账户地址不正确");
      }

      const amountInWei = web3.utils.toWei(`${amount}`, "ether");

      setLoading(true);

      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      // 检查账户
      if (sender !== project.owner) {
        throw message.warning("只有管理员能创建资金支出请求");
      }

      // 创建项目
      const contract = Project(address);

      await contract.methods
        .createPayment(description, amountInWei, receiver)
        .send({ from: sender, gas: "5000000" });

      message.success("资金支持请求创建成功");

      setTimeout(() => {
        router.push(`/projects/${address}`);
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
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          onFinish={onFinish}
        >
          <Form.Item label="支出理由" name="description" rules={rules}>
            <Input></Input>
          </Form.Item>
          <Form.Item label="支出金额" name="amount" rules={rules}>
            <InputNumber addonAfter="eth" min={0}></InputNumber>
          </Form.Item>
          <Form.Item label="收款方" name="receiver" rules={rules}>
            <Input></Input>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Layout>
  );
};

export default Payment;
