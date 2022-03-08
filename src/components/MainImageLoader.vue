<template>
<div class="upload-drag">
  <div class="upload">
    <div class = "text-center" v-bind="getRootProps()">
      <input v-bind="getInputProps()">
      <div :class="[isRunModels ? 'cont-sup' : '', 'cont-main']">
        <!-- <svg v-if="defaultImage" class="box-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43">
          <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z">
          </path>
        </svg> -->

        <canvas :class="[isRunModels ? 'img-cont-sup' : '', 'img-cont-main']"/> 


        <Vue3DraggableResizable v-for="item in tf_outputs" 
          v-model:x="item.x0"
          v-model:y="item.y0"
          :initW="item.w"
          :initH="item.h"
          v-model:w="item.w"
          v-model:h="item.h"
          :key="item.id"
          :style = "{'border': '1px #eb311f solid'}" 
          :parent="true" :draggable="true" :resizable="true"
          @dblclick="dbAction(item.x0, item.y0, item.w, item.h)"
        />
        
      </div>
      <p class = "drop-active" v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drag 'n' drop some files here, or click to select files</p>
      <div class="error-message-container" v-if="imageLoadingError">
        <div class="error-message">
          Cant load image, try selecting another one or check the internet connection.
        </div>
      </div>
    </div>
    <button class = "btn" @click="open">open</button>

    <button v-if="isRunModels" class = "close-btn" @click="updateis_popup_visible(false)">close</button>
  </div>
</div>
</template>

<script>
import {inject, onMounted, ref, watch } from 'vue' //,watch computed,toRaw,nextTick

import { useDropzone } from 'vue3-dropzone'
import loadImage from "blueimp-load-image"
import resizeImageData from 'resize-image-data';

import Vue3DraggableResizable from '@lzq920/vue3-draggable-resizable';
import '@lzq920/vue3-draggable-resizable/dist/Vue3DraggableResizable.css';



export default {
  name: 'MainImageLoader',
  components: {
    Vue3DraggableResizable
  },
  props:{
    isRunModels:{
      type: Boolean,
      default: false
    }
  },
  setup(props) {
      const canvas_reload  = inject('canvas_reload');
      const updatecanvas_reload = inject('updatecanvas_reload');
      const functions_ = inject('functions_');
      const glob_outputs = inject('glob_outputs');
      const updateis_popup_visible = inject('updateis_popup_visible');
      const set_elem_glob_outputs = inject('set_elem_glob_outputs');
      const clear_glob_outputs = inject('clear_glob_outputs');
      const updateoutput_image = inject('updateoutput_image');
      var context = undefined;
      var context_cont = undefined;
      var boxes_id = 0;
      const tf_outputs = ref([]);
      const imageLoadingError = ref(false);
      // const defaultImage = ref(true);
      

      onMounted(()=> {
        // defaultImage.value = false;
        context = document.getElementsByClassName(
            props.isRunModels?"img-cont-sup":"img-cont-main"
        )[0].getContext("2d");

        context_cont = document.getElementsByClassName(
            props.isRunModels?"cont-sup":"cont-main"
          )[0];
        // defaultImage.value = true;
        // updatecanvas_reload(true);
        // await loadImageToCanvas('images/dragdrop.png');
        drawDefault();
      });

      function drawDefault(){

        context.canvas.width = '50';
        context.canvas.height = '43';


        context_cont.style.width = '50px';
        context_cont.style.height = '43px';

        // var ctx = element.getContext('2d');

        context.clearRect(0, 0, '50', '43');

        context.strokeStyle = '#000';
        context.lineWidth = 1;
        context.fillStyle = '#000'

        var p = new Path2D("M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z");
        p.moveTo(100, 100);
        context.stroke(p);
        context.fill(p);
      }



      async function loadImageToCanvas(url) {
        if (!url) {
          // clearAll();
          console.log('no url');
          return;
        }
        imageLoadingError.value = false;
        // defaultImage.value = false;
        // console.log('before_load_image');
        try {
          var data = await loadImage(url, {
            maxWidth: 1200,
            maxHeight: 1200,
            cover: false,
            crop: false,
            canvas: true,
            crossOrigin: "Anonymous",
          });//await
        }
        catch (e){
          console.error(e);
          imageLoadingError.value = true;
          throw new Error("Cant load image, maybe there is a trouble with internet connection or try to use another image.");
        }

        // console.log('after_load_image'); 
        // console.log(data);

        var img = data.image;

        context.canvas.width = img.width;
        context.canvas.height = img.height;

        context_cont.style.width = img.width + 'px';
        context_cont.style.height = img.height + 'px';

        // console.log(element);

        // console.log(img.width,img.height);
        // if (element) {
          // const ctx = element.getContext("2d");
        if (context) {
          context.drawImage(img, 0, 0);
        }
          
        // }
        if (!props.isRunModels){
          updateoutput_image({w:img.width, h:img.height, input_data:img});
          // console.log('updating_context_new_image');
        }

        // console.log('here');      
    }

    async function onDrop(acceptFiles, rejectReasons) {


        await loadImageToCanvas(URL.createObjectURL(acceptFiles[0])); //await

        // const ctx = element.getContext("2d");
        
        const imageData = context.getImageData(
          0,
          0,
          context.canvas.width,
          context.canvas.height
        );
        var tf_outputs_loc = await functions_.value['tf_Human'](imageData);
        for (let i = 0; i < tf_outputs_loc.length; i++){
          tf_outputs_loc[i].id = boxes_id++;
        }
        tf_outputs.value = tf_outputs_loc;
        
        // console.log(functions_.value, 'outs');
        // if (rejectReasons != []){
        console.log(rejectReasons);
        // }
    }

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop, noClick:true, accept:"image/png,image/gif,image/jpeg,image/webp" });
        
    async function dbAction(x0,y0,w,h){
      // console.log('inDBACTION');
      // console.log(x0,y0,w,h);
      // const ctx = element.getContext("2d");
      const input_data = context.getImageData(x0,y0,w,h);
      if (props.isRunModels){
        const latent_id = await functions_.value['ArcFace'](input_data);

        // console.log(glob_outputs.value['tf_output'],'gloutclick');
        
        const val = await functions_.value['SimSwap']([glob_outputs.value['tf_output'].input_data, latent_id]);
        
        const swap_res_resized = resizeImageData(new ImageData(val, 224, 224), glob_outputs.value['tf_output'].w, glob_outputs.value['tf_output'].h, 'bilinear-interpolation');
        
        set_elem_glob_outputs('SimSwap', {
          input_data:swap_res_resized,
          x0:glob_outputs.value['tf_output'].x0,
          y0:glob_outputs.value['tf_output'].y0
        }); 

      }
      else{
        set_elem_glob_outputs('tf_output',{
          x0:x0,
          y0:y0,
          w:w,
          h:h, 
          input_data:input_data
        });
        // console.log('indbclick');
        updateis_popup_visible(true);
      }
    }

    watch(canvas_reload, (newVal) => {
      // console.log('inwatch');
      // console.log(canvas_reload.value);
      // console.log(newVal);
      // canvas_reload.value = newVal;
      if (newVal){
        // await loadImageToCanvas('images/dragdrop.png'); //await 
        // defaultImage.value = true;
        drawDefault();
        tf_outputs.value = [];
        boxes_id = 0;
        clear_glob_outputs();
        updatecanvas_reload(false);
        updateis_popup_visible(false);
        // updateoutput_image({w:0, h:0, input_data:img});
      }
    });


    return {
      getRootProps,
      getInputProps,
      tf_outputs,
      dbAction,
      updateis_popup_visible,
      // boxes_id,
      imageLoadingError,
      canvas_reload,
      // defaultImage,
      ...rest
    }
  },
}
</script>



<style scoped>
.upload-drag .upload .text-center canvas {
  max-width: 1200px;
  max-height: 1200px;
}



.upload-drag .upload .text-center .box-icon{
  z-index: 2;
  width: 100%;
  height: 80px;
  fill: #9294b3;
  display: block;
  margin-bottom: 40px;
  position: relative;
}


.cont-main{
  max-width: 1200px;
  max-height: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}


.cont-sup{
  background-color:rgb(255, 255, 255);
  /* border: 1px #000000 solid; */
}





.btn {
  margin: 0 .5rem;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 1px solid transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  padding: .5rem .75rem;
  font-size: 1rem;
  line-height: 1.25;
  border-radius: .25rem;
  transition: all .15s ease-in-out;
}

.close-btn {
  margin: 0 .5rem;
  color: #fff;
  background-color: #ff0000;
  border-color: #ff0000;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 1px solid transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  padding: .5rem .75rem;
  font-size: 1rem;
  line-height: 1.25;
  border-radius: .25rem;
  transition: all .15s ease-in-out;
  display: inline-block;
  margin-bottom: .5rem;
}

.upload-drag{
  z-index: 0;
  border: 1px #000000 solid;
}
.upload-drag .upload {
  text-align: center !important;
  padding: .5rem !important;
}
.upload-drag .upload .text-center {
  text-align: center !important;
  padding: .5rem !important;
  position: relative;
}
.upload-drag .upload .text-center .error-message-container {
    /* display: flex; */
  position: relative;
}
.upload-drag .upload .text-center .error-message-container .error-message{
    padding: 10px;
}
.btn {
  display: inline-block;
  margin-bottom: .5rem;
}

canvas {
  vertical-align: middle;
  border-style: none;
}

*, ::after, ::before {
  box-sizing: inherit;
}
</style>