<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded p-3">
        <h3 class="mb-4">Photo Albums <small class="text-muted tiny">({{ albums.length }} items)</small></h3>

        <v-wait for="loadingdata.albums">
            <template slot="waiting">
                <p class="color-animation">
                    Loading albums...
                </p>
            </template>
        </v-wait>

        <v-wait for="loadingdata.photos.*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading photos ({{ photos.length }} items)...
                </p>
            </template>
        </v-wait>

        <div v-for="error in errors" :key="error" class="alert alert-danger mb-4">{{ error }}</div>

        <p v-show="!$wait.any">
            <button v-if="albums.length === 0" @click="getAlbums" class="btn btn-primary">
                Get albums
            </button>
            <button v-if="albums.length && photos.length === 0" @click="getAllPhotos" class="btn btn-primary">
                Show all photos
            </button>
            <button v-if="albums.length" @click="clear" class="btn btn-danger">
                Remove albums
            </button>
        </p>

        <p v-show="$wait.any">
            <button @click="cancel" class="btn btn-danger">
                Stop loading!
            </button>
        </p>

        <div class="list-group">
            <section v-for="(album) in albums"
                 :key="album.id"
                 class="album list-group-item">

                <h5 class="mb-3">{{ album.title }} <span class="text-muted" v-show="album.photos.length">({{ album.photos.length }})</span></h5>
                <div class="mb-1">
                    <button @click="getPhotos(album)"
                            v-if="album.photos.length === 0"
                            class="btn btn-outline-secondary btn-sm">Show photos</button>
                </div>
                <div class="color-animation" v-if="$wait.waiting(`loadingdata.photos.album-${album.id}`)">
                    Loading photos...
                </div>
                <div class="row">
                    <figure class="col-md-4" v-for="photo in album.photos" :key="photo.id">
                        <img :src="photo.thumbnailUrl">
                        <figcaption>{{ photo.title }}</figcaption>
                    </figure>
                </div>
            </section>
        </div>
    </main>
</template>

<script>
    import axios from 'axios'

    const albumsUrl = 'https://jsonplaceholder.typicode.com/albums'

    export default {
        data () {
            return {
                albums: [],
                photos: [],
                errors: [],
                axiosTokenSources: []
            }
        },

        mounted: function () {
            this.getAlbums()
        },

        methods: {
            // Fetches all albums
            getAlbums () {
                let randomValue = Math.random()
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start('loadingdata.albums')

                axios.get(`${albumsUrl}?rand=${randomValue}`, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((album) => {
                            album.photos = []
                            this.albums.push(album)
                        })
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Albums. Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end('loadingdata.albums')
                    })
            },

            clear () {
                this.albums = []
                this.photos = []
                this.cancel()
            },

            cancel () {
                this.axiosTokenSources.forEach((source) => {
                    source.cancel()
                })
            },

            getPhotos (album) {
                let CancelToken = axios.CancelToken
                let source = CancelToken.source()
                this.axiosTokenSources.push(source)

                // start waiting
                this.$wait.start(`loadingdata.photos.album-${album.id}`)

                axios.get(`${albumsUrl}/${album.id}/photos?rand=${Math.random()}`, {responseType: 'stream', cancelToken: source.token})
                    .then(response => { // handle success
                        album.photos = response.data
                        response.data.forEach((photo) => this.photos.push(photo))
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Photos (albumId: ${album.id}). Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end(`loadingdata.photos.album-${album.id}`)
                    })
            },

            getAllPhotos () {
                this.albums.forEach((album) => {
                    if (album.id) {
                        this.getPhotos(album)
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
