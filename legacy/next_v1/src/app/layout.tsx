import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

export const metadata = {
  title: '黄小游 AI 研学智能体',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
