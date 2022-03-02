<template>
<div>
  <ImageModel
    :model-filepath="modelFilepath"
    :image-size="112"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :warmup="warmupModel"
    model-name = "ArcFace"
  />
</div>
</template>


<script setup>
import { ref } from 'vue'

import ImageModel from "../ImageModel.vue"
import * as runModelUtils from "../common/runModelONNX.js"

import { Tensor } from "onnxruntime-web"
import resizeImageData from 'resize-image-data'


const MODEL_FILEPATH_PROD = "./onnx_models/ArcFace_fix/arcFace_fromcheck.onnx";//"./onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';
const MODEL_FILEPATH_DEV = "./onnx_models/ArcFace_fix/arcFace_fromcheck.onnx";//"./onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';

const modelFilepath = ref();

modelFilepath.value = process.env.NODE_ENV === "production"
? MODEL_FILEPATH_PROD
: MODEL_FILEPATH_DEV;

async function warmupModel(session) {
  await runModelUtils.warmupModel(session, [[1, 3, 112, 112]]);
}

function preprocess(data_in) {
  //M = что то из этого ffhq_src = np.array([[192.98138, 239.94708], [318.90277, 240.1936], [256.63416, 314.01935],
                                    //  [201.26117, 371.41043], [313.08905, 371.15118]])
                                    // умноженное на crop_size/512 = 1
  //WRAPAFFINE BEFORE NEAREST RESIZE
  //crop должен быть 512 на 512 потом резайс на 112

  const data_in_224 = resizeImageData(data_in, 224, 224, 'bilinear-interpolation');//bilinear-interpolation
  // console.log(data_in_512,'512data');
  // var norm_data = data_in_512.data;
  // let channel_step = 0;
  // for (let i = 0; i < data_in_512.length; i++) {
  //   norm_data[i] -= IN_MEAN[channel_step];
  //   norm_data[i] /= IN_STD[channel_step];

  //   if (i%(512*512) == 0 && i!=0){
  //     channel_step++;
  //     console.log(channel_step,i,'NORM_COUNTER_CHANNEL');
  //   }
  // }
  // console.log(norm_data,'norm_data');

  const scaled = resizeImageData(data_in_224, 112, 112, 'nearest-neighbor'); //nearest-neighbor
  const r_data = runModelUtils.imageDataRightFormat(scaled.data, [112,112]); //DANGER?!

  console.log(r_data,'r_data');

  return [new Tensor("float32", r_data, [
    1,
    3,
    112,
    112,
  ])];
}

async function postprocess(tensor) {
  console.log(tensor,'POSTPROCESS');


  const L2 = Math.hypot.apply(null, tensor.data);
  const div_ = L2!=0?L2:0.0001;
  console.log(L2,'L2');
  const new_data = new Float32Array(tensor.size);

  for (let i = 0; i < tensor.size; i++) {
    new_data[i] = tensor.data[i] / div_;
  }

  return new Tensor("float32", new_data, [
    1,
    tensor.size
  ]);
}




</script>
