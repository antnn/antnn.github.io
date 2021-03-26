import * as wasm from './hello_web_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_22(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06167eb6bb4197c4(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_25(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06167eb6bb4197c4(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_28(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8dd9368c3ec1ca15(arg0, arg1);
}

function __wbg_adapter_31(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06167eb6bb4197c4(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_34(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06167eb6bb4197c4(arg0, arg1, addHeapObject(arg2));
}

/**
*/
export function wasm_main() {
    wasm.wasm_main();
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_log_75fc43480a5907a7 = function(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

export const __wbg_log_a73f6bdd88fae982 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
};

export const __wbg_mark_e32edf3b52687c6a = function(arg0, arg1) {
    performance.mark(getStringFromWasm0(arg0, arg1));
};

export const __wbg_measure_0c2a5c5e55e16643 = function(arg0, arg1, arg2, arg3) {
    performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
};

export const __wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

export const __wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

export const __wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

export const __wbg_instanceof_Window_5993230e7331f098 = function(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
};

export const __wbg_document_85584f745133c6ad = function(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_innerWidth_617a72c56264684b = handleError(function(arg0) {
    var ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
});

export const __wbg_innerHeight_a62d2d858c357a4d = handleError(function(arg0) {
    var ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
});

export const __wbg_devicePixelRatio_12ddf0a8cbfc2dc5 = function(arg0) {
    var ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export const __wbg_requestAnimationFrame_b7c52941004f22d8 = handleError(function(arg0, arg1) {
    var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
});

export const __wbg_getElementById_85c96642ffb33978 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_altKey_30b5b02b84b4bdcd = function(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};

export const __wbg_ctrlKey_40e65957a6010210 = function(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};

export const __wbg_shiftKey_5b7d337ba2f442bb = function(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};

export const __wbg_metaKey_360eac3c4f46f624 = function(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};

export const __wbg_location_cc9c2801074f55e1 = function(arg0) {
    var ret = getObject(arg0).location;
    return ret;
};

export const __wbg_repeat_3a29cc519725dfe0 = function(arg0) {
    var ret = getObject(arg0).repeat;
    return ret;
};

export const __wbg_isComposing_0682a77193dd12fd = function(arg0) {
    var ret = getObject(arg0).isComposing;
    return ret;
};

export const __wbg_key_0e3030ece4ec5473 = function(arg0, arg1) {
    var ret = getObject(arg1).key;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_code_01e6a9d8df844d9b = function(arg0, arg1) {
    var ret = getObject(arg1).code;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_getModifierState_9ed53e4bd77a8659 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
    return ret;
};

export const __wbg_instanceof_HtmlCanvasElement_46dcfe68d7a9fa74 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLCanvasElement;
    return ret;
};

export const __wbg_setwidth_be3f75cee9fb1e97 = function(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export const __wbg_setheight_b124b03c752079bd = function(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export const __wbg_getContext_cbecd1fc57539f80 = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
});

export const __wbg_preventDefault_f80a4c61466e816c = function(arg0) {
    getObject(arg0).preventDefault();
};

export const __wbg_addColorStop_d4bd2460e0847cc1 = handleError(function(arg0, arg1, arg2, arg3) {
    getObject(arg0).addColorStop(arg1, getStringFromWasm0(arg2, arg3));
});

export const __wbg_setProperty_8e3858c14afa5053 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
});

export const __wbg_addEventListener_4428ad4051fd6fee = handleError(function(arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
});

export const __wbg_width_a5bdda2192e5e5b6 = function(arg0) {
    var ret = getObject(arg0).width;
    return ret;
};

export const __wbg_deltaX_a35e4ec1d0640044 = function(arg0) {
    var ret = getObject(arg0).deltaX;
    return ret;
};

export const __wbg_deltaY_e3d0fee796a1c1bf = function(arg0) {
    var ret = getObject(arg0).deltaY;
    return ret;
};

export const __wbg_deltaMode_f113ee8da22b1777 = function(arg0) {
    var ret = getObject(arg0).deltaMode;
    return ret;
};

export const __wbg_log_be5faf67a2e8b869 = function(arg0) {
    console.log(getObject(arg0));
};

export const __wbg_settitle_de2fac64ce5686fb = function(arg0, arg1, arg2) {
    getObject(arg0).title = getStringFromWasm0(arg1, arg2);
};

export const __wbg_style_3cb195421b4270e3 = function(arg0) {
    var ret = getObject(arg0).style;
    return addHeapObject(ret);
};

export const __wbg_offsetWidth_435c7a5daaaa7a0f = function(arg0) {
    var ret = getObject(arg0).offsetWidth;
    return ret;
};

export const __wbg_offsetHeight_46b1c9c16770f5d8 = function(arg0) {
    var ret = getObject(arg0).offsetHeight;
    return ret;
};

export const __wbg_instanceof_CanvasRenderingContext2d_2fc2819b8ff4979a = function(arg0) {
    var ret = getObject(arg0) instanceof CanvasRenderingContext2D;
    return ret;
};

export const __wbg_setstrokeStyle_24834a1ba4e661e1 = function(arg0, arg1) {
    getObject(arg0).strokeStyle = getObject(arg1);
};

export const __wbg_setfillStyle_1b018f07574a0711 = function(arg0, arg1) {
    getObject(arg0).fillStyle = getObject(arg1);
};

export const __wbg_setlineWidth_8ed36379ed3e6850 = function(arg0, arg1) {
    getObject(arg0).lineWidth = arg1;
};

export const __wbg_setlineCap_217d893cc537d645 = function(arg0, arg1, arg2) {
    getObject(arg0).lineCap = getStringFromWasm0(arg1, arg2);
};

export const __wbg_setlineJoin_f1cceec625f0be52 = function(arg0, arg1, arg2) {
    getObject(arg0).lineJoin = getStringFromWasm0(arg1, arg2);
};

export const __wbg_setmiterLimit_2fc4cb87203132ff = function(arg0, arg1) {
    getObject(arg0).miterLimit = arg1;
};

export const __wbg_setlineDashOffset_9f19c3f5e776dad3 = function(arg0, arg1) {
    getObject(arg0).lineDashOffset = arg1;
};

export const __wbg_setfont_12950834cb972674 = function(arg0, arg1, arg2) {
    getObject(arg0).font = getStringFromWasm0(arg1, arg2);
};

export const __wbg_beginPath_a7ecc54095eb7fc8 = function(arg0) {
    getObject(arg0).beginPath();
};

export const __wbg_clip_d351ed411c224f6f = function(arg0, arg1) {
    getObject(arg0).clip(takeObject(arg1));
};

export const __wbg_fill_4f94c9d03cda33c2 = function(arg0, arg1) {
    getObject(arg0).fill(takeObject(arg1));
};

export const __wbg_stroke_ebd53de6461e74dd = function(arg0) {
    getObject(arg0).stroke();
};

export const __wbg_createLinearGradient_8c9c1ece0db50a65 = function(arg0, arg1, arg2, arg3, arg4) {
    var ret = getObject(arg0).createLinearGradient(arg1, arg2, arg3, arg4);
    return addHeapObject(ret);
};

export const __wbg_createRadialGradient_197de97142ea34b1 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    var ret = getObject(arg0).createRadialGradient(arg1, arg2, arg3, arg4, arg5, arg6);
    return addHeapObject(ret);
});

export const __wbg_setLineDash_359bce9a682ce74f = handleError(function(arg0, arg1) {
    getObject(arg0).setLineDash(getObject(arg1));
});

export const __wbg_bezierCurveTo_c5c3c15ae3b8ac92 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).bezierCurveTo(arg1, arg2, arg3, arg4, arg5, arg6);
};

export const __wbg_closePath_0c71abf66cd6a1cd = function(arg0) {
    getObject(arg0).closePath();
};

export const __wbg_lineTo_37d576db6544beac = function(arg0, arg1, arg2) {
    getObject(arg0).lineTo(arg1, arg2);
};

export const __wbg_moveTo_b701c52e66c345ac = function(arg0, arg1, arg2) {
    getObject(arg0).moveTo(arg1, arg2);
};

export const __wbg_quadraticCurveTo_f3bf6519a08bee09 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).quadraticCurveTo(arg1, arg2, arg3, arg4);
};

export const __wbg_restore_9a1e268169125fba = function(arg0) {
    getObject(arg0).restore();
};

export const __wbg_save_0d2d5b76db8ce8c1 = function(arg0) {
    getObject(arg0).save();
};

export const __wbg_fillText_37b3de7ec26782d1 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
});

export const __wbg_measureText_ed8d4077a7f8ed5b = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).measureText(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
});

export const __wbg_getTransform_7a39ce00bbb0aded = handleError(function(arg0) {
    var ret = getObject(arg0).getTransform();
    return addHeapObject(ret);
});

export const __wbg_scale_d8557d23a0b04036 = handleError(function(arg0, arg1, arg2) {
    getObject(arg0).scale(arg1, arg2);
});

export const __wbg_transform_37e480e9d606c378 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).transform(arg1, arg2, arg3, arg4, arg5, arg6);
});

export const __wbg_a_c1560ce79d8b7872 = function(arg0) {
    var ret = getObject(arg0).a;
    return ret;
};

export const __wbg_b_5855a8f987a9d2d5 = function(arg0) {
    var ret = getObject(arg0).b;
    return ret;
};

export const __wbg_c_624d97fa486fb843 = function(arg0) {
    var ret = getObject(arg0).c;
    return ret;
};

export const __wbg_d_94301a7280db49f3 = function(arg0) {
    var ret = getObject(arg0).d;
    return ret;
};

export const __wbg_e_9f22e10c590a24d2 = function(arg0) {
    var ret = getObject(arg0).e;
    return ret;
};

export const __wbg_f_7403ce9961c33fee = function(arg0) {
    var ret = getObject(arg0).f;
    return ret;
};

export const __wbg_offsetX_fe3496fcb551ca70 = function(arg0) {
    var ret = getObject(arg0).offsetX;
    return ret;
};

export const __wbg_offsetY_1100166319c9d7b0 = function(arg0) {
    var ret = getObject(arg0).offsetY;
    return ret;
};

export const __wbg_ctrlKey_1681d61208012a11 = function(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};

export const __wbg_shiftKey_ebcca66920102493 = function(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};

export const __wbg_altKey_bb15f5cebcb94027 = function(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};

export const __wbg_metaKey_1844afec3a078968 = function(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};

export const __wbg_button_64dd4c1046ed290d = function(arg0) {
    var ret = getObject(arg0).button;
    return ret;
};

export const __wbg_buttons_18437a0ade2dafde = function(arg0) {
    var ret = getObject(arg0).buttons;
    return ret;
};

export const __wbg_getModifierState_eec18962bfc3dae6 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
    return ret;
};

export const __wbg_now_bca9396939036a34 = function(arg0) {
    var ret = getObject(arg0).now();
    return ret;
};

export const __wbg_get_4e90ba4e3de362de = handleError(function(arg0, arg1) {
    var ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
});

export const __wbg_call_e5847d15cc228e4f = handleError(function(arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
});

export const __wbg_newnoargs_2349ba6aefe72376 = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbg_self_35a0fda3eb965abe = handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
});

export const __wbg_window_88a6f88dd3a474f1 = handleError(function() {
    var ret = window.window;
    return addHeapObject(ret);
});

export const __wbg_globalThis_1d843c4ad7b6a1f5 = handleError(function() {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
});

export const __wbg_global_294ce70448e8fbbf = handleError(function() {
    var ret = global.global;
    return addHeapObject(ret);
});

export const __wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export const __wbg_newwithlength_b7182b9981406137 = function(arg0) {
    var ret = new Float64Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export const __wbg_set_7e15d36563072b19 = handleError(function(arg0, arg1, arg2) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
});

export const __wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export const __wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_closure_wrapper1361 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 580, __wbg_adapter_22);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper1363 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 580, __wbg_adapter_25);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper1365 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 580, __wbg_adapter_28);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper1367 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 580, __wbg_adapter_31);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper1369 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 580, __wbg_adapter_34);
    return addHeapObject(ret);
};

