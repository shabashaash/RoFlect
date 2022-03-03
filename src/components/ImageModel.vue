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
        <option v-for="option in backendSelectList" :value="option.value" :key = "option.text">
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
    </div>
    <div class="inference-time-container">
        <span class="inference-time">Inference Time: </span>
        <span v-if="inferenceTime> 0" class="inference-time-value">{{ inferenceTime.toFixed(1) }} ms </span>
        <span v-else></span>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, Ref, watch, onBeforeUnmount, inject, toRef, toRaw, onMounted  } from 'vue'


import { UpdateCanvasReloadKey, SetElemFunctionsKey } from "../symbols"

import * as runModelUtilsONNX from './common/runModelONNX'
import * as runModelUtilsHuman from './common/runModelHuman'

import {InferenceSession} from './common/runModelONNX';

// import {InferenceSession} from './common/runModelONNX';


import VStatus from "./VStatus.vue"


const props = defineProps<{
    modelFilepath : string,
    imageSize : number,
    preprocess : Function,
    postprocess : Function,
    warmup: Function,
    modelName : string
}>();

const sessionBackend = ref("wasm");
const backendSelectList = ref([
    { text: "GPU-WebGL", value: "webgl" },
    { text: "CPU-WebAssembly", value: "wasm" },
]); //text: string; value: string
const modelLoading = ref(true);
const modelInitializing = ref(true);
const modelLoadingError = ref(false);
const sessionRunning = ref(false);
const session: Ref<InferenceSession | undefined> = ref(undefined); //InferenceSession()
const gpuSession: Ref<ArrayBuffer | undefined> = ref(undefined); //InferenceSession()
const cpuSession: Ref<ArrayBuffer | undefined> = ref(undefined); //InferenceSession()
const inferenceTime = ref(0);
// const modelFile = ref(new ArrayBuffer(0));
const modelFile: Ref<ArrayBuffer | string> = ref(new ArrayBuffer(0))

const updatecanvas_reload = inject(UpdateCanvasReloadKey);
const set_elem_functions_ = inject(SetElemFunctionsKey);


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
});
onBeforeUnmount(()=> {
    session.value = undefined;
    gpuSession.value = undefined;
    cpuSession.value = undefined;
});

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
        if (props.modelName.startsWith('tf')){
            if (sessionBackend.value === "webgl") {
                gpuSession.value = await runModelUtilsHuman.createModelGpu(modelFile.value);
                console.log('created-gpu');
                console.log(gpuSession.value);
                session.value = gpuSession.value;
            } else if (sessionBackend.value === "wasm") {
                cpuSession.value = await runModelUtilsHuman.createModelCpu(modelFile.value);
                console.log('created-cpu');
                session.value = cpuSession.value;
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
        
    } catch (e: any) {
        console.log(e,'error',e.stack);
        console.log(e.message);
        console.error(e);
        
        modelLoading.value = false;
        modelInitializing.value = false;
        modelLoadingError.value = true;
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
    console.log(toRaw(session.value),modelFile.value,'CHECKMEEE');
    if (sessionBackend.value === "webgl") {
        console.log('warupwebgl');
        setTimeout(async () => {
            try { 
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
        console.log('warmup-wasm');
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

async function runModel(inputs_){

    if (modelLoadingError.value){
        throw new Error("Model is not loaded cant run."); 
    }

    console.log('IN RUN MODEL',props.modelName);
    var tensorOutput = null;
    sessionRunning.value = true;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const preprocessedData = props.preprocess(inputs_); //.data для onnx
    console.log(session.value, 'session');
    console.log(preprocessedData);
    
    if (props.modelName.startsWith('tf')){
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
    console.log(tensorOutput,'TOUTPUT');
    const postprocessedData = await props.postprocess(tensorOutput); 
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