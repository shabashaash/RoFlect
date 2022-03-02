import {InferenceSession, Tensor} from 'onnxruntime-web';
import * as ort from 'onnxruntime-web';



// const IN_MEAN = [0.485, 0.456, 0.406];
// const IN_STD = [0.229, 0.224, 0.225];


function init() {
    // env.wasm.simd = false;
    ort.env.wasm.numThreads = 4;
    ort.env.wasm.simd = true;
  //   ort.env.webgl.matmulMaxBatchSize = 0
  }
export async function createModelCpu(model){
    init();
    return await InferenceSession.create(model, {executionProviders: ['wasm']}); //, executionMode: "parallel"
}
export async function createModelGpu(model){
    init();
    return await InferenceSession.create(model, {executionProviders: ['webgl']});
}
export async function warmupModel(model, dims) {
    console.log(model,'modelinwarmuponnx');
    // OK. we generate a random input and call Session.run() as a warmup query
    // var warmupTensors = [];

    // if (dims.length == 1){
    //   dims = [dims];
    // }

    const feeds= {};
    for (var i = 0; i < dims.length; i++){
      const size = dims[i].reduce((a, b) => a * b);
      const warmupTensor = new Tensor('float32', new Float32Array(size), dims[i]);

      for (let i = 0; i < size; i++) {
          warmupTensor.data[i] = Math.random() * 2.0 - 1.0;  // random value [-1.0, 1.0)
      }
      console.log(warmupTensor,'wtensor');
      // warmupTensors.push(warmupTensor);
      feeds[model.inputNames[i]] = warmupTensor;
    }
    
    // const size = dims.reduce((a, b) => a * b);
    // const warmupTensor = new Tensor('float32', new Float32Array(size), dims);

    // for (let i = 0; i < size; i++) {
    //     warmupTensor.data[i] = Math.random() * 2.0 - 1.0;  // random value [-1.0, 1.0)
    // }

    try {
        // const feeds= {};
        // feeds[model.inputNames[0]] = warmupTensor;
        await model.run(feeds);
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
}






// export function imageDataRightFormat(image, dims) {
//   // 1. Get buffer data from image and create R, G, and B arrays.
//   var imageBufferData = image.bitmap.data;
//   const [redArray, greenArray, blueArray] = new Array(new Array<number>(), new Array<number>(), new Array<number>());

//   // 2. Loop through the image buffer and extract the R, G, and B channels
//   for (let i = 0; i < imageBufferData.length; i += 4) {
//     redArray.push(imageBufferData[i]);
//     greenArray.push(imageBufferData[i + 1]);
//     blueArray.push(imageBufferData[i + 2]);
//     // skip data[i + 3] to filter out the alpha channel
//   }

//   // 3. Concatenate RGB to transpose [224, 224, 3] -> [3, 224, 224] to a number array
//   const transposedData = redArray.concat(greenArray).concat(blueArray);

//   // 4. convert to float32
//   let i, l = transposedData.length; // length, we need this for the loop
//   // create the Float32Array size 3 * 224 * 224 for these dimensions output
//   const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
//   for (i = 0; i < l; i++) {
//     float32Data[i] = transposedData[i] / 255.0; // convert to float
//   }
//   // 5. create the tensor object from onnxruntime-web.
//   // const inputTensor = new Tensor("float32", float32Data, dims);
//   // return inputTensor;
// }








export async function runModel(model, preprocessedData){
    const start = new Date();
    try {
      const feeds = {};
      for(let i = 0; i<preprocessedData.length; i++){
        feeds[model.inputNames[i]] = preprocessedData[i];
      }
      console.log(feeds,'feeds');
      console.log('before_run');
      const outputData = await model.run(feeds);
      console.log('after_run');
      const end = new Date();
      const inferenceTime = (end.getTime() - start.getTime());
      console.log(inferenceTime,'time');


      console.log(outputData,'OUtput_datainFUNC');

      const output = outputData[model.outputNames[0]];
  
      return [output, inferenceTime];
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

export function imageDataRightFormat(imageBufferData, imageSize) {
    // 1. Get buffer data from image and create R, G, and B arrays.
    // var imageBufferData = image.bitmap.data;



    //resize nearest-neighbour
    // let pos = 0

    // for (let y = 0; y < imageSize[1]; y++) {
    //   for (let x = 0; x < imageSize[0]; x++) {
    //     const srcX = Math.floor(x * src.width / dst.width)
    //     const srcY = Math.floor(y * src.height / dst.height)

    //     let srcPos = ((srcY * src.width) + srcX) * 4

    //     dst.data[pos++] = src.data[srcPos++] // R
    //     dst.data[pos++] = src.data[srcPos++] // G
    //     dst.data[pos++] = src.data[srcPos++] // B
    //     dst.data[pos++] = src.data[srcPos++] // A
    //   }
    // }














    // console.log(imageBufferData);
    const [redArray, greenArray, blueArray] = new Array(new Array(), new Array(), new Array());


    // Imagenet scalars
    // mean 0.485, 0.456, 0.406
    // std 0.229, 0.224, 0.225


    // 2. Loop through the image buffer and extract the R, G, and B channels
    for (let i = 0; i < imageBufferData.length; i += 4) {
        redArray.push(imageBufferData[i]);
        greenArray.push(imageBufferData[i + 1]);
        blueArray.push(imageBufferData[i + 2]); 
        // skip data[i + 3] to filter out the alpha channel
    }
    
    // 3. Concatenate RGB to transpose [224, 224, 3] -> [3, 224, 224] to a number array
    const transposedData = redArray.concat(greenArray).concat(blueArray);
    // console.log(transposedData,'tData');
    // 4. convert to float32
    let i, l = transposedData.length; // length, we need this for the loop
    // console.log(redArray,'redARRAY');

    // let channel_step = 0;

    // create the Float32Array size 3 * 224 * 224 for these dimensions output
    const float32Data = new Float32Array(imageSize[0]*imageSize[1]*3);
    for (i = 0; i < l; i++) {
      float32Data[i] = transposedData[i] / 255.0; // convert to float

      // float32Data[i] -= IN_MEAN[channel_step];
      // float32Data[i] /= IN_STD[channel_step];

      // if (i%(imageSize[0]*imageSize[1]) == 0 && i!=0){
      //   channel_step++;
      //   console.log(channel_step,i,'NORM_COUNTER_CHANNEL');
      // }


    }
    // 5. create the tensor object from onnxruntime-web.
    // const inputTensor = new Tensor("float32", float32Data, dims);
    // return inputTensor;
    return float32Data;
}