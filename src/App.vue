<template>
  <div id="app" class="d-flex w-100 h-100 flex-column">
    <header class="masthead mb-auto">
      <div class="inner">
        <h3 class="masthead-brand">Demo</h3>
        <nav class="nav nav-masthead justify-content-center">
          <router-link to="/posts" class="nav-item nav-link">Posts</router-link>
        </nav>
      </div>
    </header>
    <main role="main" class="inner cover text-center">
      <router-view></router-view>
    </main>
    <footer class="mastfoot mt-auto text-center">
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
