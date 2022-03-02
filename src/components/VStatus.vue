<template>
  <div class="model-status-background">
    <div class="model-status">{{ messagecomputed }}</div>
    <ve-progress :loading="true" :size="25"/>
  </div>
</template>


<script>
import { computed } from 'vue'; //gonna ref the ctx

// import { veProgress } from "vue-ellipse-progress";

export default {
    name:'VStatus',
    components:{
        // veProgress 
    },
    props:{
        modelLoading:{
            type:Boolean
        },
        modelInitializing:{
            type:Boolean
        },
        sessionRunning:{
            type:Boolean
        }
    },
    setup(props){
        // const modelLoading = props.;
        // const modelInitializing = ref(false);
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
        return{
            messagecomputed:messagecomputed
        };
    }
}
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