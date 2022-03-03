<template>
<div>
  <ImageModel
    :model-filepath="modelFilepath"
    :image-size="224"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :warmup="warmupModel"
    model-name = "SimSwap"
  />
</div>
</template>

<script setup>
import { ref } from 'vue'

import ImageModel from "../ImageModel.vue"
import * as runModelUtils from "../common/runModelONNX.js"

import resizeImageData from 'resize-image-data'
import { Tensor } from "onnxruntime-web"

const MODEL_FILEPATH_PROD = "./onnx_models/Swap_int64/true_visual_224_orig_opset13.onnx"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';
const MODEL_FILEPATH_DEV = "./onnx_models/Swap_int64/true_visual_224_orig_opset13.onnx"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';


const modelFilepath = ref();
modelFilepath.value = process.env.NODE_ENV === "production"
? MODEL_FILEPATH_PROD
: MODEL_FILEPATH_DEV;

async function warmupModel(session) {
  await runModelUtils.warmupModel(session, [[1, 3, 224, 224],[1,512]]);
}

function preprocess(data_in) {


  //WRAPAFFINE ВМЕСТО NEAREST RESIZE
  const scaled = resizeImageData(data_in[0],224,224,'bilinear-interpolation'); //nearest-neighbor (вообще должен быть кроп такого размера без ресайза + нужны афинные маски для того чтобы вставить обратно)
  // var norm_data = scaled.data;
  // let channel_step = 0;
  // for (let i = 0; i < scaled.length; i++) {
  //   norm_data[i] -= IN_MEAN[channel_step];
  //   norm_data[i] /= IN_STD[channel_step];
  //   if (i%(512*512) == 0 && i!=0){
  //     channel_step++;
  //     console.log(channel_step,i,'NORM_COUNTER_CHANNEL');
  //   }
  // }
  const r_data = runModelUtils.imageDataRightFormat(scaled.data, [224,224]); //image scaled.data

  return [new Tensor("float32", r_data, [
    1,
    3,
    224,
    224
  ]), data_in[1]];
}

function postprocess(tensor) {
  console.log('INSETUPSCRIPT');
  var data = new Uint8ClampedArray(224*224*4); //Uint8ClampedArray  ArrayBuffer
  // for (let i = 0; i < tensor.size; i+=4){
  //   data[i] = tensor.data[i]*255;
  // }
                                      /// cursor for RGBA buffer
  // var t = 0;                                   /// cursor for RGB buffer
  // for(var i = 0; i < 512*512*4; i += 4) {
  //   // console.log(tensor.data[t]);
  //   data[i] = tensor.data[t]*255;     /// copy RGB data to canvas from custom array
  //   data[i + 1] = tensor.data[t+1]*255;
  //   data[i + 2] = tensor.data[t+2]*255;
  //   data[i + 3] = 255;           /// remember this one with createImageBuffer
  //   t += 3;
  // }
  //1, 2, 0

  const [redArray, greenArray, blueArray] = new Array(new Array(), new Array(), new Array());
  for(let i = 0; i < 224*224; i++) {
    redArray.push(tensor.data[i]*255)          
  }
  for(let i = 224*224; i < 224*224*2; i++) {
    greenArray.push(tensor.data[i]*255)          
  }
  for(let i = 224*224*2; i < 224*224*3; i++) {
    blueArray.push(tensor.data[i]*255)          
  }
  // for(let i = 512*512*3; i < 512*512*4; i++) {
  //   AArray.push(tensor.data[i])          
  // }

  var t = 0;                                   /// cursor for RGB buffer
  for(let i = 0; i < 224*224*4; i+=4) {
    data[i] = redArray[t];     /// copy RGB data to canvas from custom array
    data[i + 1] = greenArray[t];
    data[i + 2] = blueArray[t];
    data[i + 3] = 255;           /// remember this one with createImageBuffer
    t += 1;
  }

  console.log(data,'uintdata');
  return data;
}
</script>