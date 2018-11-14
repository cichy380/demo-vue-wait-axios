<template>
    <div>
        <h2>Posts</h2>
        <p>Lorem ipsum dolor sit amet enim. Etiam ullamcorper. Suspendisse a pellentesque dui, non felis. Maecenas..</p>
    </div>
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

        // Fetches posts when the component is created.
        created () {
            axios.get(`http://jsonplaceholder.typicode.com/posts`)
                .then(response => {
                    // JSON responses are automatically parsed.
                    this.posts = response.data
                })
                .catch(e => {
                    this.errors.push(e)
                })
        }
    }
</script>
