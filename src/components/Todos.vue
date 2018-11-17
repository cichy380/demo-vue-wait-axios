<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded p-3">
        <h3 class="mb-4">Todo list <small class="text-muted tiny">({{ todos.length }} items)</small></h3>

        <v-wait for="loading.todos">
            <template slot="waiting">
                <p class="color-animation">
                    Loading todo list...
                </p>
            </template>
        </v-wait>

        <v-wait for="loading.user.*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading users ({{ users.length }} items)...
                </p>
            </template>
        </v-wait>

        <div v-for="error in errors" :key="error" class="alert alert-danger mb-4">{{ error }}</div>

        <p v-show="!$wait.any">
            <button v-if="todos.length === 0" @click="getAllTodos" class="btn btn-primary">Get todos</button>
            <button v-if="todos.length" @click="clear" class="btn btn-danger">Remove todos</button>
        </p>

        <p v-show="$wait.any">
            <button @click="cancel" class="btn btn-danger">
                Stop loading!
            </button>
        </p>

        <div class="list-group">
            <div v-for="(item, index) in todos"
                 :key="item.id"
                 v-if="item.title && index <= 200"
                 class="list-group-item flex-column align-items-start">
                <strong>{{ item.title }}</strong><br>
                <small>
                    User: {{ item.userName }}
                    <em v-if="$wait.waiting(`loading.user.todo-${item.id}`)" class="color-animation">loading...</em>
                </small>
            </div>
        </div>
    </main>
</template>

<script>
    import axios from 'axios'

    const todosUrl = 'https://jsonplaceholder.typicode.com/todos'
    const usersUrl = 'https://jsonplaceholder.typicode.com/users'

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
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start('loading.todos')

                axios.get(`${todosUrl}?rand=${Math.random()}`, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((item) => {
                            item.userName = ''
                            this.todos.push(item)
                        })
                        this.getAllUsres()
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Todos. Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end('loading.todos')
                    })
            },

            clear () {
                this.todos = []
                this.users = []
                this.cancel()
            },

            cancel () {
                this.axiosTokenSources.forEach((source) => {
                    source.cancel()
                })
            },

            getUser (todo) {
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start(`loading.user.todo-${todo.id}`)

                axios.get(`${usersUrl}/${todo.userId}?rand=${Math.random()}`, {cancelToken: source.token})
                    .then(response => { // handle success
                        todo.userName = response.data.name
                        this.users.push(response.data)
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get User (id: ${todo.userId}). Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end(`loading.user.todo-${todo.id}`)
                    })
            },

            getAllUsres () {
                this.todos.forEach((item) => {
                    if (item.userId) {
                        this.getUser(item)
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
