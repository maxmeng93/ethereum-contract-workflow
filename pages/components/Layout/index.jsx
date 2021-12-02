import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import styles from './style.module.scss';

const { Header, Sider, Content } = Layout;

export default (props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className={styles.logo} >{collapsed ? '筹' : '众筹 DApp'}</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            项目列表
          </Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>
            nav 2
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className={styles['site-layout']}>
        <Header className={styles['site-layout-background']} style={{ padding: 0 }}>

          <div className={styles.headerWrap}>
            <div className={styles.left}>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: styles.trigger,
                onClick: () => { setCollapsed(!collapsed) },
              })}
            </div>
            <div className={styles.right}>
              <Button type="primary">发起项目</Button>
              {
                props.accounts.length > 0 ? <Button>{props.accounts[0]}</Button> :
                  <Button onClick={() => window.ethereum.enable()}>连接钱包</Button>
              }

            </div>
          </div>
        </Header>
        <Content
          className={styles['site-layout-background']}
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          {props.children}
        </Content>
      </Layout>
    </Layout>
  );
}

