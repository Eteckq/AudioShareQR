<template>
  <div class="h-screen w-screen bg-white flex items-center justify-center p-4">
    <NuxtPage />
  </div>
</template>

<style>
html {
  font-family: system-ui, -apple-system, sans-serif;
  height: 100%;
}
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow-x: hidden;
}
#__nuxt {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
