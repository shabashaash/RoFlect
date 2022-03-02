<template>
  <div>
    <!-- session Loading and Initializing Indicator -->
    <v-status
      v-if="modelLoading || modelInitializing || sessionRunning"
      :modelLoading="modelLoading"
      :modelInitializing="modelInitializing"
      :sessionRunning="sessionRunning"
    ></v-status>

    <div>
      <!-- Utility bar to select session backend configs. -->
      <div class="select-container"
        style="margin: auto; width: 40%; padding: 30px; text-align:center;"
      >
        <div class="select-backend">Select Backend:</div>
        <select 
          v-model="sessionBackend"
          :disabled="modelLoading || modelInitializing || sessionRunning"
          label="Switch Backend"
          :menu-props="{ maxHeight: '750' }"
        >
        <option v-for="option in backendSelectList" :value="option.value" :key = "option">
            {{ option.text }}
        </option>
        </select>
      </div>
      <div class="error-message-container">
        <div
          v-if="modelLoadingError"
          style="padding-bottom: 30px"
          class="error-message"
        >
          Error: Current backend is not supported on your machine. Try Selecting
          a different backend.
        </div>
      </div>

      <!--<div class="image-panel elevation-1">
         model status 
        <div v-if="imageLoading || sessionRunning" class="loading-indicator">
          <vue-ellipse-progress :loading="true"/>
        </div>
         select input images 
        <div>
           input image 
          <div
            v-if="imageLoadingError"
            class="error-message"
            style="padding-top: 30px"
          >
            Error loading URL
          </div>
          <v-flex align-center justify-space-between class="canvas-container">
            <canvas
              id="input-canvas"
              :width="imageSize"
              :height="imageSize"
            ></canvas>
          </v-flex>
        </div>
      </div>-->
    </div>
    <div class="inference-time-class">
        <span class="inference-time">Inference Time: </span>
        <span v-if="inferenceTime> 0" class="inference-time-value">{{ inferenceTime.toFixed(1) }} ms </span>
        <span v-else></span>
    </div>
  </div>
</template>







<script>

import * as runModelUtilsONNX from './common/runModelONNX';
// import * as runModelUtilsTS from './common/runModelTS'
import * as runModelUtilsHuman from './common/runModelHuman';


// const bgTask = new Worker("./common/modelWebWorker.js", { type: "module" });



// function createInlineWorker(fn) {
//     let blob = new Blob(['self.onmessage = ', fn.toString()], { type: 'text/javascript' }); //type="javascript/worker" text/javascript
//     let url = URL.createObjectURL(blob);

//     return new Worker(url);
// }





// import { defineAsyncComponent } from 'vue';
// const AsyncmodelStatus = defineAsyncComponent(() =>
//   import('./modelStatus.vue')
// );


import VStatus from "./VStatus.vue";

// import { InferenceSession, Tensor } from "onnxruntime-web";
// process.on('uncaughtException', function(err){
//                     console.log('catched error',err);   
//                 })
import { ref, watch, onBeforeUnmount, inject, toRef, toRaw  } from 'vue';
// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }
export default{
    name:'ImageModel',
    props:{
        modelFilepath : {type:String},
        imageSize : {type:Number},
        preprocess : {type:Function},
        postprocess : {type:Function},
        warmup: {type:Function},
        // runModel : {type:Function},
        model_name : {type:String},
    },
    components:{
        VStatus
        // AsyncmodelStatus
    },
    setup(props){
        const sessionBackend = ref("wasm");
        const backendSelectList = ref([
            { text: "GPU-WebGL", value: "webgl" },
            { text: "CPU-WebAssembly", value: "wasm" },
        ]); //text: string; value: string
        const modelLoading = ref(true);
        const modelInitializing = ref(true);
        const modelLoadingError = ref(false);
        const sessionRunning = ref(false);
        const session = ref(undefined); //InferenceSession()
        const gpuSession = ref(undefined); //InferenceSession()
        const cpuSession = ref(undefined); //InferenceSession()
        const inferenceTime = ref(0);

        // const output = ref([]);

        const modelFile = ref(new ArrayBuffer(0));
        
        // const IsTF = toRef(props, 'IsTF');

        // const canvas_reload = inject('canvas_reload',false);

        const updatecanvas_reload = inject('updatecanvas_reload');
        const set_elem_functions_ = inject('set_elem_functions_');
        // const set_elem_glob_outputs = inject('set_elem_glob_outputs');

        // const add_elem_mr_f = inject('add_elem_mr_f');
        
        // const run_model = inject('run_model');
        // const updaterun_model = inject('updaterun_model');


        // async function created(){

        // }
        console.log(props.model_name,props.model_name.value,'istfval');
        

        (async () => {
            if (props.model_name.startsWith('tf')){
                const FilepathNR = toRef(props, 'modelFilepath');
                modelFile.value = FilepathNR.value;
            }
            else{
                const response = await fetch(props.modelFilepath);
                modelFile.value = await response.arrayBuffer();
            }

            console.log(modelFile.value,modelFile);
            try{
                // console.log(modelFile.value,'modelfile_val');
                await initSession();
            }
            catch(e){
                sessionBackend.value = "wasm";
            }
        })()
        
        

    


        async function initSession(){
            sessionRunning.value = false;
            modelLoadingError.value = false;
            if (sessionBackend.value === "webgl") {
            if (gpuSession.value) {
                console.log('gpu-preloaded');
                session.value = gpuSession.value;
                return;
            }
            modelLoading.value = true;
            modelInitializing.value = true;
            }
            if (sessionBackend.value === "wasm") {
            if (cpuSession.value) {
                console.log('cpu-preloaded');
                session.value = cpuSession.value;
                return;
            }
            modelLoading.value = true;
            modelInitializing.value = true;
            }
            try {
                if (props.model_name.startsWith('tf')){
                    if (sessionBackend.value === "webgl") {
                        gpuSession.value = await runModelUtilsHuman.createModelGpu(modelFile.value);
                        console.log('created-gpu');
                        console.log(gpuSession.value);
                        session.value = gpuSession.value;
                    } else if (sessionBackend.value === "wasm") {
                        cpuSession.value = await runModelUtilsHuman.createModelCpu(modelFile.value);
                        // console.log(res,'r');
                        // console.log(cpuSession.value, 'c1');
                        console.log('created-cpu');
                        session.value = cpuSession.value;
                        // console.log(session.value,'s1');
                        // console.log(cpuSession.value,'c2');
                    }
                    
                }
                else{
                    if (sessionBackend.value === "webgl") {
                        gpuSession.value = await runModelUtilsONNX.createModelGpu(modelFile.value);
                        console.log('created-gpu');
                        session.value = gpuSession.value;
                    } else if (sessionBackend.value === "wasm") {
                        cpuSession.value = await runModelUtilsONNX.createModelCpu(modelFile.value);
                        console.log('created-cpu');
                        session.value = cpuSession.value;
                    }
                }
                
            } catch (e) {
                console.log(e,'error',e.stack);
                console.log(e.message);
                console.error(e);
                
                modelLoading.value = false;
                modelInitializing.value = false;
                if (sessionBackend.value === "webgl") {
                    gpuSession.value = undefined;
                    console.log('gpuerr');
                } else {
                    cpuSession.value = undefined;
                    console.log('cpuerr');
                }
                throw new Error("Error: Backend (Loading) not supported. ");
            }
            modelLoading.value = false;
            console.log('stop loading');
            // warm up session with a sample tensor. Use setTimeout(..., 0) to make it an async execution so
            // that UI update can be done.
            // try {


           


            // var err = false;
            if (props.model_name.startsWith('tf')){
                if (sessionBackend.value === "webgl") {
                    console.log('warupwebglTS');
                    setTimeout(async () => {
                        try { 
                            // await runModelUtilsHuman.warmupModel(toRaw(session.value));
                            await props.warmup(toRaw(session.value));
                        } catch {
                            modelLoading.value = false;
                            modelInitializing.value = false;
                            gpuSession.value = undefined;

                            session.value = undefined;
                            modelLoading.value = false;
                            modelLoadingError.value = true;

                            console.log('CUSTOMERROR');
                            throw new Error("Error: Backend (Initial) not supported. ");
                        }
                        modelInitializing.value = false;
                    
                    }, 1000);
                    
                } else {
                    console.log('warmup-wasmTS');
                    setTimeout(async () => { 
                        try{ 
                            console.log(session.value,'s3inasync');
                            // await runModelUtilsHuman.warmupModel(toRaw(session.value));
                            await props.warmup(toRaw(session.value));
                            modelInitializing.value = false;
                        } catch {
                            modelLoading.value = false;
                            modelInitializing.value = false;
                            cpuSession.value = undefined;
                            
                            session.value = undefined;
                            modelLoading.value = false;
                            modelLoadingError.value = true;
                            
                            console.log('CUSTOMERROR');
                            // console.log(e);
                            throw new Error("Error: Backend (Initial) not supported. ");
                        }
                    }, 1000);
                }
            }
            else{
                if (sessionBackend.value === "webgl") {
                    console.log('warupwebgl');
                    setTimeout(async () => {
                        try { 
                            // await runModelUtilsONNX.warmupModel(session.value, [[
                            // 1,
                            // 3,
                            // props.imageSize,
                            // props.imageSize,
                            // ]]);
                            await props.warmup(session.value);
                        } catch  {
                            modelLoading.value = false;
                            modelInitializing.value = false;
                            gpuSession.value = undefined;

                            session.value = undefined;
                            modelLoading.value = false;
                            modelLoadingError.value = true;

                            console.log('CUSTOMERROR');
                            throw new Error("Error: Backend (Initial) not supported. ");
                        }
                        modelInitializing.value = false;
                    
                    }, 1000);
                    
                } else {
                    console.log('warmup-wasm');
                    setTimeout(async () => {
                         
                        try{
                            console.log(session.value,'s3inasync'); 
                            // await runModelUtilsONNX.warmupModel(session.value, [[
                            //     1,
                            //     3,
                            //     props.imageSize,
                            //     props.imageSize,
                            // ]]);
                            await props.warmup(session.value);
                            modelInitializing.value = false;
                        } catch {
                            modelLoading.value = false;
                            modelInitializing.value = false;
                            cpuSession.value = undefined;
                            
                            session.value = undefined;
                            modelLoading.value = false;
                            modelLoadingError.value = true;
                            
                            console.log('CUSTOMERROR');
                            throw new Error("Error: Backend (Initial) not supported. ");
                        }
                    }, 1000);
                }
            }
        }


        onBeforeUnmount(()=> {
            session.value = undefined;
            gpuSession.value = undefined;
            cpuSession.value = undefined;
        });


        //async
        async function runModel(inputs_){
            // const element = document.getElementById(
            // "input-canvas"
            // ) as HTMLCanvasElement;
            // const ctx = element.getContext("2d") as CanvasRenderingContext2D;


            console.log('IN RUN MODEL',props.model_name);
            

            // var conv_inputs = inputs_;

            // if(!props.model_name.startsWith('tf')){
            //     conv_inputs = imageDataRightFormat(inputs_.data);
            // }

            
            // var postprocessedData = null;
            var tensorOutput = null;
            // nextTick(async function() { 
            sessionRunning.value = true;
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const preprocessedData = props.preprocess(inputs_); //.data для onnx
            console.log(session.value, 'session');
            console.log(preprocessedData);
            
            // nextTick(async()=>{
            if (props.model_name.startsWith('tf')){
                //!!!!
                [tensorOutput, inferenceTime.value] = await runModelUtilsHuman.runModel(
                    toRaw(session.value),
                    preprocessedData
                );
                //!!!!
            }
            else{
                [tensorOutput, inferenceTime.value] = await runModelUtilsONNX.runModel(
                    session.value,
                    preprocessedData
                );
            }
            // });
            // [tensorOutput, inferenceTime.value] = out;

            console.log(tensorOutput,'TOUTPUT');//!!!!!!!!!!
            // await nextTick();
            const postprocessedData = await props.postprocess(tensorOutput); //!!!!!!!!!!!!!!
            // await nextTick();
            // if (props.model_name.startsWith('tf')){
            //     const postprocessedData = props.postprocess(tensorOutput);
            //     sessionRunning.value = false;
            // }

            // console.log(postprocessedData,'post_data'); //!!!!!!

            // output.value = postprocessedData;

            // });
            // sessionRunning.value = false;
            // await nextTick();
            sessionRunning.value = false;
            // await nextTick();
            return postprocessedData
            // return postprocessedData; //!!!!!!!!!!!!
        } 

        set_elem_functions_(props.model_name,runModel);
        // set_elem_glob_outputs(props.model_name, []);
        //     {
        //     // type_:props.model_name.value,
        //     // func_:runModel
        // }
        // );


        function clearAll(){
            // const element = document.getElementById(
            //     "input-canvas"
            // ) as HTMLCanvasElement;
            // if (element) {
            // const ctx = element.getContext("2d");
            //     if (ctx) {
            //         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            //     }
            // }
            

            updatecanvas_reload(true);

            



            console.log('inclearall');
            sessionRunning.value = false;
            inferenceTime.value = 0;

            // output.value = [];
        }

        watch(sessionBackend, async function(){
            clearAll();
            // sessionBackend.value = newVal;
            try {
                await initSession();
            } catch (e) {
                modelLoadingError.value = true;
            }
            // return newVal;
        });


        // watch(run_model, async function(){
        //    runModel();
        //    updaterun_model(true);
        // });

        
        return {
            sessionBackend:sessionBackend,
            backendSelectList:backendSelectList,
            modelLoading:modelLoading,
            modelInitializing : modelInitializing,
            modelLoadingError : modelLoadingError,
            sessionRunning : sessionRunning,
            // session : session,
            // gpuSession : gpuSession,
            // cpuSession : cpuSession,
            inferenceTime : inferenceTime,

            // output : output,

            // modelFile : modelFile,
            // initSession:initSession,
            // runModel:runModel,
            // canvas_reload:canvas_reload,
            // updatecanvas_reload:updatecanvas_reload
        }


    }
}


</script>



<style scoped>
/* .output-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
} */
.select-container{
    display: flex;
    align-items: center;
    justify-content: center;
}
.inference-time-class {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.inference-time-class .inference-time {
      text-align: center;
      /* width: 200px; */
      white-space: nowrap;
      text-overflow: ellipsis;
      font-family: sans-serif;
      font-size: 20px;
      color: black;
    }
.inference-time-class .inference-time-value {
    color: rgb(0, 119, 255);
    text-align: left;
    margin-left: 20px;
    font-family: sans-serif;
    font-size: 20px;
}
.error-message-container {
    display: flex;
}
.error-message-container .error-message{
    padding-bottom: 30px;
}
</style>