import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  // @ts-expect-error
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to) => {
    if (to) {
      return { selector: to.hash }
    }

    return { left: 0, top: 0 }
  },
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeEach((to, from) => {
  const isLogin = localStorage.getItem('isLogin')
  console.log('isLogin', isLogin)
  if (isLogin === 'yes') {
    return true
  } else {
    if (to.path === '/login') {
      return true
    } else {
      router.push('/login')
      return false
    }
  }
})

export default router
