import '@/css/globals.css';
import Footer from '@/components/Footer';
import { StatusToastProvider } from '@/context/StatusMsg.js';
import LayoutClient from './LayoutClient'; // 👈 新增的 Client Component

//不能移除掉 下方手動寫的也不能拿掉
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
            <link rel="icon" href="/StarRailApi/favicon.ico" />
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
