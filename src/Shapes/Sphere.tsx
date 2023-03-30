const latitudes = 32; // number of vertical segments
const longitudes = 32; // number of horizontal segments
const radius = 1.5;

const vertices = [];
const indices = [];
const textureCoords = [];
const normals = [];

// Generate vertices, textureCoords, and normals
for (let lat = 0; lat <= latitudes; lat++) {
    const theta = (lat * Math.PI) / latitudes;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lng = 0; lng <= longitudes; lng++) {
        const phi = (lng * 2 * Math.PI) / longitudes;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        const u = 1 - (lng / longitudes);
        const v = 1 - (lat / latitudes);

        vertices.push(radius * x, radius * y, radius * z);
        textureCoords.push(u, v);
        normals.push(x, y, z);
    }
}

// Generate indices
for (let lat = 0; lat < latitudes; lat++) {
    for (let lng = 0; lng < longitudes; lng++) {
        const first = lat * (longitudes + 1) + lng;
        const second = first + longitudes + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
    }
}

export const Sphere = {
    vertices: vertices,
    indices: indices,
    textureCoordinates: textureCoords,
    vertexNormals: normals,
}