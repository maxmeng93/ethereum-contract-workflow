import 'antd/dist/antd.css';
import Layout from '@/components/Layout';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
