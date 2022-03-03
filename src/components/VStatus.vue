<template>
  <div class="model-status-background">
    <div class="model-status">{{ messagecomputed }}</div>
    <VeProgress :loading="true" :size="25"/>
  </div>
</template>
<script setup>
import { computed, defineProps } from 'vue'
import { VeProgress } from 'vue-ellipse-progress'

const props = defineProps({
  modelLoading:Boolean,
  modelInitializing:Boolean,
  sessionRunning:Boolean
});
const messagecomputed = computed(function(){
    if (props.modelLoading) {
        return "Loading model...";
    } else if (props.modelInitializing) {
        return "Loading model done. Initializing model...";
    } else if (props.sessionRunning) {
        console.log("RUNNIG MODEL");
        return "Running model...";
    } else {
        return "";
    }
});
</script>

<style scoped>
.model-status-background {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: 'white';
  opacity: 1;
  justify-content: center;
  text-align: center;
}
.model-status {
  padding: 30px;
  margin-top: 20px;
  font-size: 20px;
  color: 'blue';
  position: relative;
  top: 0px;
  opacity: 100;
  z-index: 5;
  display: center;
  margin: 0 auto;
}
</style>