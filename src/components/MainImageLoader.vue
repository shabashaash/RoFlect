<template>

<!-- <FaceClicker   
  v-for="item in tf_outputs"
  :x0="item.x0+canv_left"
  :y0="item.y0+canv_top"
  :w="item.w"
  :h="item.h"
  :input_data = "item.input_data"
  :model_names="['ArcFace']"
  :key=item.id
/> -->
<!-- <div> -->
<div class="upload-drag">
  <!-- <FaceClicker
    v-for="item in tf_outputs"
    :x0="item.x0+canv_left"
    :y0="item.y0+canv_top"
    :w="item.w"
    :h="item.h"
    :input_data="item.input_data"
    :key=item.id
  /> -->
  <div class="upload">
    <div class = "text-center" v-bind="getRootProps()">
      <!-- <FaceClicker
        v-for="item in tf_outputs"
        :x0="item.x0+canv_left"
        :y0="item.y0+canv_top"
        :w="item.w"
        :h="item.h"
        :input_data="item.input_data"
        :key=item.id
      /> -->

      <!-- <FaceClicker
        v-for="item in tf_outputs"
        :x0="item.x0+canv_left"
        :y0="item.y0+canv_top"
        :w="item.w"
        :h="item.h"
        :key=item.id
      ></FaceClicker> -->



      <input v-bind="getInputProps()">



      <div :class="[isRunModels ? 'cont-sup' : '', 'cont-main']"> <!-- class = 'cont-main' :class="{'cont-sup':isRunModels}"  -->
        <canvas :class="[isRunModels ? 'img-cont-sup' : '', 'img-cont-main']"/> <!-- isRunModels ? 'img-cont-sup' : 'img-cont-main' --> <!-- class = 'img-cont-main' :class="{'img-cont-sup':isRunModels}" -->
        <!-- <FaceClicker
          v-for="item in tf_outputs"
          :x0="item.x0"
          :y0="item.y0"
          :w="item.w"
          :h="item.h"
          :input_data="item.input_data"
          :key=item.id
        /> -->



        <!-- <VueDragResize v-for="item in tf_outputs" 
          :x="item.x0"
          :y="item.y0"
          :w="item.w"
          :h="item.h"
          :key=item.id
          :style = "{'border': '1px #eb311f solid'}" 
          :preventActiveBehavior="true"
          :parentLimitation="true"
          :z="99999"
        /> -->










        <Vue3DraggableResizable class="clickable-face" v-for="item in tf_outputs" 
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
<!-- item.id -->
<!-- +update_on_image -->
      </div>
      <!-- v-on:dblclick="on_click"  -->
      
      <p class = "drop-active" v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drag 'n' drop some files here, or click to select files</p>
      <!-- <button class = "btn" @click="open">open</button> -->
    </div>
    <button class = "btn" @click="open">open</button>

    <button v-if="isRunModels" class = "close_btn" @click="updateis_popup_visible(false)">close</button>
  </div>
<!-- <canvas v-if="!isRunModels" class="output"/> -->
</div>



<!-- <FaceClicker   
  v-for="item in tf_outputs"
  :x0="item.x0+canv_left"
  :y0="item.y0+canv_top"
  :w="item.w"
  :h="item.h"
  :key=item.id
/> -->


<!-- <canvas v-if="!isRunModels" class="output"/> -->
<!-- </div> -->
<!-- ArcFace -->
</template>


<script>
// import FileUpload from 'vue-upload-component'
import {inject, onMounted, ref, watch } from 'vue' //,watch computed,toRaw,nextTick
import { useDropzone } from 'vue3-dropzone'
import loadImage from "blueimp-load-image"
// import Jimp from "jimp"




// import Vue3DraggableResizable from 'vue3-draggable-resizable';
// import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';

import Vue3DraggableResizable from '@lzq920/vue3-draggable-resizable';
import '@lzq920/vue3-draggable-resizable/dist/Vue3DraggableResizable.css';



import resizeImageData from 'resize-image-data';



// import VueDragResize from 'vue-drag-resize';




// export default defineComponent({
//   components: { Vue3DraggableResizable }
//   // ...other
// })




// import FaceClicker from './v-face-clicker.vue'

export default {
  name: 'MainImageLoader',
  components: {
    Vue3DraggableResizable

    // VueDragResize



    // FaceClicker,
    // "FaceClicker": defineAsyncComponent(() => import('./v-face-clicker.vue'))
  }, //setupcomponents
  props:{
    isRunModels:{
      type: Boolean,
      default: false
    }
    // model_names: {
    //   type: Array,
    //   default() {
    //     return []
    //   }
    // }
  },
  setup(props) {
      const canvas_reload  = inject('canvas_reload');
      const updatecanvas_reload = inject('updatecanvas_reload');

      const functions_ = inject('functions_');
      // const model_running = inject('model_running');
      // const set_elem_mr_o = inject('set_elem_mr_o');

      const glob_outputs = inject('glob_outputs');

      const updateis_popup_visible = inject('updateis_popup_visible');

      // const is_popup_visible = inject('is_popup_visible');

      const set_elem_glob_outputs = inject('set_elem_glob_outputs');


      // const push_elem_glob_outputs = inject('push_elem_glob_outputs');
      
      const clear_glob_outputs = inject('clear_glob_outputs');


      const updateoutput_image = inject('updateoutput_image');



      var element = undefined;
      var element_cont = undefined;
      // var output_context = 

      // if (!props.isRunModels){
      //   console.log('updating_context');
      //   updateoutput_image(output_context);
      // }
      // var output_context = undefined;
      
      // if (!props.isRunModels){
      //   updateoutput_image(output_context);
      // }

      // var final_context = document.createElement("canvas").getContext("2d");

      const boxes_id = ref(0);


      // var canv_top = ref(0);
      // var canv_left = ref(0);

      // var tf_outputs = [];
      
      
      // var tf_outputs = [];
      // // const outputs = toRaw(model_running.outputs);
      // watch(model_running.outputs, (newVal)=>{
      //   if (newVal.type_==='tf'){
      //     tf_outputs = newVal.val;
      //   }
      // });

      // const tf_outputs = computed(() => {
      //   const res = model_running.outputs.Human;
      //   console.log(res,'res');
      //   if (res != undefined){
      //     return res;
      //   }
      //   else{
      //     return [];
      //   }
      // });

      const tf_outputs = ref([]);


      onMounted(()=> {
        element = document.getElementsByClassName(
            props.isRunModels?"img-cont-sup":"img-cont-main"
        )[0];

        element_cont = document.getElementsByClassName(
            props.isRunModels?"cont-sup":"cont-main"
          )[0];
        // output_context = document.createElement("canvas").getContext("2d");
        // if (!props.isRunModels){
        //   updateoutput_image(output_context);
        // }
        // final_element = document.getElementsByClassName('output')[0];
       
      });

      // function getOffset(el) {
      //     var _x = 0;
      //     var _y = 0;
      //     while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
      //         _x += el.offsetLeft - el.scrollLeft;
      //         _y += el.offsetTop - el.scrollTop;
      //         el = el.offsetParent;
      //     }
      //     return { top: _y, left: _x };
      // }





      async function loadImageToCanvas(url) {
        if (!url) {
          // clearAll();
          console.log('no url');
          return;
        }

        // async function () {
        console.log('before_load_image');
        // var data = null;
        
        var data = await loadImage(url, {
          maxWidth: 1200,
          maxHeight: 1200,
          cover: false,
          crop: false,
          canvas: true,
          crossOrigin: "Anonymous",
        });//await



        // loadImage(url, (data, size) => {
        //   console.log('after_load_image');
        //   console.log(data);
        //   var img = data.image;
        //   element.width = img.width;
        //   element.height = img.height;
        //   element_cont.style.width = img.width + 'px';
        //   element_cont.style.height = img.height + 'px';
        //   console.log(element);
        //   console.log(img.width,img.height);
        //   if (element) {
        //     const ctx = element.getContext("2d");
        //     if (ctx) {
        //       ctx.drawImage(img, 0, 0);
        //     }
        //   }
        //   if (!props.isRunModels){
        //     updateoutput_image({w:img.width, h:img.height, input_data:img});
        //     console.log('updating_context_new_image');
        //   }
        //   console.log('here');
        // },
        // {
        //   maxWidth: 1200,
        //   maxHeight: 1200,
        //   cover: false,
        //   crop: false,
        //   canvas: true,
        //   crossOrigin: "Anonymous",
        // });


        // loadImage(url, {
        //   maxWidth: 1200,
        //   maxHeight: 1200,
        //   cover: false,
        //   crop: false,
        //   canvas: true,
        //   crossOrigin: "Anonymous",
        // })
        // .then(function (data) {
        //   console.log('after_load_image');
        //   console.log(data);
        //   var img = data.image;
        //   element.width = img.width;
        //   element.height = img.height;
        //   element_cont.style.width = img.width + 'px';
        //   element_cont.style.height = img.height + 'px';
        //   console.log(element);
        //   console.log(img.width,img.height);
        //   if (element) {
        //     const ctx = element.getContext("2d");
        //     if (ctx) {
        //       ctx.drawImage(img, 0, 0);
        //     }
        //   }
        //   if (!props.isRunModels){
        //     updateoutput_image({w:img.width, h:img.height, input_data:img});
        //     console.log('updating_context_new_image');
        //   }
        //   console.log('here');
        // })
        // .catch(function (err) {
        //   // Handling image loading errors
        //   console.log(err);
        // })













        console.log('after_load_image'); 
        console.log(data);
        // var data = await Jimp.read(url);
        // data = data.resize(1200,1200);
        // console.log(data,'data!!!');


        var img = data.image;

        // const img = data.bitmap;
        // const imageData = new ImageData(
        //   Uint8ClampedArray.from(img.data),
        //   img.width,
        //   img.height
        // );
        // const element = document.getElementsByClassName(
        //     "img-cont"
        //   )[0];
        element.width = img.width;
        element.height = img.height;

        // if (!props.isRunModels){
        //   console.log('updating_context_wh');
        //   output_context.width = img.width;
        //   output_context.height = img.height;
        //   console.log(output_context,'outcontext');
        // }


        element_cont.style.width = img.width + 'px';
        element_cont.style.height = img.height + 'px';


        // element_cont.width = img.width + 'px';
        // element_cont.height = img.height + 'px';

        // element_cont.width = img.width;
        // element_cont.height = img.height;
        

        


        // upload_image.value++;

        console.log(element);

        // try{
        //   var element_face = document.getElementsByClassName(
        //       "clickable-face"
        //   )[0];
        //   console.log("-------------------");
        //   console.log(element_face);
        //   console.log(element_face.limitProps);
        //   console.log("-------------------");
        // }
        // catch(e){
        //   console.log(e);
        // }

        // canv_top.value = getOffset(element).top;//element.getBoundingClientRect().top;//getOffset(element).top;
        // canv_left.value = getOffset(element).left;//element.getBoundingClientRect().left;//getOffset(element).left;



        // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        // const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // const pos = element.getBoundingClientRect(); //findPos(element);
        // canv_top.value = (pos.top + scrollTop)| 0; //element.getBoundingClientRect().top + scrollTop;//element.getBoundingClientRect().top;//getOffset(element).top;
        // canv_left.value = (pos.left + scrollLeft)| 0;


        // element_cont.style.left = canv_left.value+'px';
        // element_cont.style.top = canv_top.value+'px';




        // console.log(canv_top.value,canv_left.value,'left_top');


        console.log(img.width,img.height);
        if (element) {
          const ctx = element.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // ctx.putImageData(imageData, 0, 0);
          }
          
        }
        if (!props.isRunModels){
          // const ctx = final_element.getContext("2d");
          // if (output_context) {
          //   output_context.getContext("2d").drawImage(img, 0, 0);
          //   // ctx.putImageData(imageData, 0, 0);
          // }
          updateoutput_image({w:img.width, h:img.height, input_data:img});
          console.log('updating_context_new_image');
        }
        // update_on_image.value++;

          // document.body.appendChild(data.image)
        // }



        console.log('here');
      // this.imageLoading = true;
      
    }






    async function onDrop(acceptFiles, rejectReasons) {
        // console.log(URL.createObjectURL(acceptFiles[0]));
        
        await loadImageToCanvas(URL.createObjectURL(acceptFiles[0])); //await
        





        const ctx = element.getContext("2d");
        
        const imageData = ctx.getImageData(
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height
        );
        // final_image = imageData;
        console.log(imageData,'imageData');

        

        // for (var i = 0; i < functions_.length; i++){
        //   console.log(functions_[i]);
        //   const val = await functions_[i].func_(imageData);
        //   // tf_outputs = val;

        //   console.log(val);


        //   // set_elem_mr_o(type_, val);
        // }


// update_on_image
        //DETECT FACES
        

        var tf_outputs_loc = await functions_['tf_Human'](imageData);
        // var tf_outputs_loc = null;
        // functions_['tf_Human'](imageData).then((res)=>{
        //   console.log(res,'IMINRESS');
        //   tf_outputs_loc = res;
        // });

        // nextTick(function() {
        //   setTimeout(() => {
        //     var tf_outputs_loc = functions_['tf_Human'](imageData);
        //     for (let i = 0; i < tf_outputs_loc.length; i++){
        //       tf_outputs_loc[i].id = boxes_id.value++;
        //     }
        //     tf_outputs.value = tf_outputs_loc;
        //   }, 100);
        // });

        // var 
        //!!!!!!!!!!!!!!!!!!!!!!!!!
        // let tf_promise = new Promise((resolve) => {
        //     resolve(functions_['tf_Human'](imageData));
        // });

        // let tf_promise = functions_['tf_Human'](imageData);

        // tf_promise.then(res=>{
        //   // let tf_outputs_loc
        //   console.log(res,'res_lookatme');
        //   let tf_outputs_loc = res;
        //   for (let i = 0; i < tf_outputs_loc.length; i++){
        //     tf_outputs_loc[i].id = boxes_id.value++;
        //   }
        //   tf_outputs.value = tf_outputs_loc;
        // }); 
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //tf_outputs.value     AWAIT

        // console.log(toRaw(tf_outputs.value));


        // set_elem_glob_outputs('tf_first', await functions_['tf_Human'](imageData));




        // console.log(tf_outputs_loc);
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        for (let i = 0; i < tf_outputs_loc.length; i++){
          tf_outputs_loc[i].id = boxes_id.value++;


        //   // const tf_out_loc = toRaw(
        //   // console.log(tf_outputs_loc[i].x0,tf_outputs_loc[i].y0,tf_outputs_loc[i].w,tf_outputs_loc[i].h, 'OUTPUTS?');


        //   tf_outputs_loc[i].input_data = ctx.getImageData(
        //     tf_outputs_loc[i].x0,
        //     tf_outputs_loc[i].y0,
        //     tf_outputs_loc[i].w,
        //     tf_outputs_loc[i].h
        //     // 0,
        //     // 0,
        //     // ctx.canvas.width,
        //     // ctx.canvas.height
        //   );

        //   // ctx.putImageData(tf_outputs_loc[i].input_data,0,0);


        }
        tf_outputs.value = tf_outputs_loc;
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!













        // for (const key of props.model_names) {
        //   console.log(functions_[key],key,'incicle');
        //   const val = await functions_[key](imageData);
        //   if (key.startsWith('tf')){
        //     console.log('IN TFFFFFFFFFF');
        //     tf_outputs.value = val;
        //   }
        //   else{
        //     set_elem_glob_outputs(key, val);
        //   }
        // }




        console.log(functions_, 'outs');
        // console.log(glob_outputs);
        // console.log(tf_outputs.value);

        // this.sessionRunning = true;
        // this.output = [];
        // this.inferenceTime = 0;
        // // session predict
        // this.$nextTick(function () {
        //   setTimeout(() => {
        //     this.runModel();
        //   }, 10);
        // });


        // console.log(acceptFiles);
        console.log(rejectReasons);
        // upload_image.value = false;
    }




    

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop, noClick:true, accept:"image/png,image/gif,image/jpeg,image/webp" });
    
    (async () => {
      await loadImageToCanvas('images/dragdrop.png'); //await 
    })()
    
    // loadImageToCanvas('images/dragdrop.png');
    
    

    // if (canvas_reload.value) {
    //   console.log('canvas_reload');
    //   loadImageToCanvas('images/dragdrop.png');
    // }

    async function dbAction(x0,y0,w,h){
      console.log('inDBACTION');
      console.log(x0,y0,w,h);
      const ctx = element.getContext("2d");
      const input_data = ctx.getImageData(x0,y0,w,h);
      if (props.isRunModels){
        // var latent_id = null;
        // nextTick(async function(){
        const latent_id = await functions_['ArcFace'](input_data);
        // });
        // const latent_id = await functions_['ArcFace'](input_data);

        // await nextTick();
        console.log(glob_outputs['tf_output'],'gloutclick');
        // var val = null;
        // nextTick(async function(){
        const val = await functions_['SimSwap']([glob_outputs['tf_output'].input_data, latent_id]);
        // });
        const swap_res_resized = resizeImageData(new ImageData(val, 224, 224), glob_outputs['tf_output'].w, glob_outputs['tf_output'].h, 'bilinear-interpolation');
        // if (output_context){
          // const ctx = output_context.getContext("2d");
          // console.log(ctx,'AAAAAAAAAAAAAAAAAAAACTXAAAAAAAAAAAAAAAAA');
          // ctx.putImageData(
          //   swap_res_resized,
          //   glob_outputs['tf_output'].x0,
          //   glob_outputs['tf_output'].y0
          // );
          // updateoutput_image(output_context);
        // }
        set_elem_glob_outputs('SimSwap', {
          input_data:swap_res_resized,
          x0:glob_outputs['tf_output'].x0,
          y0:glob_outputs['tf_output'].y0
        }); //push_elem_glob_outputs
        // console.log(glob_outputs['SimSwap']);
      }
      else{
        set_elem_glob_outputs('tf_output',{
          x0:x0,
          y0:y0,
          w:w,
          h:h, 
          input_data:input_data
        });
        console.log('indbclick');
        updateis_popup_visible(true);
      }
    }

    // watch(()=>glob_outputs['SimSwap'], 
    //   async (val)=>{
    //     console.log(val,'VALLLLLLLLLL!!!!!!!');
    //     if (val.length != 0){
    //       console.log('SimSwapWATCHEFFECT');
    //       console.log(val);
    //       // console.log(new Blob( [ val['SimSwap'].buffer ], { type: "image/bmp" } ));
          
    //       const imageData = new ImageData(val[val.length-1], 224, 224);

    //       var out_elem = document.getElementsByClassName('output')[0];
    //       out_elem.width = imageData.width;
    //       out_elem.height = imageData.height;
    //       // element.width = imageData.width;
    //       // element.height = imageData.height;
    //       const ctx = out_elem.getContext("2d"); //out_elem
    //       ctx.putImageData(imageData, 0, 0);
          
    //       // const url = URL.createObjectURL(imageData); //{ type: "image/jpeg" }

    //       console.log(imageData);

    //       // try{
    //       //   await loadImageToCanvas(url);
    //       // }
    //       // catch(e){
    //       //   console.log(e);
    //       // }
    //   }
    //   // var url = URL.createObjectURL(new Blob( [ rawArr ], { type: "image/png" } ));
    //   // console.log(url,'png_from_output');
    // },
    // { deep: true }
    // );




    watch(canvas_reload, async (newVal) => {
      console.log('inwatch');
      console.log(canvas_reload.value);
      console.log(newVal);
      // canvas_reload.value = newVal;
      if (newVal){
        await loadImageToCanvas('images/dragdrop.png'); //await 

        // for (const key of glob_outputs) { 
        //   set_elem_glob_outputs(key, []);
        // }
        // set_elem_glob_outputs('tf_first', []);


        tf_outputs.value = [];
        boxes_id.value = 0;
        clear_glob_outputs();
        updatecanvas_reload(false);



        // const element = document.getElementsByClassName(
        //     "img-cont"
        // )[0];
        // console.log(element,'1');
        // if (element) {
        //   console.log(element,'2');
        // const ctx = element.getContext("2d");
        //     if (ctx) {
        //         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        //     }
        // }
      }
      // return newVal;
    });
    // boxes_id


    return {
      getRootProps,
      getInputProps,
      tf_outputs,
      // tf_outputs_loc,
      // canv_top,
      // canv_left,
      dbAction,
      updateis_popup_visible,
      boxes_id,
      ...rest
    }
  },
  // data() {
  //   return {
  //     files: [],
  //   }
  // },
  // mounted(){
  // },
  // methods: {
  // }
}
</script>



<style scoped>
/* .upload-drag .myclassclickercmn * {
  z-index:2;
}  */
.upload-drag .upload .text-center canvas {
  max-width: 1200px;
  max-height: 1200px;
  /* z-index: v-bind('z_index'); */
  /* position:absolute; */
  /* position: relative; */
}

.cont-main{
  max-width: 1200px;
  max-height: 1200px;
  /* vertical-align: middle; */
  /* border-style: none; */
  margin-left: auto;
  margin-right: auto;   
  /* z-index: 2; */
  position: relative;
  /* text-align: center !important; */
  /* position: relative; */
  /* z-index:1; 
  /* position:absolute; */
}


.cont-sup{
  /* max-width: 1200px;
  max-height: 1200px;
  margin-left: auto;
  margin-right: auto;   
  position: relative; */
  background-color:rgb(255, 255, 255);
  border: 1px #000000 solid;
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

.close_btn {
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

.upload-drag .upload .text-center {
  text-align: center !important;
  padding: .5rem !important;
  position: relative;




  /* align-items: center;
  justify-content: center;
  vertical-align: middle; */
}
.upload-drag .upload {
  text-align: center !important;
  padding: .5rem !important;
  /* z-index: 0; */
  /* border: 1px #000000 solid; */
}
.upload-drag{
  z-index: 0;
  border: 1px #000000 solid;
}
.btn {
  display: inline-block;
  margin-bottom: .5rem;
}

/* .upload-drag .upload .text-center .clickable-face{
  text-align: start !important;
} */

canvas {
  vertical-align: middle;
  border-style: none;
}

*, ::after, ::before {
  box-sizing: inherit;
}
</style>