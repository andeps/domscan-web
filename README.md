# domscan-web

domscan 的独立前端项目，负责域名检测、批量扫描、用户登录和账户管理界面。

## 技术栈

- Next.js 15（App Router）
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- Node.js `>= 24.18.0`

## 环境要求

```bash
node -v
# v24.18.0 或更高版本
npm -v
```

## 安装依赖

```bash
npm install
```

## 开发运行

先启动 Go 后端（默认监听 `http://localhost:8080`），再启动前端：

```bash
npm run dev
```

浏览器访问：

```text
http://localhost:3000
```

开发环境下，Next.js 会将 `/api/*` 请求代理到：

```text
http://localhost:8080/api/*
```

代理配置位于 `next.config.mjs`。

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | 首页和域名快速检测 |
| `/batch` | 会员批量扫描 |
| `/login` | 用户登录 |
| `/register` | 用户注册 |
| `/account` | 用户资料管理 |

## 常用命令

```bash
npm run dev        # 开发服务器
npm run typecheck  # TypeScript 类型检查
npm run build      # 生产构建
npm run start      # 启动生产服务
```

## 鉴权说明

登录成功后，后端返回的 JWT 会保存在浏览器 `localStorage`：

```text
domscan-token
domscan-user
```

批量扫描和用户资料接口会自动携带：

```http
Authorization: Bearer <JWT>
```

退出登录时会清除上述本地数据。

## 目录结构

```text
app/
├── page.tsx              首页
├── batch/page.tsx        批量扫描
├── login/page.tsx        登录
├── register/page.tsx     注册
├── account/page.tsx      用户管理
├── layout.tsx            根布局和 Metadata
└── globals.css           Tailwind 全局样式
components/
├── account-menu.tsx      顶部账户菜单
└── ui/button.tsx         shadcn/ui 风格按钮
lib/utils.ts              className 合并工具
next.config.mjs           API 代理配置
tailwind.config.ts        Tailwind 配置
```

## 后端接口

前端依赖 Go 后端提供以下接口：

```text
POST /api/check
POST /api/search
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/avatar
PUT  /api/auth/email
PUT  /api/auth/password
```

## 生产部署

```bash
npm run build
npm run start
```

生产环境请通过反向代理将 `/api` 转发到 Go 服务，并配置 HTTPS、JWT 密钥和后端数据库。

## 注意事项

- `/api/check` 返回 NDJSON，首页会读取第一行结果。
- 批量扫描需要有效 JWT。
- 不要将 `.env`、Token 或生产密钥提交到仓库。
- `node_modules`、`.next` 和 `.output` 已加入 `.gitignore`。
