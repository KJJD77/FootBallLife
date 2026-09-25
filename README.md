# FootBallLife

网页版足球人生模拟器：从 16 岁青训小将开始，一个月一个月地书写你的传奇。

- 每月焦点战可亲自出战：实时解说 + 关键时刻决策 + three.js 3D 进球集锦 + 点球大战
- 训练、生活方式、随机事件、转会窗口、主帅系统、感情与家庭、资产
- 联赛 / 杯赛 / 洲际赛事 / 世界杯，金球奖、金靴等荣誉

## 运行

```bash
npm install
npm run dev
```

技术栈：Vite + TypeScript + three.js + Chart.js

## 部署

项目同时保留 GitHub Pages 与 Cloudflare Workers 的静态部署配置。Cloudflare 部署使用仓库里的 `wrangler.jsonc`：

```bash
npm run build
npx wrangler deploy
```

当前 GitHub Actions 工作流部署到 GitHub Pages；如果要让 Actions 直接发布到 Cloudflare，需要在仓库 Secrets 中配置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`，再使用 Wrangler Action。不要把本地 `auth.json`、API key 或中转站配置提交到仓库。

### 国内访问

`*.pages.dev`、`*.workers.dev` 和部分 Cloudflare 共享出口在中国大陆可能被运营商或 DNS 污染拦截，这通常不是前端代码问题。稳定访问需要绑定自己的域名并使用可解析的 DNS；如果目标用户主要在大陆，还应准备大陆 CDN / 备案域名，或把静态资源放到国内对象存储。Cloudflare 的国际边缘节点不能承诺中国大陆可达性。
