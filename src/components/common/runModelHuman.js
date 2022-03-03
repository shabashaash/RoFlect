import Human from '@vladmandic/human';

// import * as tf from '@tensorflow/tfjs';
// Adds the WASM backend to the global backend registry.
// import '@tensorflow/tfjs-backend-wasm';

// points to @vladmandic/human/dist/human.esm.js
// you can also force-load specific version
// for example: `@vladmandic/human/dist/human.esm-nobundle.js`




function init() {
    return {
        cacheSensitivity: 0,
        deallocate: false,
        cacheModels: true, //true
        async:true,
        debug:false,
        wasmPlatformFetch:true,
        warmup:'face',
        wasmPath:"./js/",
        modelBasePath:"./human_models/",
        // backend: 'cpu',
        // wasmPath: "../node_modules/@tensorflow/tfjs-backend-wasm/dist/",//"../../../public/js/",//'node_modules/@tensorflow/tfjs-backend-wasm/dist/*.wasm',
        gesture: {
            enabled: false,
        },
        face: {
            enabled: true,
            detector: {
              enabled:true,
              // modelPath: 'blazeface.json',
              maxDetected: 50,
              minConfidence: 0.5,
              iouThreshold: 0.1,
              rotation: true
              // return:true
            },
            mesh: { enabled: false },
            iris: { enabled: false },
            age: { enabled: false },
            gender: { enabled: false },
            emotion: { enabled: false },
            description: {
              enabled: false
            },
            mobilefacenet:{
              enabled:false
            }
        },
        body: {
            enabled: false
        },
        hand: {
        enabled: false
        }
        // filter:{
        //   enabled:true,
        //   equalization: false,
        //   width: 512,
        //   height: 512,
        // }
    }
}
export async function createModelCpu(model){

    // const human = new Human({ backend: 'cpu' });



    // const config = init();
    // config.modelBasePath = model;

    // const human = new Human(config);
    // await human.init();
    // console.log(human.tf.getBackend());
    // human.tf.setWasmPaths('./', true);
    // human.tf.setBackend('wasm');
    // await human.tf.ready();







    const config = init();
    config.backend = 'wasm';
    // console.log(model);
    // config.modelBasePath = model;
    config.face.detector.modelPath = model; //detector
    const human = new Human(config);



    console.log('before_init');

    await human.init();
    
    console.log('after_init');

    await human.load();

    console.log('after_load');
    // throw new Error("Error: Backend (Loading) not supported. ");
    return await human;

    //.catch(e=>{
      // console.log('inerr');
      // console.error(e);
      // throw new Error('Cant create wasmTF');
    // });

    // try{
    //   const human = new Human(config);
    //   // await human.init();
    //   console.log('before_init');

    //   // console.log(human.tf);

    //   // await human.tf.setWasmPaths('./', true);

    //   // await human.tf.setBackend('wasm');

    //   // await human.tf.ready();
      
    //   // human.tf.setBackend('wasm');
      
    //   await human.init();

    //   console.log('after_init');

    //   await human.load()//ERROR HERE



    //   // await human.tf.ready();

    //   console.log(human);

    //   return human;
    // } catch (e){
    //   console.log(e,'lalal');
    //   console.error(e);
    //   throw new Error('Cant create wasmTF');
    // }
    
    
    

    // const result = await human.detect(input);

}
export async function createModelGpu(model){
    const config = init();
    // config.modelBasePath = model;
    config.face.detector.modelPath = model; //detector
    config.backend = 'humangl';
    const human = new Human(config);
    await human.init();
    await human.load();
    return human;

    // const result = await human.detect(input);

}

export async function warmupModel(session) {
    console.log('lets try this');
    console.log(session);
    console.log(session,'modelinwarmuphuman');

    // console.log(session,'modelinwarmuphuman');
    try{
      await session.warmup();
    } catch (e) {
      console.error(e);
      throw new Error(e);
    } 


    // console.log();
    // OK. we generate a random input and call Session.run() as a warmup query
    // const size = dims.reduce((a, b) => a * b);
    // const warmupTensor = new Tensor('float32', new Float32Array(size), dims);

    // for (let i = 0; i < size; i++) {
    //     warmupTensor.data[i] = Math.random() * 2.0 - 1.0;  // random value [-1.0, 1.0)
    // }
    // try {
    //     const feeds= {};
    //     feeds[model.inputNames[0]] = warmupTensor;
    //     await model.run(feeds);
    // } catch (e) {
    //     console.error(e);
    //     throw new Error();
    // }
}

export async function runModel(model, preprocessedData){
  try{
    console.log(model,preprocessedData);
    const start = new Date();
    const output = await model.detect(preprocessedData);
    const end = new Date();
    const inferenceTime = (end.getTime() - start.getTime());
    return [output, inferenceTime];
  }
  catch(e){
    throw new Error("Error: Cant run model.");
  }


}