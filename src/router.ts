import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('./pages/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/piano-trainer/'),
  routes,
})

export { router }
