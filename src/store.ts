import {provide, reactive, ref, Ref, readonly } from "vue";



import { 
  CanvasReloadKey, 
  UpdateCanvasReloadKey,
  OutputImageKey,
  // UpdateOutputImageKey,
  FunctionsKey,
  SetElemFunctionsKey,
  GlobOutputsKey,
  SetElemGlobOutputsKey,
  ClearGlobOutputsKey,
  IsPopupVisibleKey,  
  UpdateIsPopupVisibleKey,
  OutputImage
} from './symbols'

export const initStore = () => {
    // State

    const canvas_reload = ref(false);


    // const canvas_reload: Ref<boolean | number> = ref(false)



    const updatecanvas_reload = (val: boolean)=>{
        canvas_reload.value = val;
    };



    // const glob_models = ref([]);

    
    // const set_function_glob_models = (key:string, val:Function)=>{
    //   functions_[key] = val;
    // };


    
    const functions_ = ref(<Record<string,any>>{});
    const set_elem_functions_ = (key:string, val:Function)=>{
        functions_.value[key] = val;
    };

    const glob_outputs = <Record<string,any>>ref({});
    const set_elem_glob_outputs = (key:string, val:object)=>{
        glob_outputs[key] = val;
    };
    // const push_elem_glob_outputs = (key, val)=>{
    //     glob_outputs[key].push(val);
    // };
    const clear_glob_outputs = ()=>{
        for (const key in glob_outputs){
            glob_outputs[key] = {};
        }
    };

    const output_image: OutputImage = reactive({

    }); //document.createElement("canvas")
    const updateoutput_image = (val: OutputImage) => {
      output_image.h = val.h
      output_image.w = val.w
      output_image.input_data = val.input_data
      console.log('updating_out_image',val)
      // output_image.value = val;
    };
    // const is_popup_visible = ref(false);
    // const updateis_popup_visible = (val)=>{
    //     is_popup_visible.value = val;
    // };
    const is_popup_visible = ref(false);
    const updateis_popup_visible = (val: boolean)=>{
      is_popup_visible.value = val;
      console.log('updating_popup');
    };

//   const state = reactive({
//     name: "Bob Day",
//     email: "bob@martianmovers.com",
//   });

  // Getters
//   const getUsername = computed(() => state.name);
//   const getEmail = computed(() => state.email);

  // const key = Symbol("canvas_reload") as InjectionKey<Readonly<Ref<boolean>>>
  
  provide(CanvasReloadKey, readonly(canvas_reload))
  // provide("canvas_reload", readonly(canvas_reload));
  provide(UpdateCanvasReloadKey, updatecanvas_reload);

  provide(OutputImageKey,output_image);
  // provide(UpdateOutputImageKey,updateoutput_image);

  provide(FunctionsKey, readonly(functions_));
  provide(SetElemFunctionsKey, set_elem_functions_);

  provide(GlobOutputsKey, readonly(glob_outputs));
  provide(SetElemGlobOutputsKey, set_elem_glob_outputs);
  // provide("push_elem_glob_outputs", push_elem_glob_outputs);
  provide(ClearGlobOutputsKey, clear_glob_outputs);
  

  provide(IsPopupVisibleKey, readonly(is_popup_visible));
  provide(UpdateIsPopupVisibleKey, updateis_popup_visible);
  
//   provide("is_popup_visible", readonly(is_popup_visible));
//   provide("updateis_popup_visible", updateis_popup_visible);
};

// export const useStore = () => ({
//   getUsername: inject("getUsername"),
//   getEmail: inject("getEmail"),
//   updateUsername: inject("updateUsername"),
//   updateEmail: inject("updateEmail"),
// });