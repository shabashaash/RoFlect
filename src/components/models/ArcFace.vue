<template>
<div>
  <image-model
    :modelFilepath="modelFilepath"
    :imageSize="112"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :warmup="warmupModel"
    model_name = "ArcFace"
  ></image-model>
  <!-- <h1> {{modelFilepath}} </h1> -->
</div>
</template>



<script>
import ImageModel from "../ImageModel.vue";
import { Tensor } from "onnxruntime-web"; //InferenceSession

import * as runModelUtils from "../common/runModelONNX.js";
const MODEL_FILEPATH_PROD = "./onnx_models/ArcFace_fix/arcFace_fromcheck.onnx";//"./onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';
const MODEL_FILEPATH_DEV = "./onnx_models/ArcFace_fix/arcFace_fromcheck.onnx";//"./onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort"//'../../assets/onnx_models/ArcFace_fix/updated_arcfaceresnet100-8.all.ort';

import { ref } from 'vue';


// import loadImage from "blueimp-load-image"
// import * as Jimp from "jimp"


import resizeImageData from 'resize-image-data';


// const IN_MEAN = [0.485, 0.456, 0.406];
// const IN_STD = [0.229, 0.224, 0.225];

export default{
    name:'ArcFace',
    components:{
      ImageModel
    },
    setup(){

      // const IN_MEAN = [0.485, 0.456, 0.406];
      // const IN_STD = [0.229, 0.224, 0.225];


      const modelFilepath = ref();
      modelFilepath.value = process.env.NODE_ENV === "production"
      ? MODEL_FILEPATH_PROD
      : MODEL_FILEPATH_DEV

      async function warmupModel(session) {
        await runModelUtils.warmupModel(session, [[1, 3, 112, 112]]);
      }

      function preprocess(data_in) {


        //M = что то из этого ffhq_src = np.array([[192.98138, 239.94708], [318.90277, 240.1936], [256.63416, 314.01935],
                                          //  [201.26117, 371.41043], [313.08905, 371.15118]])
                                          // умноженное на crop_size/512 = 1
        //WRAPAFFINE BEFORE NEAREST RESIZE

        //crop должен быть 512 на 512 потом резайс на 112

        // console.log(data_in,'arcface');




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

        console.log(scaled);

        // console.log(scaled,'scaled');


        // const scaled = loadImage.scale(data_in, // img or canvas element
        //   { maxWidth: 600 }
        // );
        // console.log(scaled);

        const r_data = runModelUtils.imageDataRightFormat(scaled.data, [112,112]); //DANGER?!



        

        console.log(r_data,'r_data');

        // const imageData = ctx.getImageData(
        //   0,
        //   0,
        //   ctx.canvas.width,
        //   ctx.canvas.height
        // );

        // console.log(data_in, 'input_data');
        // const { data, width, height } = data_in;
        // console.log('after_unpack',data, width, height);
        // const tensor_ = Float32Array.from({ length: width * height * 3 }, () => data);
        // console.log('tensor_not_conv');

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

        return [new Tensor("float32", r_data, [
          1,
          3,
          112,
          112,
        ])];


        // return data_in;

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
        console.log(tensor,'POSTPROCESS');


        const L2 = Math.hypot.apply(null, tensor.data);
        const div_ = L2!=0?L2:0.0001;
        console.log(L2,'L2');
        const new_data = new Float32Array(tensor.size);

        for (let i = 0; i < tensor.size; i++) {
          new_data[i] = tensor.data[i] / div_;
        }






        // console.log(L2!=0?L2:0.00001, 'choise');



        // console.log(tensor.data/L2);

        // tensor.data/=0.0001;//(L2!=0?L2:1e-12);


        // for(let i = 0; i < tensor.data.length; i++){
        //   tensor.data[i]
        // }
        // var data = tensor.data;


        // return {
        //   type_:'ArcFace',
        //   val:tensor
        // };
        return new Tensor("float32", new_data, [
          1,
          tensor.size
        ]);
        // return tensor;
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