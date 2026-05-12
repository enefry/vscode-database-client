# Breaking Changes Upgrade — Code Review Plan

## 升级范围
- webpack 4→5, TypeScript 3→6
- Vue 2→3 + element-ui→element-plus + umy-table→vxe-table
- DB 驱动：ssh2 0.5→1.17, mongodb 3→7, ioredis 4→5
- xterm→@xterm/xterm, historyRecorder 类型修复

## Section 1: 已完成工作（构建通过）
- [x] webpack.config.js: IgnorePlugin 语法, node-loader, vue esm-bundler
- [x] tsconfig.json: TS6 兼容选项
- [x] 20 个 Vue 文件: destroyed→unmounted, slot→#slot, .sync→v-model
- [x] element-ui→element-plus, umy-table→vxe-table
- [x] Contextmenu Vue3 重写 (createApp)
- [x] ssh2 v1: require 方式修复
- [x] mongodb v7: Promise API, TLS, result 字段
- [x] ioredis v5: 具名导入, send_command→call()
- [x] xterm→@xterm 包重命名
- [x] historyRecorder.ts pad() 返回类型修复

构建结果：`npm run build` 0 errors, `vsce package` ✅ 3.8M

---

## Section 2: 待确认问题

### P1 — 功能性问题

#### P1-1: result/App.vue — Controller #header 无效 Vue3 slot 语法
**文件**: `src/vue/result/App.vue:13`

**问题代码**:
```html
<vxe-column type="index" width="40" :seq-method="...">
  <Controller #header :result="result" :toolbar="toolbar" />
</vxe-column>
```

**问题**: Vue 3 中 `#header`（即 `v-slot:header`）不能直接加在组件元素上来表示"把该组件传入父级的 header 插槽"。必须用 `<template #header>` 包裹。当前写法 `<Controller #header>` 在 Vue 3 实际上是对 Controller 组件自身的默认作用域插槽绑定，不会出现在 vxe-column 的 header 里。

**修复方案**:
```html
<vxe-column type="index" width="40" :seq-method="...">
  <template #header>
    <Controller :result="result" :toolbar="toolbar" />
  </template>
</vxe-column>
```

---

#### P1-2: Contextmenu.vue — addEventListener/removeEventListener target 不匹配
**文件**: `src/vue/result/component/Contextmenu/components/Contextmenu.vue:78,91`

**问题代码**:
```js
addListener() {
  document.addEventListener("click", this.mouseClickListener);  // document
},
removeListener() {
  window.removeEventListener("click", this.mouseClickListener); // window ≠ document!
}
```

**问题**: `addEventListener` 用 `document`，`removeEventListener` 用 `window`。两者是不同的 EventTarget，导致监听器从未被移除，产生内存泄漏和幽灵点击监听器。

**修复方案**:
```js
removeListener() {
  if (this.mouseListening) {
    document.removeEventListener("click", this.mouseClickListener); // 改为 document
    this.mouseListening = false;
  }
}
```

---

### P2 — 代码质量问题

#### P2-1: tsconfig.json — 类型安全全部禁用
**文件**: `tsconfig.json`

`strict: false, noImplicitAny: false, strictNullChecks: false` 为快速通过编译的临时方案，长期会隐藏真实类型错误。建议在后续 PR 中逐步重新启用。

#### P2-2: main.js — tailwindcss 导入被移除
**文件**: `src/vue/main.js`

原来有 `import "tailwindcss/tailwind.css"`，升级后被删除。如果有组件使用了 tailwind utility class，样式会丢失。需要确认是否有组件依赖 tailwind。

#### P2-3: mongoConnection.ts — TLS 选项映射语义不准确
**文件**: `src/service/connect/mongoConnection.ts:14-17`

```js
tlsCertificateKeyFile: (node.clientCertPath) ? node.clientCertPath : undefined,
tlsCAFile: (node.clientKeyPath) ? node.clientKeyPath : undefined, // clientKeyPath ≠ CA file
```

`clientKeyPath`（客户端私钥）被映射到 `tlsCAFile`（CA 证书文件），语义不正确。这不影响普通 TLS 连接（`tls: true` 不需要客户端证书），但客户端证书认证场景会出错。

---

## Section 3: 优先级和执行计划

| 优先级 | Issue | 文件 | 影响 |
|--------|-------|------|------|
| P1 | Controller #header slot 语法 | result/App.vue | 表格 header 不显示列选择器 |
| P1 | removeEventListener target 不匹配 | Contextmenu.vue | 右键菜单内存泄漏 |
| P2 | tsconfig 类型安全禁用 | tsconfig.json | 长期技术债 |
| P2 | tailwind 移除 | main.js | 可能样式丢失 |
| P2 | MongoDB TLS 映射 | mongoConnection.ts | 客户端证书认证异常 |

---

## Section 4: 跨评审者验证表

| Issue | Claude | opencode | qoder | codex |
|-------|--------|----------|-------|-------|
| P1-1 Controller #header | 确认 | 待评 | 待评 | 待评 |
| P1-2 removeEventListener | 确认 | 待评 | 待评 | 待评 |
| P2-1 tsconfig strict | 确认 | 待评 | 待评 | 待评 |
| P2-2 tailwind 移除 | 确认 | 待评 | 待评 | 待评 |
| P2-3 MongoDB TLS | 确认 | 待评 | 待评 | 待评 |
