<template>
    <main role="main" class="inner mb-auto bg-light text-dark shadow-none rounded p-3">
        <h3 class="mb-4">Photo Albums <small class="text-muted tiny">({{ albums.length }} items)</small></h3>

        <v-wait for="loading.albums">
            <template slot="waiting">
                <p class="color-animation">
                    Loading albums...
                </p>
            </template>
        </v-wait>

        <v-wait for="loading.photos.*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading photo infos ({{ photos.length }} items)...
                </p>
            </template>
        </v-wait>

        <v-wait for="loading.photo-*">
            <template slot="waiting">
                <p class="color-animation">
                    Loading graphic files ({{ photoGraphicFiles.length }} items)...
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
                <div class="color-animation" v-if="$wait.waiting(`loading.photos.album-${album.id}`)">
                    Loading photos...
                </div>
                <div class="row">
                    <figure class="col-sm-4" v-for="photo in album.photos" :key="photo.id">
                        <transition name="fade">
                            <img :src="photo.thumbnailUrl"
                                 v-show="photo.loaded"
                                 @load="loaded(photo)"
                                 class="img-fluid" />
                        </transition>
                        <div class="color-animation" v-if="$wait.waiting(`loading.photo-${photo.id}`)">
                            Loading photo image...
                        </div>
                        <figcaption class="small">{{ photo.title }}</figcaption>
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
                photoGraphicFiles: [],
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
                this.$wait.start('loading.albums')

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
                        this.$wait.end('loading.albums')
                    })
            },

            clear () {
                this.albums = []
                this.photos = []
                this.photoGraphicFiles = []
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
                this.$wait.start(`loading.photos.album-${album.id}`)

                axios.get(`${albumsUrl}/${album.id}/photos?rand=${Math.random()}`, {cancelToken: source.token})
                    .then(response => { // handle success
                        response.data.forEach((photo) => {
                            Object.assign(photo, {open: false, loaded: false})
                            this.photos.push(photo) // all photos (for counter)
                            album.photos.push(photo)
                            this.$wait.start(`loading.photo-${photo.id}`)
                        })
                    })
                    .catch(e => { // handle error
                        if (!axios.isCancel(e)) {
                            this.errors.push(`ERROR while get Photos (albumId: ${album.id}). Message: ${e.message}`)
                        }
                    })
                    .then(() => { // always executed
                        // stop waiting
                        this.$wait.end(`loading.photos.album-${album.id}`)
                    })
            },

            getAllPhotos () {
                this.albums.forEach((album) => {
                    if (album.id) {
                        this.getPhotos(album)
                    }
                })
            },

            loaded (img) {
                this.$wait.end(`loading.photo-${img.id}`)
                this.photoGraphicFiles.push(img) // all photo image files (for counter)
                img.loaded = true
            }
        },

        beforeRouteLeave (to, from, next) {
            this.clear()
            next()
        }
    }
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
</style>
