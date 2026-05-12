import { createApp } from 'vue'
import App from './App'
import ElementPlus from 'element-plus';
import en from 'element-plus/es/locale/lang/en'
import Contextmenu from "./component/Contextmenu"
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'
import 'element-plus/dist/index.css'
import '@/../public/theme/auto.css'
import '@/../public/theme/umyui.css'
import './view.css'
import './icon/iconfont.css'

const app = createApp(App)
app.use(ElementPlus, { locale: en })
app.use(Contextmenu)
app.use(VxeTable)
app.mount('#app')
