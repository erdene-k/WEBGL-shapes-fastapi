import React, { useRef, useEffect } from 'react';

const RotatingCube = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const vertexShaderSource = `
      attribute vec3 aPosition;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      console.error("Failed to create vertex shader");
      return;
    }
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      console.error("Failed to create fragment shader");
      return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const vertices = [
      -1, -1, -1,  // Front bottom left
       1, -1, -1,  // Front bottom right
       1,  1, -1,  // Front top right
      -1,  1, -1,  // Front top left
      -1, -1,  1,  // Back bottom left
       1, -1,  1,  // Back bottom right
       1,  1,  1,  // Back top right
      -1,  1,  1,  // Back top left
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const modelViewMatrixLocation = gl.getUniformLocation(program, 'uModelViewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');

    let angle = 0;

    const render = () => {
      angle += 0.01;

      const modelViewMatrix = new Float32Array([
        Math.cos(angle), 0, -Math.sin(angle), 0,
        0, 1, 0, 0,
        Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, -5, 1,
      ]);
      gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

      const projectionMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

      gl.clearColor( 0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    
      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
  }, []);

  return (
  <canvas ref={canvasRef} width={400} height={400} />
  );
  };
  
  export default RotatingCube;
