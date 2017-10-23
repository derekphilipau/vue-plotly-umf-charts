import Vue from 'vue'
import Router from 'vue-router'

import StullChart from '@/views/StullChart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StullChart',
      component: StullChart
    }
  ]
})
