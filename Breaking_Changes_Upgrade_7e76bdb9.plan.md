# Breaking Changes Dependency Upgrade Plan

> 版本数据来源：npm registry 实时查询（2026-05-12）

## Branch
`upgrade/breaking-changes`（从 `main` 创建）

## 版本对照表

| 包 | 当前版本 | 目标版本 | 备注 |
|---|---|---|---|
| `typescript` | ^3.8.3 | **6.0.3** | 最新稳定版（v7 尚未发布） |
| `ts-loader` | ^7.0.5 | 9.5.7 | |
| `webpack` | ^4.43.0 | 5.106.2 | |
| `webpack-cli` | ^3.3.11 | **7.0.2** | 跨越两个大版本 |
| `babel-loader` | ^8.1.0 | 10.1.1 | |
| `@babel/core` | ^7.26.10 | 7.29.0 | minor，无破坏性变更 |
| `copy-webpack-plugin` | ^6.3.0 | 14.0.0 | |
| `html-webpack-plugin` | ^4.3.0 | 5.6.7 | |
| `css-loader` | ^3.5.3 | 7.1.4 | |
| `style-loader` | ^1.2.1 | 4.0.0 | |
| `postcss-loader` | ^4.1.0 | 8.2.1 | |
| `tailwindcss` | ^2.0.2 | 4.3.0 | ⏸️ 暂缓，仅纯样式，不影响功能 |
| `vue` | ^2.6.11 | 3.5.34 | Options API 仍支持 |
| `vue-loader` | ^15.9.2 | 17.4.2 | |
| `vue-template-compiler` | ^2.6.11 | 移除 | Vue 3 不需要 |
| `vue-router` | ^3.4.1 | **5.0.6** | npm latest 已是 v5（非 v4） |
| `element-ui` | ^2.13.2 | element-plus 2.14.0 | 替换包名 |
| `ssh2` | 0.5.4 | 1.17.0 | |
| `mongodb` | ^3.6.9 | 7.2.0 | Client API 大幅重写 |
| `ioredis` | ^4.23.0 | 5.10.1 | |
| `bson` | ^4.7.2 | 7.2.0 | 随 mongodb 升级 |
| `mysql2` | ^2.2.5 | 3.22.3 | |
| `axios` | ^0.21.1 | 1.16.0 | |
| `xterm` | ^4.12.0 | `@xterm/xterm` 5.x | 包名已迁移到 scoped 包 |
| `xterm-addon-fit` | ^0.5.0 | `@xterm/addon-fit` 0.8.0 | 同上迁移 |
| `xterm-addon-search` | ^0.8.0 | `@xterm/addon-search` 0.13.0 | |
| `xterm-addon-web-links` | ^0.4.0 | `@xterm/addon-web-links` 0.9.0 | |
| `readable-stream` | 1.1.x | 4.7.0 | |

---

## 升级优先级与顺序

### Phase 1 — 构建工具链（优先，影响最广）

- **webpack 4 → 5**
  - 更新 `webpack.config.js`：移除 `node.fs/net/tls` 等已废弃写法，改用 `resolve.fallback`
  - Node.js polyfill 已全部移除，需显式配置 `resolve.fallback`
- **webpack-cli 3 → 7**（跨越 3 个大版本，CLI 参数有变化）
- **copy-webpack-plugin** 6 → 14
- **html-webpack-plugin** 4 → 5
- **css-loader** 3 → 7、**style-loader** 1 → 4、**postcss-loader** 4 → 8
- **TypeScript 3 → 6**（⚠️ v7 尚未发布，6.0.3 是当前最新稳定版）
  - 更新 `ts-loader` 7 → 9
  - TS 4/5/6 严格模式引入了大量类型检查变更，需逐一修复
  - TS 6 移除了部分旧版装饰器语法，若使用需更新 `tsconfig.json` 的 `experimentalDecorators`
- **babel-loader** 8 → 10
- **tailwindcss**：⏸️ 暂缓（项目仅一行 CSS import + 一处 `@apply font-bold`，纯样式，不影响功能）

### Phase 2 — Vue 2 → Vue 3（工作量最大）

- `vue` 2.x → 3.5.34
- `vue-loader` 15 → 17
- `vue-router` 3.x → **5.0.6**（npm latest 已为 v5，注意不要安装 ^4）
- 移除 `vue-template-compiler`（Vue 3 不需要）
- `element-ui` → `element-plus` 2.14.0（替换包名，不是升级）
- 逐一迁移 `.vue` 组件：
  - Options API → Composition API（或保留 Options API，Vue 3 兼容）
  - 全局 `Vue.use/Vue.component` 改为 `app.use/app.component`
  - `$listeners` / `$scopedSlots` 等废弃 API 替换
  - `vue-router` v5 API 与 v3 有显著差异，`router.push` 返回 Promise

### Phase 3 — 数据库驱动层

- **ssh2** 0.5 → 1.17（回调/事件命名调整，`Client` API 有变化）
- **mongodb** 3 → 7.2（Client API 大幅重写，`connect()` 方式变更）
- **ioredis** 4 → 5.10（少量 API 变更）
- **bson** 4 → 7.2（随 mongodb 升级，部分类型变更）
- **mysql2** 2 → 3.22（Promise API 细节变化）
- **axios** 0.x → 1.16（拦截器/错误处理有调整）

### Phase 4 — 终端与其余依赖

- **xterm → @xterm/xterm**（包名迁移，非版本升级）
  - `xterm` 4 → `@xterm/xterm` 5.3.0
  - `xterm-addon-fit` → `@xterm/addon-fit` 0.8.0
  - `xterm-addon-search` → `@xterm/addon-search` 0.13.0
  - `xterm-addon-web-links` → `@xterm/addon-web-links` 0.9.0
  - import 路径从 `xterm` 改为 `@xterm/xterm`，API 基本兼容
- **readable-stream** 1.x → 4.7.0
- `compare-versions`、`comment-json`、`deepmerge`、`date-format`、`esbuild` 等小版本

---

## 关键风险点

| 风险 | 级别 | 说明 |
|---|---|---|
| Vue 2 → 3 | 🔴 高 | 工作量最大，建议单独子分支逐组件迁移 |
| element-ui → element-plus | 🔴 高 | 组件 API 差异多，需逐一核查 |
| tailwindcss 2 → 4 | ⏸️ 暂缓 | 仅纯样式（1 处 import + 1 处 @apply），可单独处理 |
| typescript 3 → 6 | 🟠 中 | 严格类型检查，TS 6 装饰器变更 |
| webpack-cli 3 → 7 | 🟠 中 | CLI 参数/插件 API 有变化 |
| mongodb 3 → 7 | 🟠 中 | Client 连接方式重写 |
| xterm 包名迁移 | 🟡 低 | 只需替换 import，API 基本兼容 |
| webpack 4 → 5 Node polyfill | 🟡 低 | 已有明确修复方案（resolve.fallback） |

---

## 关于 TypeScript 版本说明

> 你提到想升级到 TypeScript 7，但截至 2026-05-12，**TypeScript 7 尚未发布**。
> 当前 npm `latest` 标签指向 **6.0.3**，beta 标签为 6.0.0-beta，rc 为 6.0.1-rc。
> 建议目标锁定 **TypeScript 6.0.3**，等 v7 发布后再评估。

---

## 验证方式

每个 Phase 完成后：
1. `npm run build` 无报错
2. `vsce package` 生成 vsix
3. 在 VS Code 中安装测试基本连接功能
