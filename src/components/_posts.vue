<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded p-3">
        <h3 class="mb-4">Posts <small class="text-muted tiny">({{ posts.length }} items)</small></h3>

        <v-wait for="posts">
            <template slot="waiting">
                <p class="color-animation">
                    Loading posts...
                </p>
            </template>
        </v-wait>

        <v-wait for="user.*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading users ({{ users.length }} items)...
                </p>
            </template>
        </v-wait>

        <div v-for="error in errors" :key="error" class="alert alert-danger mb-1">{{ error }}</div>

        <p v-show="!$wait.is('posts')">
            <button v-if="posts.length === 0" @click="getAllPosts" class="btn btn-primary">Get posts</button>
            <button v-if="posts.length" @click="clear" class="btn btn-danger">Remove posts</button>
        </p>

        <div class="list-group">
            <div v-for="(post, index) in posts"
                 :key="post.id"
                 v-if="post.title && index <= 100"
                 class="list-group-item flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ post.title }}</h5>
                </div>
                <p class="mb-1">{{ post.body }}</p>
                <small>
                    Author: {{ post.userName }} <em v-if="!post.userName" class="color-animation">loading...</em>
                </small>
            </div>
        </div>
    </main>
</template>

<script>
    import axios from 'axios'

    export default {
        data () {
            return {
                posts: [],
                users: [],
                errors: [],
                axiosTokenSources: []
            }
        },

        mounted: function () {
            this.getAllPosts()
        },

        methods: {
            // Fetches all posts
            getAllPosts () {
                let randomValue = Math.random()
                let url = `https://jsonplaceholder.typicode.com/posts?rand=${randomValue}`
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start('posts')

                axios.get(url, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((post) => {
                            post.userName = ''
                            this.posts.push(post)
                        })
                        this.usersUpdate()
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Posts<br>Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end('posts')
                    })
            },

            clear () {
                this.posts = []
                this.users = []
                this.axiosTokenSources.forEach((source) => {
                    source.cancel()
                })
            },

            usersUpdate () {
                this.posts.forEach((post) => {
                    if (post.userId) {
                        let randomValue = Math.random()
                        let url = `https://jsonplaceholder.typicode.com/users/${post.userId}?rand=${randomValue}`
                        let CancelToken = axios.CancelToken
                        let source = CancelToken.source()
                        this.axiosTokenSources.push(source)

                        // start waiting
                        this.$wait.start(`user.${post.userId}-${randomValue}`)

                        axios.get(url, {cancelToken: source.token})
                            .then(response => { // handle success
                                post.userName = response.data.name
                                this.users.push(response.data)
                            })
                            .catch(e => { // handle error
                                if (!axios.isCancel(e)) {
                                    this.errors.push(`ERROR while get User (id: ${post.userId})<br>Message: ${e.message}`)
                                }
                            })
                            .then(() => { // always executed
                                // stop waiting
                                this.$wait.end(`user.${post.userId}-${randomValue}`)
                            })
                    }
                })
            }
        },

        beforeRouteLeave (to, from, next) {
            this.clear()
            next()
        }
    }
</script>
