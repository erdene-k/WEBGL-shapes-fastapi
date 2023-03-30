
const radius = 1;
const height = 2;
const numSides = 32;

// Vertices
const vertices: number[] = [];
const angleStep = (2 * Math.PI) / numSides;
for (let i = 0; i < numSides; i++) {
    const angle = angleStep * i;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, -height / 2, z);
    vertices.push(x, height / 2, z);
}
vertices.push(0, -height / 2, 0);
vertices.push(0, height / 2, 0);


// Indices
const indices: number[] = [];
for (let i = 0; i < numSides; i++) {
    const topIndex = i * 2;
    const bottomIndex = i * 2 + 1;
    const nextTopIndex = ((i + 1) % numSides) * 2;
    const nextBottomIndex = ((i + 1) % numSides) * 2 + 1;

    // Add the indices for the top cap
    indices.push(topIndex, nextTopIndex, numSides * 2);

    // Add the indices for the bottom cap
    indices.push(bottomIndex, numSides * 2 + 1, nextBottomIndex);

    // Add the indices for the side
    indices.push(topIndex, nextTopIndex, bottomIndex);
    indices.push(nextTopIndex, nextBottomIndex, bottomIndex);
}

// Normals
const normals: number[] = [];
for (let i = 0; i < numSides; i++) {
    const angle = angleStep * i;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    normals.push(x, 0, z);
    normals.push(x, 0, z);
}
normals.push(0, -1, 0);
normals.push(0, 1, 0);

// Texture coordinates
const textureCoords: number[] = [];
for (let i = 0; i < numSides; i++) {
    const u = i / numSides;
    textureCoords.push(u, 0);
    textureCoords.push(u, 1);
}
textureCoords.push(0.5, 0);
textureCoords.push(0.5, 1);

export const Cylinder = {
    vertices: vertices,
    indices: indices,
    textureCoordinates: textureCoords,
    vertexNormals: normals,
}