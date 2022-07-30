<script lang='ts'>
import { defineComponent } from 'vue'

export default defineComponent({
  beforeRouteEnter(to, from, next) {
    // Handle auth logic here, redirect to login or home if logged in
    const isLogin = localStorage.getItem('isLogin')
    console.log('isLogin', isLogin)
    if (isLogin === 'yes') {
      next('/home')
    }
    next('/login')
  },
})
</script>
