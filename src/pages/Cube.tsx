import { useEffect, useRef } from "react";
import { mat4 } from "gl-matrix";


const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying highp vec2 vTextureCoord;
  void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
  }
`;

const fragmentShaderSource = `
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
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
function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}
const Cube: React.FC = () => {
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

  const draw = (gl: WebGLRenderingContext, program: WebGLProgram, positionAttributeLocation: number, modelViewMatrixUniformLocation: WebGLUniformLocation,
    projectionMatrixUniformLocation: WebGLUniformLocation, positionBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, projectionMatrix: mat4, angle: number, texture: WebGLBuffer, uSampler: WebGLUniformLocation) => {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
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

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(uSampler, 0);

    // Schedule the next frame
    requestAnimationFrame(() => {
      draw(gl, program, positionAttributeLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, angle + 0.02, texture, uSampler);
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
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program, "uModelViewMatrix");
    const projectionMatrixUniformLocation = gl.getUniformLocation(program, "uProjectionMatrix");
    const uSampler = gl.getUniformLocation(program, "uSampler")

    const textureCoord = gl.getAttribLocation(program, "aTextureCoord");
    const positionBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    const texture = gl.createTexture();
    if (!indexBuffer) return;

    if (!texture) return;
    if (!positionBuffer) return;
    if (!uSampler) return;
    if (!modelViewMatrixUniformLocation) return;
    if (!projectionMatrixUniformLocation) return;

    const size = 3; // 3 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const textureCoordBuffer = gl.createBuffer();
    if (!textureCoordBuffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      gl.STATIC_DRAW);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image
      );

      // WebGL1 has different requirements for power of 2 images
      // vs. non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      image.src = 'cubetexture.png'
    }


    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);



    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.useProgram(program);






    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(positionAttributeLocation);

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;



    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    const num = 2; // every coordinate composed of 2 values

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(
      textureCoord,
      num,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(textureCoord);

    draw(gl, program, positionAttributeLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, 0, texture, uSampler);
  }, []);
  return (
    <canvas ref={canvasRef} width={400} height={400} />
  );
};

export default Cube;
