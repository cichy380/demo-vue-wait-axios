import Vue from 'vue'
import Router from 'vue-router'
import HomeView from '../components/_index'
import PostsView from '../components/_posts'
import TodosView from '../components/_todos'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/posts',
            name: 'Posts',
            component: PostsView
        },
        {
            path: '/todos',
            name: 'Todos',
            component: TodosView
        },
        {
            path: '/',
            name: 'Homepage',
            component: HomeView
        }
    ],

    linkActiveClass: 'active'
})
