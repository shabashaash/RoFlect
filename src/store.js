import {provide, reactive, ref, readonly} from "vue";

export const initStore = () => {
    // State

    const canvas_reload  = ref(false);
    const updatecanvas_reload = (val)=>{
        canvas_reload.value = val;
    };

    const functions_ = ref({

    });
    const set_elem_functions_ = (key, val)=>{
        functions_.value[key] = val;
    };

    const glob_outputs = ref({
        
    });
    const set_elem_glob_outputs = (key, val)=>{
        console.log(val,key,"UPDATEDGLOBOUTPUTS")
        glob_outputs.value[key] = val;
    };
    // const push_elem_glob_outputs = (key, val)=>{
    //     glob_outputs[key].push(val);
    // };
    const clear_glob_outputs = ()=>{
        for (const key in glob_outputs.value){
            glob_outputs.value[key] = {};
        }
    };
    

    // const model_init_conveer = ref([]);

    // const push_init_conveer = (val) => {
    //   model_init_conveer.value.push(val);
    // };

    const output_image = reactive({

    }); //document.createElement("canvas")
    const updateoutput_image = (val) => {
      console.log('updating_out_image',val)
      output_image.h = val.h;
      output_image.w = val.w;
      output_image.input_data = val.input_data;
    };
    // const is_popup_visible = ref(false);
    // const updateis_popup_visible = (val)=>{
    //     is_popup_visible.value = val;
    // };


//   const state = reactive({
//     name: "Bob Day",
//     email: "bob@martianmovers.com",
//   });

  // Getters
//   const getUsername = computed(() => state.name);
//   const getEmail = computed(() => state.email);


  provide("canvas_reload", readonly(canvas_reload));
  provide("updatecanvas_reload", updatecanvas_reload);

  provide("functions_", readonly(functions_));
  provide("set_elem_functions_", set_elem_functions_);

  provide("glob_outputs", readonly(glob_outputs));
  provide("set_elem_glob_outputs", set_elem_glob_outputs);
  // provide("push_elem_glob_outputs", push_elem_glob_outputs);
  provide("clear_glob_outputs", clear_glob_outputs);
  
  // provide("model_init_conveer",readonly(model_init_conveer));
  // provide("push_init_conveer",push_init_conveer);

  provide("output_image",readonly(output_image));
  provide("updateoutput_image",updateoutput_image);
//   provide("is_popup_visible", readonly(is_popup_visible));
//   provide("updateis_popup_visible", updateis_popup_visible);
};

// export const useStore = () => ({
//   getUsername: inject("getUsername"),
//   getEmail: inject("getEmail"),
//   updateUsername: inject("updateUsername"),
//   updateEmail: inject("updateEmail"),
// });