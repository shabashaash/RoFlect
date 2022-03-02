<template>
<div class = "output-container">
    <canvas class="output"/>
</div>
</template>

<script setup>
import {watch, inject, onMounted, toRaw} from "vue"

const output_image = inject('output_image');
const glob_outputs = inject('glob_outputs');
var output_canvas_2d = undefined;

watch(()=>glob_outputs['SimSwap'],(newVal) => {
  const val_raw = toRaw(newVal);
  console.log(val_raw);
  console.log('IN WATCH SimSwap');
  if (Object.keys(val_raw).length != 0){
    const {x0, y0, input_data} = val_raw;
    output_canvas_2d.putImageData(input_data, x0, y0);
  }
}, {deep:true} );

watch(output_image,(newVal) => {
  console.log('IN WATCH OUTPUT IMAGE');
  console.log(newVal.value);
  if (Object.keys(newVal.value).length != 0){
    const {w, h, input_data} = newVal.value;
    output_canvas_2d.canvas.width = w;
    output_canvas_2d.canvas.height = h;
    output_canvas_2d.drawImage(input_data, 0, 0);
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