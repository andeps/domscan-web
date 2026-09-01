import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'fhcode · 域名检测', description: '快速发现可注册域名，监控域名到期状态' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html> }
