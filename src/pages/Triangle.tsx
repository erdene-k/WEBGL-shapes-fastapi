import { useEffect, useRef } from "react";
import { mat4 } from "gl-matrix";


const vertexShaderSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  attribute vec4 aVertexColor;
  varying lowp vec4 vColor;
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    gl_FragColor = uColor;
  }
`;

const positions = [
  // Front face
  -1, -1, 1,
  1, -1, 1,
  1, 1, 1,
  -1, 1, 1,
  // Back face
  -1, -1, -1,
  -1, 1, -1,
  1, 1, -1,
  1, -1, -1,
  // Top face
  -1, 1, -1,
  -1, 1, 1,
  1, 1, 1,
  1, 1, -1,
  // Bottom face
  -1, -1, -1,
  1, -1, -1,
  1, -1, 1,
  -1, -1, 1,
  // Right face
  1, -1, -1,
  1, 1, -1,
  1, 1, 1,
  1, -1, 1,
  // Left face
  -1, -1, -1,
  -1, -1, 1,
  -1, 1, 1,
  -1, 1, -1,
];

const indices = [
  0, 1, 2, 0, 2, 3, // Front face
  4, 5, 6, 4, 6, 7, // Back face
  8, 9, 10, 8, 10, 11, // Top face
  12, 13, 14, 12, 14, 15, // Bottom face
  16, 17, 18, 16, 18, 19, // Right face
  20, 21, 22, 20, 22, 23, // Left face
];
const colors = [
  // front face (red)
  1, 0, 0, 1,
  // back face (green)
  0, 1, 0, 1,
  // top face (blue)
  0, 0, 1, 1,
  // bottom face (yellow)
  1, 1, 0, 1,
  // left face (magenta)
  1, 0, 1, 1,
  // right face (cyan)
  0, 1, 1, 1,

];
const colorsB = [
  // front face (red)
  1, 0, 0, 1,
  1, 0, 0, 1,
  1, 0, 0, 1,
  1, 0, 0, 1,

  // back face (green)
  0, 1, 0, 1,
  0, 1, 0, 1,
  0, 1, 0, 1,
  0, 1, 0, 1,

  // top face (blue)
  0, 0, 1, 1,
  0, 0, 1, 1,
  0, 0, 1, 1,
  0, 0, 1, 1,

  // bottom face (yellow)
  1, 1, 0, 1,
  1, 1, 0, 1,
  1, 1, 0, 1,
  1, 1, 0, 1,

  // left face (magenta)
  1, 0, 1, 1,
  1, 0, 1, 1,
  1, 0, 1, 1,
  1, 0, 1, 1,

  // right face (cyan)
  0, 1, 1, 1,
  0, 1, 1, 1,
  0, 1, 1, 1,
  0, 1, 1, 1,
];

const Triangle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const modelViewMatrixRef = useRef<mat4>(mat4.create());

  const update = (time: number) => {
    if (!previousTimeRef.current) {
      previousTimeRef.current = time;
      return;
    }

    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    // Update the model view matrix with a rotation matrix
    const angle = deltaTime / 1000 * 90; // rotate 90 degrees per second
    mat4.rotateX(modelViewMatrixRef.current, modelViewMatrixRef.current, angle * Math.PI / 180);
  
    
 
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = (gl: WebGLRenderingContext, program: WebGLProgram, positionAttributeLocation: number, colorUniformLocation: WebGLUniformLocation, modelViewMatrixUniformLocation: WebGLUniformLocation, 
    projectionMatrixUniformLocation: WebGLUniformLocation, positionBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, projectionMatrix: mat4, angle: number, colorBuffer: WebGLBuffer, colorAttributeLocation:number) => {
    // Clear the canvas
  gl.clearColor(1.0, 1.0, 1.0, 1);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Compute the model view matrix
  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]); // move the cube away from the camera
  mat4.rotateX(modelViewMatrix, modelViewMatrix, angle); // rotate the cube around the Y-axis
  mat4.rotateY(modelViewMatrix, modelViewMatrix, angle); // r
  // Set the uniforms
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  // Bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    3, // 3 components per iteration (x, y, z)
    gl.FLOAT, // the data is 32bit floats
    false, // don't normalize the data
    0, // 0 = move forward size * sizeof(type) each iteration to get the next position
    0 // start at the beginning of the buffer
  );

  // Bind the color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsB), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    colorAttributeLocation,
    4, // 4 components per iteration (r, g, b, a)
    gl.FLOAT, // the data is 32bit floats
    false, // don't normalize the data
    0, // 0 = move forward size * sizeof(type) each iteration to get the next position
    0 // start at the beginning of the buffer
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  
  // Draw the front face
  gl.uniform4fv(colorUniformLocation, colors.slice(0, 4));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  // Draw the back face
  gl.uniform4fv(colorUniformLocation, colors.slice(4, 8));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12);

  // Draw the top face
  gl.uniform4fv(colorUniformLocation, colors.slice(8, 12));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24);


  // Draw the bottom face
  gl.uniform4fv(colorUniformLocation,colors.slice(12, 16));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 36);

  // Draw the left face
  gl.uniform4fv(colorUniformLocation, colors.slice(16, 20));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48);

  // Draw the right face
  gl.uniform4fv(colorUniformLocation, colors.slice(20, 24));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 60);
  
    // Schedule the next frame
    requestAnimationFrame(() => {
      draw(gl, program, positionAttributeLocation, colorUniformLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, angle + 0.02, colorBuffer, colorAttributeLocation);
    });
  }


  useEffect(() => {
    if (!canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
  
    // Initialize WebGL and shader program...
    if (!gl) {
        console.error("Failed to get WebGL context");
        return;
      }

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  
      if (!vertexShader) {
        console.error("Failed to create vertex shader");
        return;
      }
  
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
  
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Failed to compile vertex shader", gl.getShaderInfoLog(vertexShader));
        return;
      }
  
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  
      if (!fragmentShader) {
        console.error("Failed to create fragment shader");
        return;
      }
  
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
  
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Failed to compile fragment shader", gl.getShaderInfoLog(fragmentShader));
        return;
      }
  
      const program = gl.createProgram();
  if (!program) return;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program:", gl.getProgramInfoLog(program));
    return;
  }
  
  const positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
  const colorUniformLocation = gl.getUniformLocation(program, "uColor");
  const modelViewMatrixUniformLocation = gl.getUniformLocation(program, "uModelViewMatrix");
  const projectionMatrixUniformLocation = gl.getUniformLocation(program, "uProjectionMatrix");
  
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) return;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) return;
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


  gl.useProgram(program);
  
  gl.enableVertexAttribArray(positionAttributeLocation);
  
  const size = 3; // 3 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  


  const colorAttributeLocation = gl.getAttribLocation(program, "aVertexColor");
  
  gl.vertexAttribPointer(
    colorAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(colorAttributeLocation);
 
  


  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
  

  
  const fieldOfView = 45 * Math.PI / 180; // in radians
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;

  ///


    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    if(!colorUniformLocation){return;}
    if(! modelViewMatrixUniformLocation)return;
    if(! projectionMatrixUniformLocation)return;
    if(! colorBuffer)return;
    draw(gl, program, positionAttributeLocation, colorUniformLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, 0, colorBuffer, colorAttributeLocation);
  }, []);
  return (
    <canvas ref={canvasRef} width={400} height={400} />
  );
};

export default Triangle;