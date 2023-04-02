import { useEffect, useRef } from "react";
import { mat4 } from "gl-matrix";

const vertexShaderSource = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;

        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;

        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;

          // Apply lighting effect

          highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = ambientLight + (directionalLightColor * directional);
        }
`;

const fragmentShaderSource = `
      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;

      uniform sampler2D uSampler;

      void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
      }
`;


interface ShapeProperties {
    vertices: number[],
    indices: number[],
    vertexNormals: number[],
    textureCoordinates: number[],
    width: number,
    height: number
    textImg: string,

}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}
const DrawingCanvas = ({ vertices, indices, vertexNormals, textureCoordinates, width, height, textImg }: ShapeProperties) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const modelViewMatrixRef = useRef<mat4>(mat4.create());

    function setNormalAttribute(gl: WebGLRenderingContext, normalBuffer: WebGLRenderbuffer, vertexNormalAttributeLocation: number) {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(
            vertexNormalAttributeLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(vertexNormalAttributeLocation);
    }
    function initTextureBuffer(gl: WebGLRenderingContext) {
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(textureCoordinates),
            gl.STATIC_DRAW
        );
        return textureCoordBuffer;
    }
    function loadTexture(gl: WebGLRenderingContext, url: string) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
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
        };
        image.src = url;

        return texture;
    }
    function initNormalBuffer(gl: WebGLRenderingContext) {
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);


        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertexNormals),
            gl.STATIC_DRAW
        );

        return normalBuffer;
    }

    // tell webgl how to pull out the texture coordinates from buffer
    function setTextureAttribute(gl: WebGLRenderingContext, textureCoordBuffer: WebGLRenderbuffer, textureCoord: number) {
        const num = 2; // every coordinate composed of 2 vales
        const type = gl.FLOAT; // the data in the buffer is 32-bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.vertexAttribPointer(textureCoord, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(textureCoord);
    }

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
        projectionMatrixUniformLocation: WebGLUniformLocation, positionBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, projectionMatrix: mat4, angle: number, texture: WebGLBuffer, uSampler: WebGLUniformLocation,
        normalMatrixUniformLocation: WebGLUniformLocation) => {
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

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix4fv(normalMatrixUniformLocation, false, normalMatrix);

        // Bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uSampler, 0);

        // Schedule the next frame
        requestAnimationFrame(() => {
            draw(gl, program, positionAttributeLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, angle + 0.01, texture, uSampler, normalMatrixUniformLocation);
        });
    }



    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl");
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

        const vertexNormalAttributeLocation = gl.getAttribLocation(program, "aVertexNormal");
        const normalMatrixUniformLocation = gl.getUniformLocation(program, "uNormalMatrix")
        const uSampler = gl.getUniformLocation(program, "uSampler")
        const textureCoord = gl.getAttribLocation(program, "aTextureCoord")


        const positionBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();
        const textureCoordBuffer = initTextureBuffer(gl);
        const normalBuffer = initNormalBuffer(gl);
        const texture = loadTexture(gl, textImg);

        //checking buffers
        if (!indexBuffer) return;
        if (!uSampler) return;
        if (!texture) return;
        if (!textureCoordBuffer) return;
        if (!normalBuffer) return;
        if (!positionBuffer) return;
        if (!modelViewMatrixUniformLocation) return;
        if (!projectionMatrixUniformLocation) return;
        if (!normalMatrixUniformLocation) return
        const size = 3; // 3 components per iteration
        const type = gl.FLOAT; // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0; // start at the beginning of the buffer
        const fieldOfView = 45 * Math.PI / 180; // in radians
        const aspect = gl.canvas.width / gl.canvas.height;
        const zNear = 0.1;
        const zFar = 100.0;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        setTextureAttribute(gl, textureCoordBuffer, textureCoord);
        setNormalAttribute(gl, normalBuffer, vertexNormalAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uSampler, 0);
        console.log("vertices", vertices)
        draw(gl, program, positionAttributeLocation, modelViewMatrixUniformLocation, projectionMatrixUniformLocation, positionBuffer, indexBuffer, projectionMatrix, 0, texture, uSampler, normalMatrixUniformLocation);
    }, [vertices]);

    return (
        <div>
           
            <canvas ref={canvasRef} width={width} height={height} />
        </div>

    );
};

export default DrawingCanvas;