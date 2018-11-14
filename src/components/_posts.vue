<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded my-4 p-3">
        <h3>Posts</h3>
        <div v-for="error in errors" :key="error" class="alert alert-danger mb-1">{{ error.message }}</div>
        <p></p>
        <p v-if="posts.length === 0">
            <em>No posts.</em>
        </p>
        <p v-if="posts.length">
            Loaded {{ posts.length }} posts.
        </p>
        <p>
            <button v-if="posts.length === 0" @click="getAllPosts" class="btn btn-primary">Get posts</button>
            <button v-if="posts.length" @click="posts=[]" class="btn btn-danger">Remove posts</button>
        </p>
        <div class="list-group">
            <div v-for="(post, index) in posts"
                 :key="post.id"
                 v-if="index <= 100"
                 class="list-group-item flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ post.title }}</h5>
                </div>
                <p class="mb-1">{{ post.body }}</p>
                <small v-show="post.userName">Author: {{ post.userName }}</small>
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
                errors: []
            }
        },

        methods: {
            // Fetches all posts
            getAllPosts () {
                let randomValue = Math.random()
                axios.get(`http://jsonplaceholder.typicode.com/posts?rand=${randomValue}`)
                    .then(response => {
                        response.data.forEach((post) => {
                            post.userName = ''
                            this.posts.push(post)
                        })
                        this.usersUpdate()
                    })
                    .catch(e => {
                        this.errors.push(e)
                    })
            },

            usersUpdate () {
                this.posts.forEach((post) => {
                    if (post.userId) {
                        axios.get(`https://jsonplaceholder.typicode.com/users/${post.userId}`)
                            .then(response => {
                                this.users.push(response.data)
                                post.userName = response.data.name
                            })
                            .catch(e => {
                                this.errors.push(e)
                            })
                    }
                })
            }
        }
    }
</script>
