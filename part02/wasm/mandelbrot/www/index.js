'use strict';

const logic = {
  getNDiverged: function (x0, y0, max_iter) {
    let xn = 0.0;
    let yn = 0.0;

    for (let i = 1; i < max_iter; i++) {
      let x_next = xn * xn - yn * yn + x0;
      let y_next = 2.0 * xn * yn + y0;
      xn = x_next;
      yn = y_next;

      if (xn * xn + yn * yn > 4) {
        return i;
      }
    }

    return max_iter;
  },

  generateMandelbrotSet: function (
    canvas_w,
    canvas_h,
    x_min,
    x_max,
    y_min,
    y_max,
    max_iter,
  ) {
    let data = [];
    for (let i = 0; i < canvas_h; i++) {
      let y = y_min + (y_max - y_min) * i / canvas_h;

      for (let j = 0; j < canvas_w; j++) {
        let x = x_min + (x_max - x_min) * j / canvas_w;
        let iter_ix = this.getNDiverged(x, y, max_iter);
        let v = iter_ix % 8 * 32;
        data.push(v);
        data.push(v);
        data.push(v);
        data.push(255);
      }
    }

    return data;
  },
}

function draw(ctx, canvas_w, canvas_h, data) {
  let img = new ImageData(new Uint8ClampedArray(data), canvas_w, canvas_h);
  ctx.putImageData(img, 0, 0);
}

const X_MIN = -1.5;
const X_MAX = 0.5;
const Y_MIN = -1.0;
const Y_MAX = 1.0;
const MAX_ITER = 64;

console.log('Start loading wasm');
const mandelbrot = import('../pkg').catch(console.error);

Promise.all([mandelbrot]).then(async function ([{ generate_mandelbrot_set, draw_mandelbrot_set }]) {
  console.log('Finish loading wasm');

  const renderBtn = document.getElementById('render');
  renderBtn.addEventListener('click', () => {
    let wasmResult = null;
    let jsResult = null;
    // let result = []

    {
      console.log("Wasm only");
      draw_mandelbrot_set();
    }

    {
      console.log("Wasm + JS");

      const CANVAS_ID = 'canvas_hybrid';
      let canvas = document.getElementById(CANVAS_ID);
      let context = canvas.getContext('2d');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const generateStartedTime = Date.now();
      wasmResult = generate_mandelbrot_set(canvasWidth, canvasHeight, X_MIN, X_MAX, Y_MIN, Y_MAX, MAX_ITER);
      const generateFinishedTime = Date.now();

      const drawStartedTime = Date.now();
      draw(context, canvasWidth, canvasHeight, wasmResult);
      const drawFinishedTime = Date.now();

      const generationTime = generateFinishedTime - generateStartedTime;
      const drawingTime = drawFinishedTime - drawStartedTime;
      console.log(`\tgenerate: wasm\tgenerate_time: ${generationTime}[ms]`);
      console.log(`\tdraw: js\tdrawing_time: ${drawingTime}[ms]`);
    }

    {
      console.log("Js only");

      const CANVAS_ID = 'canvas_js';
      let canvas = document.getElementById(CANVAS_ID);
      let context = canvas.getContext('2d');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const generateStartedTime = Date.now();
      jsResult = logic.generateMandelbrotSet(canvasWidth, canvasHeight, X_MIN, X_MAX, Y_MIN, Y_MAX, MAX_ITER);
      const generateFinishedTime = Date.now();

      const drawStartedTime = Date.now();
      draw(context, canvasWidth, canvasHeight, jsResult);
      const drawFinishedTime = Date.now();

      const generationTime = generateFinishedTime - generateStartedTime;
      const drawingTime = drawFinishedTime - drawStartedTime;
      console.log(`\tgenerate: js\tgeneration_time: ${generationTime}[ms]`);
      console.log(`\tdraw: js\tdrawing_time: ${drawingTime}[ms]`);
    }

    {
      let isSame = true;
      console.log("\n");
      for (let i = 0; i < jsResult.length; i++) {
        if (jsResult[i] !== wasmResult[i]) {
          console.log(`jsResult[${i}]: ${jsResult[i]}\twasmResult[${i}]: ${wasmResult[i]}`);
          isSame = false;
          break;
        }
      }

      console.log(`(wasmResult === jsResult): ${isSame}`);
    }
  });
});
