<template>
<div class = "output-container">
    <canvas class="output"/>
</div>
</template>

<script setup>
import {watch, inject, onMounted, } from "vue"

const output_image = inject('output_image');
const glob_outputs = inject('glob_outputs');
var output_canvas_2d = undefined;

watch(()=>glob_outputs.value['SimSwap'],(newVal) => {
  if (newVal.input_data){
    output_canvas_2d.putImageData(newVal.input_data, newVal.x0, newVal.y0);
  }
}, {deep:true} );

watch(output_image,(newVal) => {
  console.log('IN WATCH OUTPUT IMAGE');
  console.log(newVal);
  if (newVal.input_data){
    output_canvas_2d.canvas.width = newVal.w;
    output_canvas_2d.canvas.height = newVal.h;
    output_canvas_2d.drawImage(newVal.input_data, 0, 0);
  }
});

onMounted(()=> {
  output_canvas_2d = document.getElementsByClassName('output')[0].getContext("2d");
});

</script>

<style scoped>
.output-container{
  margin-top:20px;
  position: relative;
  text-align: center;
  border: 1px #000000 solid;
}
.output-container .output{
  margin: 20px 20px 20px 20px;
}
</style>