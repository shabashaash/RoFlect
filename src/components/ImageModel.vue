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
import { ref, watch, onBeforeUnmount, inject, defineProps, onMounted  } from 'vue' //toRef toRaw

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
var modelFile = undefined;

const inferenceTime = ref(0);
//ref(new ArrayBuffer(0));
const updatecanvas_reload = inject('updatecanvas_reload');
const set_elem_functions_ = inject('set_elem_functions_');


watch(sessionBackend, async function(){
    clearAll();
    try {
        await initSession();
    } catch (e) {
        modelLoadingError.value = true;
    }
});
onMounted(async ()=>{
    if (props.modelName.startsWith('tf')){
        // const FilepathNR = toRef(props, 'modelFilepath');
        
        modelFile = props.modelFilepath;//FilepathNR.value;

    }
    else{
        const response = await fetch(props.modelFilepath);
        modelFile = await response.arrayBuffer();
    }

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
    modelLoading.value = true;
    console.log(modelLoading.value, 'MODELLOADING');
    modelInitializing.value = true;
    }
    // setTimeout(() => {
    try {
        if (props.modelName.startsWith('tf')){
            if (sessionBackend.value === "webgl") {
                gpuSession = await runModelUtilsHuman.createModelGpu(modelFile);
                console.log('created-gpu');
                console.log(gpuSession.value);
                session = gpuSession;
            } else if (sessionBackend.value === "wasm") {
                cpuSession = await runModelUtilsHuman.createModelCpu(modelFile);
                console.log('created-cpu');
                session = cpuSession;
            }
        }
        else{
            if (sessionBackend.value === "webgl") {
                gpuSession = await runModelUtilsONNX.createModelGpu(modelFile);
                console.log('created-gpu');
                session = gpuSession;
            } else if (sessionBackend.value === "wasm") {
                cpuSession = await runModelUtilsONNX.createModelCpu(modelFile);
                console.log('created-cpu');
                session = cpuSession;
            }
        }
    } catch (e) {
        console.log(e,'error',e.stack);
        console.log(e.message);
        console.error(e);
        
        modelLoading.value = false;
        modelInitializing.value = false;
        modelLoadingError.value = true;
        if (sessionBackend.value === "webgl") {
            gpuSession = undefined;
            console.log('gpuerr');
        } else {
            cpuSession = undefined;
            console.log('cpuerr');
        }
        throw new Error("Error: Backend (Loading) not supported. ");
    }
    // }, 1000);
    modelLoading.value = false;
    console.log('stop loading');
    console.log(session);
    console.log(session,modelFile,'CHECKMEEE');

    // setTimeout(async () => {
        try { 
            await props.warmup(session);
        } catch {
            modelLoading.value = false;
            modelInitializing.value = false;
            modelLoadingError.value = true;

            if (sessionBackend.value === "webgl"){
                gpuSession = undefined;
            }
            else{
                cpuSession = undefined;
            }
            session = undefined;
            console.log('CUSTOMERROR');
            throw new Error("Error: Backend (Initial) not supported. ");
        }
        modelInitializing.value = false;
    // }, 1000);
}

async function runModel(inputs_){
    modelRunningError.value = false;
    if (modelLoadingError.value || modelLoading.value){
        modelRunningError.value = true;
        throw new Error("Model is not loaded cant run."); 
    }

    console.log('IN RUN MODEL',props.modelName);
    var tensorOutput = null;
    sessionRunning.value = true;
    // await new Promise(resolve => setTimeout(resolve, 100));
    
    const preprocessedData = props.preprocess(inputs_); //.data для onnx
    console.log(session, 'session');
    console.log(preprocessedData);
    
    if (props.modelName.startsWith('tf')){
    //!!!!
        [tensorOutput, inferenceTime.value] = await runModelUtilsHuman.runModel(
            session,
            preprocessedData
        );
    //!!!!
    }
    else{
        [tensorOutput, inferenceTime.value] = await runModelUtilsONNX.runModel(
            session,
            preprocessedData
        );
    }
    console.log(tensorOutput,'TOUTPUT');
    const postprocessedData = props.postprocess(tensorOutput); 
    sessionRunning.value = false;
    return postprocessedData;
} 

function clearAll(){
    updatecanvas_reload(true);
    console.log('inclearall');
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