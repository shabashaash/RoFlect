<template>
<div>
  <div v-show="!is_popup_visible">
    <MainImageLoader/>
  </div>
  <MainImageLoader v-if="is_popup_visible" :is-run-models="true"/>
  <div class="model-pool">
    <ArcFace/>
    <HumanPhone/>
    <SimSwap/>
  </div>
  <OutputCanvas/>
</div>

</template>

<script setup>
import { initStore } from "./store.js"
import {provide, readonly, ref} from "vue"
import MainImageLoader from './components/MainImageLoader.vue'
import ArcFace from './components/models/ArcFace.vue'
import HumanPhone from './components/models/HumanPhone.vue'
import SimSwap from './components/models/SimSwap.vue'
import OutputCanvas from './components/OutputCanvas.vue'
initStore();
const is_popup_visible = ref(false);
const updateis_popup_visible = (val)=>{
    is_popup_visible.value = val;
    console.log('updating_popup');
};

provide("is_popup_visible", readonly(is_popup_visible));
provide("updateis_popup_visible", updateis_popup_visible);
</script>

<style scoped>
.model-pool{
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
