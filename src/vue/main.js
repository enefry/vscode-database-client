import { createApp } from 'vue'
import App from './App'
import ElementPlus from 'element-plus';
import en from 'element-plus/es/locale/lang/en'
import { createRouter, createWebHashHistory } from 'vue-router'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'

import '@/../public/theme/auto.css'
import '@/../public/theme/umyui.css'
import 'element-plus/dist/index.css'
import 'tailwindcss/tailwind.css'

import connect from "./connect";
import status from "./status";
import design from "./design";
import structDiff from "./structDiff";
import keyView from "./redis/keyView";
import terminal from "./redis/terminal";
import redisStatus from "./redis/redisStatus";
import forward from "./forward";
import sshTerminal from "./xterm";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/connect', component: connect, name: 'connect' },
    { path: '/status', component: status, name: 'status' },
    { path: '/design', component: design, name: 'design' },
    { path: '/structDiff', component: structDiff, name: 'structDiff' },
    // redis
    { path: '/keyView', component: keyView, name: 'keyView' },
    { path: '/terminal', component: terminal, name: 'terminal' },
    { path: '/redisStatus', component: redisStatus, name: 'redisStatus' },
    // ssh
    { path: '/forward', component: forward, name: 'forward' },
    { path: '/sshTerminal', component: sshTerminal, name: 'sshTerminal' },
  ]
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus, { locale: en })
app.use(VxeTable)
app.mount('#app')
