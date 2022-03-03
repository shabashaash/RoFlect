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

<script setup lang="ts">
import { initStore } from "./store.js"
import {IsPopupVisibleKey} from "./symbols"
import {inject} from "vue"
import MainImageLoader from './components/MainImageLoader.vue'
import ArcFace from './components/models/ArcFace.vue'
import HumanPhone from './components/models/HumanPhone.vue'
import SimSwap from './components/models/SimSwap.vue'
import OutputCanvas from './components/OutputCanvas.vue'
initStore()
const is_popup_visible = inject(IsPopupVisibleKey)
</script>

<style scoped>
.model-pool{
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>