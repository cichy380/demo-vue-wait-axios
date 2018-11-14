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

        <v-wait for="comments.*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading comments ({{ comments.length }} items)...
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
                <section class="small">
                    <p class="mb-1">
                        <strong>Comments</strong>
                        <span class="text-muted">({{ post.comments.length }})</span>
                    </p>
                    <div class="color-animation" v-if="post.comments.length === 0">Loading comments...</div>
                    <div class="list-group">
                        <div v-for="comment in post.comments"
                             :key="comment.id"
                             class="list-group-item flex-column align-items-start">
                            {{ comment.body }}
                            <div class="text-muted">~ {{ comment.email }}</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
</template>

<script>
    import axios from 'axios'

    const postsUrl = 'https://jsonplaceholder.typicode.com/posts'

    export default {
        data () {
            return {
                posts: [],
                users: [],
                comments: [],
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
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start('posts')

                axios.get(`${postsUrl}?rand=${randomValue}`, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((post) => {
                            post.userName = ''
                            post.comments = []
                            this.posts.push(post)
                        })
                        this.getComments()
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
                this.comments = []
                this.axiosTokenSources.forEach((source) => {
                    source.cancel()
                })
            },

            getComments () {
                this.posts.forEach((post) => {
                    if (post.userId) {
                        let CancelToken = axios.CancelToken
                        let source = CancelToken.source()
                        this.axiosTokenSources.push(source)

                        // start waiting
                        this.$wait.start(`comments.post-${post.id}`)

                        axios.get(`${postsUrl}/${post.id}/comments?rand=${Math.random()}`, {cancelToken: source.token})
                            .then(response => { // handle success
                                post.comments = response.data
                                response.data.forEach((comment) => this.comments.push(comment))
                            })
                            .catch(e => { // handle error
                                if (!axios.isCancel(e)) {
                                    this.errors.push(`ERROR while get Comments (postId: ${post.id}). Message: ${e.message}`)
                                }
                            })
                            .then(() => { // always executed
                                // stop waiting
                                this.$wait.end(`comments.post-${post.id}`)
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
