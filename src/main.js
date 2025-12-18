import { createApp } from 'vue'
import Element from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

createApp(App)
  .use(Element, {
    locale: zhCn,
  })
  .mount('#app')
