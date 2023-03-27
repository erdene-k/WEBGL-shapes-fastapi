import React, {
    useRef,
    useEffect
} from "react";
import {
    mat4
} from "gl-matrix";
const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

const fsSource = `
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
`;

export  const WebGLCanvas = () => {
        const canvasRef = useRef < HTMLCanvasElement > (null);

        useEffect(() => {

                    if (canvasRef.current) {
                        const canvas = canvasRef.current;
                        const gl = canvasRef.current.getContext("webgl");
                        if (gl === null) {
                            console.error("Unable to initialize WebGL");
                            return;
                        }

                        // Set up shaders
                        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
                        if (!vertexShader) return;
                        gl.shaderSource(vertexShader, vsSource);
                        gl.compileShader(vertexShader);
                        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                            console.error("Vertex shader compilation failed");
                            console.error(gl.getShaderInfoLog(vertexShader));
                            return;
                        }

                        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                        if (!fragmentShader) return;
                        gl.shaderSource(fragmentShader, fsSource);
                        gl.compileShader(fragmentShader);
                        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                            console.error("Fragment shader compilation failed");
                            console.error(gl.getShaderInfoLog(fragmentShader));
                            return;
                        }

                        // Create and link program
                        const program = gl.createProgram();
                        if (!program) return;
                        gl.attachShader(program, vertexShader);
                        gl.attachShader(program, fragmentShader);
                        gl.linkProgram(program);
                        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                            console.error("Program linking failed");
                            console.error(gl.getProgramInfoLog(program));
                            return;
                        }
                        gl.useProgram(program);

                        // Set up vertex data
                        const positions = [
                            // Front face
                            -1.0, -1.0, 1.0,
                            1.0, -1.0, 1.0,
                            1.0, 1.0, 1.0,
                            -1.0, 1.0, 1.0,
                            // Back face
                            -1.0, -1.0, -1.0,
                            -1.0, 1.0, -1.0,
                            1.0, 1.0, -1.0,
                            1.0, -1.0, -1.0,
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

                        const colors = [
                            // Front face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                            // Back face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                            // Top face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                            // Bottom face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                            // Right face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                            // Left face
                            1.0, 0.0, 0.0, 1.0,
                            0.0, 1.0, 0.0, 1.0,
                            0.0, 0.0, 1.0, 1.0,
                            1.0, 1.0, 0.0, 1.0,
                        ];

                        const indices = [
                            0, 1, 2, 0, 2, 3, // Front face
                            4, 5, 6, 4, 6, 7, // Back face
                            8, 9, 10, 8, 10, 11, // Top face
                            12, 13, 14, 12, 14, 15, // Bottom face
                            16, 17, 18, 16, 18, 19, // Right face
                            20, 21, 22, 20, 22, 23, // Left face
                        ];

                        const positionBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
                        const positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
                        gl.enableVertexAttribArray(positionAttributeLocation);
                        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
                        const colorBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
                        const colorAttributeLocation = gl.getAttribLocation(program, "aVertexColor");
                        gl.enableVertexAttribArray(colorAttributeLocation);
                        gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

                        const indexBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

                        const matWorldUniformLocation = gl.getUniformLocation(program, "uWorldMatrix");
                        const matViewUniformLocation = gl.getUniformLocation(program, "uViewMatrix");
                        const matProjUniformLocation = gl.getUniformLocation(program, "uProjMatrix");

                        let worldMatrix = new Float32Array(16);
                        let viewMatrix = new Float32Array(16);
                        let projMatrix = new Float32Array(16);
                        mat4.identity(worldMatrix);
                        mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
                        const fieldOfView = 45 * Math.PI / 180; // in radians
                        mat4.perspective(projMatrix, fieldOfView, canvas.width / canvas.height, 0.1, 1000.0);
                   
                        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
                        gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
                        gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

                        let angle = 0;
                        let identityMatrix = new Float32Array(16);
                        mat4.identity(identityMatrix);

                        const render=()=> {
                            angle += 0.01;
                            mat4.rotateY(worldMatrix, identityMatrix, angle);
                            gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
                            gl.clearColor(0.0, 0.0, 0.0, 1.0);
                            gl.clearDepth(1.0);
                            gl.enable(gl.DEPTH_TEST);
                            gl.depthFunc(gl.LEQUAL);
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
                            requestAnimationFrame(render);
                          }
                        
                          render();
                    }

                    
                })
                return ( <canvas id = "canvas"
                    style = {
                        {
                            width: 200,
                            height: 200
                        }
                    }
                    />
                );
            }