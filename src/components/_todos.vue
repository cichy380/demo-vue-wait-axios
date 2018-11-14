<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded p-3">
        <h3 class="mb-4">Todo list <small class="text-muted tiny">({{ todos.length }} items)</small></h3>

        <v-wait for="todos">
            <template slot="waiting">
                <p class="color-animation">
                    Loading todo list...
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

        <p v-show="!$wait.is('todos')">
            <button v-if="todos.length === 0" @click="getAllTodos" class="btn btn-primary">Get todos</button>
            <button v-if="todos.length" @click="clear" class="btn btn-danger">Remove todos</button>
        </p>

        <div class="list-group">
            <div v-for="(item, index) in todos"
                 :key="item.id"
                 v-if="item.title && index <= 200"
                 class="list-group-item flex-column align-items-start">
                <strong>{{ item.title }}</strong><br>
                <small>
                    User: {{ item.userName }} <em v-if="!item.userName" class="color-animation">loading...</em>
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
                todos: [],
                users: [],
                errors: [],
                axiosTokenSources: []
            }
        },

        methods: {
            // Fetches all todos
            getAllTodos () {
                let randomValue = Math.random()
                let url = `https://jsonplaceholder.typicode.com/todos?rand=${randomValue}`
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start('todos')

                axios.get(url, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((item) => {
                            item.userName = ''
                            this.todos.push(item)
                        })
                        this.usersUpdate()
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Todos<br>Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end('todos')
                    })
            },

            clear () {
                this.todos = []
                this.users = []
                this.axiosTokenSources.forEach((source) => {
                    source.cancel()
                })
            },

            usersUpdate () {
                this.todos.forEach((item) => {
                    if (item.userId) {
                        let randomValue = Math.random()
                        let url = `https://jsonplaceholder.typicode.com/users/${item.userId}?rand=${randomValue}`
                        let CancelToken = axios.CancelToken
                        let source = CancelToken.source()
                        this.axiosTokenSources.push(source)

                        // start waiting
                        this.$wait.start(`user.${item.userId}-${randomValue}`)

                        axios.get(url, {cancelToken: source.token})
                            .then(response => { // handle success
                                item.userName = response.data.name
                                this.users.push(response.data)
                            })
                            .catch(e => { // handle error
                                if (!axios.isCancel(e)) {
                                    this.errors.push(`ERROR while get User (id: ${item.userId})<br>Message: ${e.message}`)
                                }
                            })
                            .then(() => { // always executed
                                // stop waiting
                                this.$wait.end(`user.${item.userId}-${randomValue}`)
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
