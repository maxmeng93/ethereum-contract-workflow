基于以太坊智能合约的 ADpp

## 命令

```bash
# 开发
yarn run dev

# 部署智能合约
yarn run deploy

# 部署 DApp
yarn run start
```

## 目录结构

```
├── compiled 编辑文件
├── contracts 合约
├── scripts 脚本
├── tests 测试用例
├── .gitignore
├── package.json
.
```

## 配置

```js
// ./config.js
module.exports = {
  memonic: "", // 助记词
  rinkebyUrl: "", // 接口连接
};
```
