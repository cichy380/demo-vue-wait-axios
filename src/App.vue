<template>
  <div id="app" class="d-flex w-100 h-100 flex-column">
    <header class="masthead mb-4">
      <div class="inner">
        <h3 class="masthead-brand"><router-link to="/">Demo</router-link></h3>
        <nav class="nav nav-masthead justify-content-center">
          <router-link to="/posts" class="nav-item nav-link">Posts</router-link>
          <router-link to="/todos" class="nav-item nav-link">Todos</router-link>
        </nav>
      </div>
    </header>

    <v-wait for="loadingdata.*">
      <template slot="waiting">
        <div class="floating-message floating-message--animation">
          Loading data...
        </div>
      </template>
    </v-wait>

    <router-view></router-view>

    <footer class="mastfoot mt-4 text-center">
      <div class="inner">
        <p>Cover template for <a href="https://getbootstrap.com/">Bootstrap</a>.</p>
      </div>
    </footer>
  </div>
</template>

<script>
    export default {
        name: 'App'
    }
</script>
