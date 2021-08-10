const wasm = import('../pkg').catch(console.error);

const N = 81;

const PROBLEM_SET = [
  [
    0, 0, 0, 0, 0, 0, 6, 0, 0,
    0, 3, 0, 0, 0, 0, 0, 1, 0,
    9, 0, 0, 0, 0, 5, 0, 0, 0,
    2, 0, 0, 3, 1, 0, 0, 0, 0,
    1, 4, 0, 6, 7, 8, 0, 0, 0,
    7, 8, 6, 5, 2, 9, 0, 3, 4,
    5, 6, 7, 0, 9, 3, 0, 0, 1,
    8, 9, 1, 4, 5, 6, 3, 7, 2,
    0, 2, 4, 0, 8, 7, 5, 0, 9,
  ],
  [
    1, 0, 0, 0, 0, 8, 0, 4, 0,
    0, 0, 8, 0, 0, 9, 0, 6, 0,
    0, 4, 5, 0, 0, 2, 8, 0, 0,
    8, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 7, 0, 0, 9, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 7,
    0, 0, 7, 5, 0, 0, 6, 2, 0,
    0, 5, 0, 6, 0, 0, 7, 0, 0,
    0, 2, 0, 3, 0, 0, 0, 0, 9,
  ],
  [
    9, 0, 0, 7, 6, 0, 0, 5, 0,
    0, 0, 6, 3, 0, 0, 0, 0, 0,
    0, 1, 0, 9, 0, 0, 0, 0, 4,
    0, 2, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    7, 0, 0, 0, 0, 0, 0, 2, 0,
    5, 0, 0, 0, 0, 8, 0, 7, 0,
    0, 0, 0, 0, 0, 6, 3, 0, 0,
    0, 4, 0, 0, 3, 1, 0, 0, 8,
  ],
  [
    0, 8, 0, 0, 0, 6, 5, 0, 0,
    0, 0, 9, 0, 0, 7, 0, 0, 3,
    5, 0, 0, 3, 0, 2, 0, 6, 0,
    0, 4, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 5, 0,
    0, 7, 0, 8, 0, 3, 0, 0, 4,
    6, 0, 0, 1, 0, 0, 2, 0, 0,
    0, 0, 3, 4, 0, 0, 0, 7, 0,
  ]
];

function isValid(result, p, v) {
  let x = p % 9;
  let y = Math.floor(p / 9);

  for (let i = 0; i < 9; i++) {
    if ((result[9 * i + x] === v) || (result[9 * y + i] === v)) {
      return false;
    }
  }

  let block_x = Math.floor(x / 3);
  let block_y = Math.floor(y / 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((result[9 * (3 * block_y + i) + (3 * block_x + j)] === v)) {
        return false;
      }
    }
  }

  return true;
}

function solveJs(problem) {
  let result = new Array(N);
  result.fill(0);

  let stack = [];
  for (let i = 0; i < N; i++) {
    if (problem[i] > 0) {
      result[i] = problem[i];
    }
    else if (stack.length === 0) {
      stack.push([false, i, 1]);
    }
  }

  let is_failing = false;
  while (stack.length > 0) {
    let t = stack.pop();
    let is_back = t[0];
    let p = t[1];
    let v = t[2];

    if (is_back && is_failing) {
      result[p] = 0;

      if (v < 9) {
        stack.push([false, p, v + 1]);
      }

      continue;
    }

    if (!isValid(result, p, v)) {
      if (v < 9) {
        stack.push([false, p, v + 1]);
      }
      else {
        is_failing = true;
      }
      continue;
    }

    is_failing = false;
    result[p] = v;
    stack.push([true, p, v]);
    let is_updated = false;

    for (let i = (p + 1); i < N; i++) {
      if (result[i] === 0) {
        stack.push([false, i, 1]);
        is_updated = true;
        break;
      }
    }

    if (!is_updated) {
      break;
    }
  }

  return result;
}

Promise.all([wasm]).then(async function ([{ solve }]) {
  for (let p in PROBLEM_SET) {
    let problem = PROBLEM_SET[p];
    console.log(`problem = ${problem}`);

    let resultWasm;
    let resultJs;

    {
      const solveStartedTime = Date.now();
      resultWasm = solve(problem);
      const solveTime = Date.now() - solveStartedTime;

      console.log(`solve: wasm\ttime: ${solveTime}[ms]`);
    }

    {
      const solveStartedTime = Date.now();
      resultJs = solveJs(problem);
      const solveTime = Date.now() - solveStartedTime;

      console.log(`solve: js\ttime: ${solveTime}[ms]`);
    }

    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (resultWasm[9 * i + j] !== resultJs[9 * i + j]) {
          console.log("resultWasm !== resultJs");
          console.log(resultWasm.slice(9 * i, 9 * i + 9));
          console.log(resultJs.slice(9 * i, 9 * i + 9));
          break;
        }
      }
    }
  }
});
