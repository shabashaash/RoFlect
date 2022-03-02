<template>
<div>
  <ImageModel
    :modelFilepath="modelFilepath"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :warmup="warmupModel"
    model_name = "tf_Human"
  ></ImageModel>
  <!-- <h1> {{modelFilepath}} </h1> -->
</div>
</template>



<script>
import ImageModel from "../ImageModel.vue";



// import { Tensor } from "onnxruntime-web"; //InferenceSession

import * as runModelUtilsHuman from "../common/runModelHuman.js";
const MODEL_FILEPATH_PROD = "blazeface-back.json"//"blazeface.json"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';
const MODEL_FILEPATH_DEV = "blazeface-back.json"//"blazeface.json"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';

import { ref } from 'vue';

export default{
    name:'HumanPhone',
    components:{
      ImageModel
    },
    setup(){
      const modelFilepath = ref('');
      modelFilepath.value = process.env.NODE_ENV === "production"
      ? MODEL_FILEPATH_PROD
      : MODEL_FILEPATH_DEV

      async function warmupModel(session) {
        await runModelUtilsHuman.warmupModel(session);
        // console.log(session);


        // return runModelUtils.warmupModel(session, [1, 3, 112, 112]);
      }

      function preprocess(data_in) {

        // const imageData = ctx.getImageData(
        //   0,
        //   0,
        //   ctx.canvas.width,
        //   ctx.canvas.height
        // );

        // const { data, width, height } = data_in;
        // const tensor_ = Float32Array.from({ length: width * height * 3 }, () => data);
        // return tensor_;
        // const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
        // const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
        //   1,
        //   3,
        //   width,
        //   height,
        // ]);
        // ops.assign(
        //   dataProcessedTensor.pick(0, 0, null, null),
        //   dataTensor.pick(null, null, 0)
        // );
        // ops.assign(
        //   dataProcessedTensor.pick(0, 1, null, null),
        //   dataTensor.pick(null, null, 1)
        // );
        // ops.assign(
        //   dataProcessedTensor.pick(0, 2, null, null),
        //   dataTensor.pick(null, null, 2)
        // );
        // const tensor = new Tensor("float32", new Float32Array(width * height * 3), [
        //   1,
        //   3,
        //   width,
        //   height,
        // ]);
        // (tensor.data as Float32Array).set(dataProcessedTensor.data);
        // return tensor;



        // return new Tensor("float32", tensor_, [
        //   1,
        //   3,
        //   width,
        //   height,
        // ]);
        return data_in;
      }



    //   async function runModel(model, preprocessedData){
    //     const start = new Date();
    //     try {
    //       const feeds = {};
    //       feeds[model.inputNames[0]] = preprocessedData;
    //       const outputData = await model.run(feeds);
    //       const end = new Date();
    //       const inferenceTime = (end.getTime() - start.getTime());
    //       const output = outputData[model.outputNames[0]];
      
    //       return [output, inferenceTime];
    //     } catch (e) {
    //       console.error(e);
    //       throw new Error();
    //     }
    // }




      async function postprocess(tensor) {
        // console.log(tensor);
        var bboxes = [];
        const faces = tensor.face;

        // console.log(faces);
        var counter = 0;
        faces.forEach(face => {
          // const h = face.box[3];
          // const w = face.box[2];


          // const wratio = Math.round(w/5);
          // const hratio = Math.round(h/5);


        //////!!!!!!!!!!!!!!



          // for (let key in face.annotations){
          //   if (face.annotations[key][0]){
          //     bboxes.push({
          //       x0:face.annotations[key][0][0],//Math.ceil(mesh[0]),// - wratio >= 0 ? face.box[0] - wratio : 0,
          //       y0:face.annotations[key][0][1],//Math.ceil(mesh[1]), //- hratio > 0 ? face.box[1] - hratio : 0,
          //       w: 20, //- face.box[0],
          //       h: 20//h + Math.round(hratio/2) //- face.box[1],
          //     });
          //   }
          // }


        ////!!!!!!!!!






          // face.annotations.forEach(mesh =>{
          //   bboxes.push({
          //     x0: Math.ceil(mesh[0]),// - wratio >= 0 ? face.box[0] - wratio : 0,
          //     y0:  Math.ceil(mesh[1]), //- hratio > 0 ? face.box[1] - hratio : 0,
          //     w: 20, //- face.box[0],
          //     h: 20//h + Math.round(hratio/2) //- face.box[1],
          //   });
          // });

          bboxes.push({
            x0: face.box[0],// - wratio >= 0 ? face.box[0] - wratio : 0,
            y0: face.box[1], //- hratio > 0 ? face.box[1] - hratio : 0,
            w: face.box[2], //- face.box[0],
            h: face.box[3],//h + Math.round(hratio/2) //- face.box[1],
            id : counter++,
          });
          console.log(face);
        });



        

        // tensor.face



        // return {
        //   type_:'Human',
        //   val:bboxes
        // }
        return bboxes;
      }



      return {
        modelFilepath:modelFilepath,
        warmupModel:warmupModel,
        preprocess:preprocess,
        postprocess:postprocess
      };

    }
    
}
</script>