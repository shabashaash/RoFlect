<template>
<div>
  <div v-show="!is_popup_visible">
    <MainImageLoader/>
  </div>
  <MainImageLoader v-if="is_popup_visible" :isRunModels="true"/>
  <div class="model-pool">
    <ArcFace/>
    <HumanPhone/>
    <SimSwap/>
  </div>
  <!-- <canvas class="output"/> -->
  <OutputCanvas/>
</div>

</template>

<script>
import { initStore } from "./store.js";
// import { defineAsyncComponent } from 'vue';
import {provide, readonly, ref} from "vue";

import MainImageLoader from './components/v-main-image-loader.vue';

import ArcFace from './components/models/ArcFace.vue';
import HumanPhone from './components/models/HumanPhone.vue';
import SimSwap from './components/models/SimSwap.vue';

import OutputCanvas from './components/v-output-canvas.vue';

// const AsyncArcFace = defineAsyncComponent(() =>
//   import('./components/models/ArcFace.vue')
// );

// const AsyncHumanPhone = defineAsyncComponent(() =>
//   import('./components/models/HumanPhone.vue')
// );

// const AsyncSimSwap = defineAsyncComponent(() =>
//   import('./components/models/SimSwap.vue')
// );

export default {
  name: 'App',
  components: {
    MainImageLoader,
    ArcFace,
    HumanPhone,
    SimSwap,
    OutputCanvas
  },
  setup(){
    initStore();
    const is_popup_visible = ref(false);
    const updateis_popup_visible = (val)=>{
        is_popup_visible.value = val;
        console.log('updating_popup');
    };
    provide("is_popup_visible", readonly(is_popup_visible));
    provide("updateis_popup_visible", updateis_popup_visible);
    // return { is_popup_visible }
    return { is_popup_visible }
  }
}
</script>

<style>
.model-pool{
  text-align: center;
  /* vertical-align: middle; */
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
