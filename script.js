const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

function compileShader(id) {
  const shaderScript = document.getElementById(id);
  const shaderSource = shaderScript.text;
  let shader;
  if (shaderScript.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexShader = compileShader("vertex-shader");
const fragmentShader = compileShader("fragment-shader");

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const vertices = new Float32Array([
  -1, -1,  1,  1, 0, 0,
   1, -1,  1,  0, 1, 0,
   1,  1,  1,  0, 0, 1,
  -1,  1,  1,  1, 1, 0,
  -1, -1, -1,  1, 0, 1,
   1, -1, -1,  0, 1, 1,
   1,  1, -1,  1, 1, 1,
  -1,  1, -1,  0, 0, 0,
]);

const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3,
  1, 5, 6, 1, 6, 2,
  5, 4, 7, 5, 7, 6,
  4, 0, 3, 4, 3, 7,
  3, 2, 6, 3, 6, 7,
  4, 5, 1, 4, 1, 0
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, "aPosition");
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(aPosition);

const aColor = gl.getAttribLocation(program, "aColor");
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
gl.enableVertexAttribArray(aColor);

const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

function perspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ];
}

function identity() {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

function rotateY(m, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r = [...m];
  r[0] = c; r[2] = s;
  r[8] = -s; r[10] = c;
  return r;
}

function rotateX(m, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r = [...m];
  r[5] = c; r[6] = -s;
  r[9] = s; r[10] = c;
  return r;
}

const projMatrix = perspective(45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);
gl.uniformMatrix4fv(uProjectionMatrix, false, new Float32Array(projMatrix));
gl.enable(gl.DEPTH_TEST);

let angle = 0;

function render() {
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mvMatrix = identity();
  mvMatrix[14] = -6;
  mvMatrix = rotateY(mvMatrix, angle);
  mvMatrix = rotateX(mvMatrix, angle * 0.7);

  gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(mvMatrix));
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  angle += 0.01;
  requestAnimationFrame(render);
}

render();
