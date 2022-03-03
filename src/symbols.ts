import { InjectionKey, Ref } from 'vue';


// interface Functions {
//     : string
//     year?: number
// }

// interface Models {
//     name: string
//     runFunction: Function
//     output?:object
// }

export interface OutputImage {
    w?: number
    h?: number
    input_data?: HTMLImageElement | HTMLCanvasElement
}



export const CanvasReloadKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('canvas_reload');
export const UpdateCanvasReloadKey: InjectionKey<Function> = Symbol('updatecanvas_reload');

export const OutputImageKey: InjectionKey<OutputImage> = Symbol('output_image');
// export const UpdateOutputImageKey: InjectionKey<Function> = Symbol('updateoutput_image');

export const FunctionsKey: InjectionKey<Readonly<Ref<Record<string, any>>>> = Symbol('functions_');
export const SetElemFunctionsKey: InjectionKey<Function> = Symbol('set_elem_functions_');

export const GlobOutputsKey: InjectionKey<Readonly<Ref<Record<string, any>>>> = Symbol('glob_outputs');
export const SetElemGlobOutputsKey: InjectionKey<Function> = Symbol('set_elem_glob_outputs');
export const ClearGlobOutputsKey: InjectionKey<Function> = Symbol('clear_glob_outputs');

export const IsPopupVisibleKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('is_popup_visible');
export const UpdateIsPopupVisibleKey: InjectionKey<Function> = Symbol('updateis_popup_visible');