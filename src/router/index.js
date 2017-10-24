import Vue from 'vue'
import Router from 'vue-router'

import UmfChart from '@/views/UmfChart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'UmfChart',
      component: UmfChart
    }
  ]
})
