import { vec3 } from "gl-matrix";

// Define the number of sides of the cylinder
const numSides = 32;

// Define the radius and height of the cylinder
const radius = 0.5;
const height = 1.0;

// Create arrays to store the vertex positions, texture coordinates, and vertex normals
const vertices: number[] = [];
const textureCoordinates: number[] = [];
const normals: number[] = [];
const indices: number[] = [];
// Define the top and bottom center vertices
const topCenter = [0.0, height / 2.0, 0.0];
const bottomCenter = [0.0, -height / 2.0, 0.0];

// Create the top and bottom caps
for (let i = 0; i < numSides; i++) {
    const theta = (i / numSides) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    // Add the top and bottom vertices for this side
    vertices.push(
        x, height / 2.0, z,
        x, -height / 2.0, z
    );

    // Add the texture coordinates for this side
    textureCoordinates.push(
        i / numSides, 0,
        i / numSides, 1
    );

    // Add the vertex normals for this side
    const normal = [x, 0.0, z];
    vec3.normalize(new Float32Array(normal), new Float32Array(normal));
    normals.push(
        normal[0], normal[1], normal[2],
        normal[0], normal[1], normal[2]
    );
}

// Create the side vertices, texture coordinates, and vertex normals
for (let i = 0; i < numSides; i++) {
    const theta = (i / numSides) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    // Add the side vertices for this side
    vertices.push(
        x, height / 2.0, z,
        x, -height / 2.0, z
    );

    // Add the texture coordinates for this side
    textureCoordinates.push(
        i / numSides, 0,
        i / numSides, 1
    );

    // Add the vertex normals for this side
    const normal = [x, 0.0, z];
    vec3.normalize(new Float32Array(normal), new Float32Array(normal));
    normals.push(
        normal[0], 0.0, normal[2],
        normal[0], 0.0, normal[2]
    );
}



for (let i = 0; i < numSides; i++) {
    const topIndex = i * 2;
    const bottomIndex = i * 2 + 1;
    const nextTopIndex = ((i + 1) % numSides) * 2;
    const nextBottomIndex = ((i + 1) % numSides) * 2 + 1;

    // Add the indices for the top cap
    indices.push(topIndex, nextTopIndex, topCenter[0], topCenter[1]);

    // Add the indices for the bottom cap
    indices.push(bottomIndex, bottomCenter[0], bottomCenter[1], nextBottomIndex);




    // Add the indices for the side
    indices.push(topIndex, nextTopIndex, bottomIndex);
    indices.push(nextTopIndex, nextBottomIndex, bottomIndex);
}


export const Cylinder = {
    vertices: vertices,
    indices: indices,
    textureCoordinates: textureCoordinates,
    vertexNormals: normals,
}