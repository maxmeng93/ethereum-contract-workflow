import Document from 'next/document';
import React from 'react';

// 解决 antd 在服务端渲染时关于 useLayoutEffect 的报错
React.useLayoutEffect = React.useEffect

export default Document;