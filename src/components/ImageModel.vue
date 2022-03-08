<template>
  <div>
    <VStatus
      v-if="modelLoading || modelInitializing || sessionRunning"
      :modelLoading="modelLoading"
      :modelInitializing="modelInitializing"
      :sessionRunning="sessionRunning"
    />
    <div class="static-container">
        <div class = "modelname">
            {{modelName}}
        </div>
      <div class="select-container">
        <div class="select-backend">Select Backend</div>
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
      <div class="error-message-container" v-if="modelLoadingError">
        <div class="error-message">
          Error: Current backend is not supported on your machine. Try selecting
          a different backend or refreshing the page.
        </div>
      </div>
      <div class="error-message-container" v-if="modelRunningError">
        <div class="error-message">
          Error: Model is not loaded. Wait or check your internet connection. Please be aware what the model file size can be ~300Mb.
        </div>
      </div>
    </div>
    <div class="inference-time-container">
        <span class="inference-time">Inference Time: </span>
        <span v-if="inferenceTime> 0" class="inference-time-value">{{ inferenceTime.toFixed(1) }} ms </span>
        <span v-else></span>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, onBeforeUnmount, inject, defineProps, onMounted  } from 'vue' //toRef toRaw nextTick

import * as runModelUtilsONNX from './common/runModelONNX'
import * as runModelUtilsHuman from './common/runModelHuman'

import VStatus from "./VStatus.vue"


const props = defineProps({
    modelFilepath : String,
    imageSize : Number,
    preprocess : Function,
    postprocess : Function,
    warmup: Function,
    modelName : String
});

const sessionBackend = ref("wasm");
const backendSelectList = ref([
    { text: "GPU-WebGL", value: "webgl" },
    { text: "CPU-WebAssembly", value: "wasm" },
]); //text: string; value: string
const modelLoading = ref(true);
const modelInitializing = ref(false);
const modelLoadingError = ref(false);
const modelRunningError = ref(false);
const sessionRunning = ref(false);

var session = undefined; //InferenceSession()
var gpuSession = undefined; //InferenceSession()
var cpuSession = undefined; //InferenceSession()
// var modelFile = undefined;


// var modelFile_loc = undefined;


const inferenceTime = ref(0);
//ref(new ArrayBuffer(0));
const updatecanvas_reload = inject('updatecanvas_reload');
const set_elem_functions_ = inject('set_elem_functions_');
// const push_init_conveer = inject('push_init_conveer');

// const manager_worker = inject('manager_worker');

// manager_worker.value.onmessage = async function(e) {
//     const sessions = e.data.models;
    
//     sessions.forEach(sess => {
//         if (sess.modelName == props.modelName){
//             cpuSession = sess.session;
//             session = cpuSession;
//         }
//     });
//     //add error handler;
//     await warmUp();
// };



watch(sessionBackend, async function(){
    clearAll();
    try {
        await initSession();
    } catch (e) {
        modelLoadingError.value = true;
    }
});
onMounted(async ()=>{
    // if (props.modelName.startsWith('tf')){
    //     // const FilepathNR = toRef(props, 'modelFilepath');
        
    //     modelFile = props.modelFilepath;//FilepathNR.value;

    // }
    // else{
    // modelFile = props.modelFilepath;




        // const response = await fetch(props.modelFilepath);
        // modelFile = await response.arrayBuffer();





        // const response_loc = await fetch("./onnx_models/Swap_int64/true_visual_224_orig_opset13_quant.onnx");
        // modelFile_loc = await response_loc.arrayBuffer();


    // }

    // console.log(modelFile,modelFile);
    try{
        // console.log(modelFile.value,'modelfile_val');
        await initSession();
    }
    catch(e){
        sessionBackend.value = "wasm";
    }
});
onBeforeUnmount(()=> {
    session = undefined;
    gpuSession = undefined;
    cpuSession = undefined;
});

async function initSession(){
    sessionRunning.value = false;
    modelLoadingError.value = false;
    if (sessionBackend.value === "webgl") {
        if (gpuSession) {
            console.log('gpu-preloaded');
            session = gpuSession;
            return;
        }
    }
    if (sessionBackend.value === "wasm") {
        if (cpuSession) {
            console.log('cpu-preloaded');
            session = cpuSession;
            return;
        }
    
    // console.log(modelLoading.value, 'MODELLOADING');
    
    }
    modelLoading.value = true;
    
    // setTimeout(() => {
    try {
        if (props.modelName.startsWith('tf')){
            if (sessionBackend.value === "webgl") {

                // push_init_conveer(runModelUtilsHuman.createModelGpu(modelFile));

                
                gpuSession = await runModelUtilsHuman.createModelGpu(props.modelFilepath);
                // console.log('created-gpu');
                // console.log(gpuSession.value);
                session = gpuSession;
                // await warmUp();
            } else if (sessionBackend.value === "wasm") {

                // push_init_conveer(runModelUtilsHuman.createModelCpu(modelFile));

                cpuSession = await runModelUtilsHuman.createModelCpu(props.modelFilepath);
                // console.log('created-cpu');
                session = cpuSession;
                // await warmUp();
            }
        }
        else{
            if (sessionBackend.value === "webgl") {

                // push_init_conveer(runModelUtilsONNX.createModelGpu(modelFile));

                gpuSession = await runModelUtilsONNX.createModelGpu(props.modelFilepath);
                // console.log('created-gpu');
                session = gpuSession;
                // await warmUp();
            } else if (sessionBackend.value === "wasm") {

                // push_init_conveer(runModelUtilsONNX.createModelCpu(modelFile));
                // setTimeout( () => {

                cpuSession = await runModelUtilsONNX.createModelCpu(props.modelFilepath);

                // manager_worker.value.postMessage({
                //     "modelFile": modelFile,
                //     "modelName": props.modelName
                // });

                // const cpu_session_loc = await runModelUtilsONNX.createModelCpu(modelFile_loc);
                // console.log(cpu_session_loc, 'HEY BRO NICE TITS');


                // }, 1000);
                
                // console.log('created-cpu');
                session = cpuSession;
            }
        }
        modelLoading.value = false;
    } catch (e) {
        // console.log(e,'error',e.stack);
        // console.log(e.message);
        console.error(e);
        
        modelLoading.value = false;
        modelInitializing.value = false;
        modelLoadingError.value = true;
        if (sessionBackend.value === "webgl") {
            gpuSession = undefined;
            // console.error('gpuerr');
        } else {
            cpuSession = undefined;
            // console.error('cpuerr');
        }
        throw new Error("Error: Backend (Loading) not supported. ");
    }
    // }, 1000);

    modelInitializing.value = true;
    try { 
        await props.warmup(session);
    } catch {
        // modelLoading.value = false;
        modelInitializing.value = false;
        modelLoadingError.value = true;

        if (sessionBackend.value === "webgl"){
            gpuSession = undefined;
        }
        else{
            cpuSession = undefined;
        }
        session = undefined;
        // console.log('CUSTOMERROR');
        throw new Error("Error: Backend (Initial) not supported. ");
    }
    modelInitializing.value = false;
    // console.log('stop loading');
    // console.log(session);
    // console.log(session,modelFile,'CHECKMEEE');
}
// async function warmUp(){
//     // setTimeout(async () => {
//         try { 
//             await props.warmup(session);
//         } catch {
//             modelLoading.value = false;
//             modelInitializing.value = false;
//             modelLoadingError.value = true;

//             if (sessionBackend.value === "webgl"){
//                 gpuSession = undefined;
//             }
//             else{
//                 cpuSession = undefined;
//             }
//             session = undefined;
//             console.log('CUSTOMERROR');
//             throw new Error("Error: Backend (Initial) not supported. ");
//         }
//         modelInitializing.value = false;
//     // }, 1000);
// }

async function runModel(inputs_){
    modelRunningError.value = false;

    if (modelLoadingError.value || modelLoading.value){
        modelRunningError.value = true;
        throw new Error("Model is not loaded cant run."); 
    }

    // console.log('IN RUN MODEL',props.modelName);
    var tensorOutput = null;
    sessionRunning.value = true;
    // await new Promise(resolve => setTimeout(resolve, 100));
    
    const preprocessedData = props.preprocess(inputs_); //.data для onnx
    // console.log(session, 'session');
    // console.log(preprocessedData);
    
    if (props.modelName.startsWith('tf')){

        [tensorOutput, inferenceTime.value] = await runModelUtilsHuman.runModel(
            session,
            preprocessedData
        );

    }
    else{
        [tensorOutput, inferenceTime.value] = await runModelUtilsONNX.runModel(
            session,
            preprocessedData
        );
    }
    // console.log(tensorOutput,'TOUTPUT');
    const postprocessedData = props.postprocess(tensorOutput); 
    sessionRunning.value = false;
    return postprocessedData;
} 

function clearAll(){
    updatecanvas_reload(true);
    // console.log('inclearall');
    sessionRunning.value = false;
    inferenceTime.value = 0;
}

set_elem_functions_(props.modelName,runModel);
</script>

<style scoped>
.static-container .modelname{
    position: relative;
    color: rgb(0, 119, 255);
    margin-top: 20px;
    font-size: 20px;
}
.static-container .select-container{
    display: flex;
    align-items: center;
    justify-content: center;

    margin: auto;
    width: 40%;
    padding: 10px;
    text-align:center;
}
.static-container .select-container .select-backend{
    padding-right: 5px;
}
.static-container .error-message-container {
    display: flex;
}
.static-container .error-message-container .error-message{
    padding-bottom: 30px;
}
.inference-time-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.inference-time-container .inference-time {
      text-align: center;
      /* width: 200px; */
      white-space: nowrap;
      text-overflow: ellipsis;
      font-family: sans-serif;
      font-size: 20px;
      color: black;
    }
.inference-time-container .inference-time-value {
    color: rgb(0, 119, 255);
    text-align: left;
    margin-left: 20px;
    font-family: sans-serif;
    font-size: 20px;
}
</style>