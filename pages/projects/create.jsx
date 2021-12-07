import React, { useState } from "react";
import { message, Spin, Form, Input, InputNumber, Button } from "antd";
import web3 from "../../lib/web3";
import ProjectList from "../../lib/projectList";
import Layout from "../components/Layout";

const CreateProject = () => {
  const rules = [{ required: true, message: "字段必填" }];
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const toWei = (eth, type = "ether") => {
    return web3.utils.toWei(`${eth}`, type);
  };

  const onFinish = async (values) => {
    try {
      const { description, minInvest, maxInvest, goal } = values;
      if (minInvest <= 0) {
        throw message.warning("项目最大投资金额必须大于0");
      }
      if (maxInvest <= 0) {
        throw message.warning("项目最大投资金额必须大于0");
      }
      if (maxInvest < minInvest) {
        throw message.warning("项目最小投资金额必须小于最大投资金额");
      }
      if (goal <= 0) {
        throw message.warning("项目募资上限必须大于0");
      }

      setLoading(true);

      const minInvestInWei = toWei(minInvest);
      const maxInvestInWei = toWei(maxInvest);
      const goalInWei = toWei(goal);

      // 获取账号
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      // 创建项目
      await ProjectList.methods
        .createProject(description, minInvestInWei, maxInvestInWei, goalInWei)
        .send({ from: owner, gas: "5000000" });
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
          form={form}
          onFinish={onFinish}
        >
          <Form.Item label="项目名称" name="description" rules={rules}>
            <Input></Input>
          </Form.Item>
          <Form.Item label="最小投资金额" name="minInvest" rules={rules}>
            <InputNumber addonAfter="eth" min={0}></InputNumber>
          </Form.Item>
          <Form.Item label="最大投资金额" name="maxInvest" rules={rules}>
            <InputNumber addonAfter="eth" min={0}></InputNumber>
          </Form.Item>
          <Form.Item label="募资上限" name="goal" rules={rules}>
            <InputNumber addonAfter="eth" min={0}></InputNumber>
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

export default CreateProject;
