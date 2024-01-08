<template>
  <helloworld :msg="'env:' + env_title"></helloworld>
</template>

<script setup lang="ts">
import helloworld from "./components/HelloWorld.vue";
const env_title = import.meta.env.VITE_APP_TITLE;
</script>

<style lang="scss" scoped></style>
