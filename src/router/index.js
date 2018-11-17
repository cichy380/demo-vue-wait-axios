import Vue from 'vue'
import Router from 'vue-router'
import HomeView from '../components/Homepage'
import PostsView from '../components/Posts'
import TodosView from '../components/Todos'
import AlbumsView from '../components/Albums'

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
            path: '/albums',
            name: 'Albums',
            component: AlbumsView
        },
        {
            path: '/',
            name: 'Homepage',
            component: HomeView
        }
    ],

    linkActiveClass: 'active'
})
