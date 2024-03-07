import { div, equal, length, neg, toVec } from "../math/vectors";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */
/** @typedef {{from: Vector3, to: Vector3}} BlockVolume */
/** @typedef {{min: Number, max: Number}} Range */

/**
 * Tests if a value is within the range, inclusive.
 * @param {Number} x 
 * @param {Range} range 
 * @returns {Boolean}
 */
function within(x, range) {
    return range.min <= x && x <= range.max;
}

export class ChunkMesh {
    /**
     * Creates a new ChunkMesh instance.
     * @param {Vector3[]} chunks 
     */
    constructor(chunks) {
        this.chunks = chunks;
    }
    /** @readonly @type {Vector3[]} */
    chunks = [];
    /**
     * Filters the chunk mesh for vectors that are within the defined ranges.
     * @param {Range} x 
     * @param {Range} y 
     * @param {Range} z 
     * @returns {Vector3[]}
     */
    filter(x, y, z) {
        const list = [];
        for (const chunk of this.chunks) {
            if (x != undefined && !within(chunk.x, x)) continue;
            if (y != undefined && !within(chunk.y, y)) continue;
            if (z != undefined && !within(chunk.z, z)) continue;
            list.push(chunk);
        }
        return list;
    }
    /**
     * Removes the chunk from the chunkmesh.
     * @param {Vector3} remove 
     */
    remove(remove) {
        for (const [i, chunk] of this.chunks.entries())
            if (equal(remove, chunk)) this.chunks.splice(i, 1);
    }
}

/**
 * Generates a Vector3 array in the shape of a sphere from the center and radius.
 * @param {Number} radius 
 * @returns {Vector3[]}
 */
export function generateVoxelSphere(radius) {
    const chunks = [], range = toVec(radius);
    const min = neg(range), max = range;
    for (let x = min.x; x <= max.x; ++x)
        for (let y = min.y; y <= max.y; ++y)
            for (let z = min.z; z <= max.z; ++z)
                if (length({x, y, z}) <= radius)
                    chunks.push({x, y, z});
    return chunks;
}

/**
 * Generates a Vector3 array in the shape of an ellipsoid from the center and radius.
 * @param {Vector3} radius 
 * @returns {Vector3[]}
 */
export function generateVoxelEllipsoid(radius) {
    const chunks = [];
    const min = neg(radius), max = radius;
    for (let x = min.x; x <= max.x; ++x)
        for (let y = min.y; y <= max.y; ++y)
            for (let z = min.z; z <= max.z; ++z)
                if (length(div({x, y, z}, radius)) <= 1)
                    chunks.push({x, y, z});
    return chunks;
}

export function generateVoxelRect(rect) {
    const chunks = [], range = rect;
    const min = neg(range), max = range;
    for (let x = min.x; x <= max.x; ++x)
        for (let y = min.y; y <= max.y; ++y)
            for (let z = min.z; z <= max.z; ++z)
                chunks.push({x, y, z});
    return chunks;
}

/**
 * Generates a BlockVolume array by greedy meshing a list of chunks.
 * This algorithm works based on the assumption that the input mesh 
 * is ordered by the orthogonal axes, with precedence from x to y to z.
 * @param {ChunkMesh} mesh The mesh of voxels in ChunkMesh format.
 * @param {Number} size The maximum size of each individual mesh.
 * @returns {BlockVolume[]}
 */
export function greedyMesher(mesh, size = Infinity) {
    const meshes = [], {chunks} = mesh;
    while (mesh.chunks.length > 0) {
        const volume = {from: chunks[0], to: chunks[0]}, range = toVec(1);

        // X-Axis
        const inline_chunks_x = mesh.filter(
            {min: chunks[0].x, max: chunks[0].x + size - 1},
            {min: chunks[0].y, max: chunks[0].y},
            {min: chunks[0].z, max: chunks[0].z}
        );
        volume.to = inline_chunks_x[inline_chunks_x.length - 1];
        range.x = inline_chunks_x.length;
        for (const chunk of inline_chunks_x) mesh.remove(chunk);

        // Y-Axis
        let y = volume.from.y + 1;
        while (true) {
            const inline_chunks_y = mesh.filter(
                {min: volume.from.x, max: volume.to.x},
                {min: y, max: y},
                {min: volume.from.z, max: volume.to.z}
            );
            if (inline_chunks_y.length != range.x) break;
            range.y = y - volume.from.y + 1;
            if (range.x * range.y * range.z > size) break;
            volume.to = inline_chunks_y[inline_chunks_y.length - 1];
            for (const chunk of inline_chunks_y) mesh.remove(chunk);
            y++;
        }

        // Z-Axis
        let z = volume.from.z + 1;
        while (true) {
            const inline_chunks_z = mesh.filter(
                {min: volume.from.x, max: volume.to.x},
                {min: volume.from.y, max: volume.to.y},
                {min: z, max: z}
            );
            if (inline_chunks_z.length != range.x * range.y) break;
            range.z = z - volume.from.z + 1;
            if (range.x * range.y * range.z > size) break;
            volume.to = inline_chunks_z[inline_chunks_z.length - 1];
            for (const chunk of inline_chunks_z) mesh.remove(chunk);
            z++;
        }

        meshes.push(volume);
    }
    return meshes;
}