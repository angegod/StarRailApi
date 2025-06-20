import '@/css/globals.css';
import Footer from '@/components/Footer';
import { StatusToastProvider } from '@/context/StatusMsg.js';
import LayoutClient from './layoutclient'; // 👈 新增的 Client Component
import Head from 'next/head';

export const metadata = {
  title: '崩鐵--遺器重擲模擬--主頁',
  description: '崩鐵--遺器重擲模擬--主頁',
  other: {
    keywords: '遺器重洗, 遺器重洗模擬, relic enchant, relic simulator, relic ranker, 遺器重擲, 遺器重擲模擬器',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
        <head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta name="keywords" content={metadata.other.keywords} />
        </head>
        <body>
            <StatusToastProvider>
            <LayoutClient>{children}</LayoutClient>
            <Footer />
            </StatusToastProvider>
        </body>
    </html>
  );
}
