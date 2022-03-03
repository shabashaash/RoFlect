<template>
<div>
  <ImageModel
    :model-filepath="modelFilepath"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :warmup="warmupModel"
    model-name = "tf_Human"
  />
</div>
</template>

<script setup>
import { ref } from 'vue'

import ImageModel from "../ImageModel.vue"
import * as runModelUtilsHuman from "../common/runModelHuman.js"

const MODEL_FILEPATH_PROD = "blazeface-back.json"//"blazeface.json"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';
const MODEL_FILEPATH_DEV = "blazeface-back.json"//"blazeface.json"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';


const modelFilepath = ref('');
modelFilepath.value = process.env.NODE_ENV === "production"
? MODEL_FILEPATH_PROD
: MODEL_FILEPATH_DEV;

async function warmupModel(session) {
  await runModelUtilsHuman.warmupModel(session);
}

function preprocess(data_in) {
  return data_in;
}

function postprocess(tensor) {
  var bboxes = [];
  const faces = tensor.face;

  var counter = 0;
  faces.forEach(face => {
    bboxes.push({
      x0: face.box[0],// - wratio >= 0 ? face.box[0] - wratio : 0,
      y0: face.box[1], //- hratio > 0 ? face.box[1] - hratio : 0,
      w: face.box[2], //- face.box[0],
      h: face.box[3],//h + Math.round(hratio/2) //- face.box[1],
      id : counter++,
    });
    console.log(face);
  });
  return bboxes;
}


</script>