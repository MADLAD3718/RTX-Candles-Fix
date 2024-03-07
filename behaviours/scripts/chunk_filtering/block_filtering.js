import { BlockPermutation, Dimension, system, world } from "@minecraft/server";
import { ChunkMesh, generateVoxelEllipsoid, generateVoxelSphere, greedyMesher } from "./filter_utils";
import { add, div, floor, mul, stringifyVec, toVec } from "../math/vectors";
import { Filters } from "./filters";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */
/** @typedef {{from: Vector3, to: Vector3}} BlockVolume */

const overworld = world.getDimension("overworld");
const checked = new Set;

/* Maximum 8 chunks in one single Dimension.fillBlocks() call, so run 
 * whatever block volume shape through a greedy meshing algorithm that 
 * prioritizes areas of larger size with a maximum size of 8 chunks.
 * 
 * When checking radii of chunks the only thing that needs to be stored 
 * as completed is the center of the volume.
 */
const voxel_list = generateVoxelEllipsoid({x: 4, y: 2, z: 4});
const greey_meshes = greedyMesher(new ChunkMesh(voxel_list), 4);

export async function filterChunks() {
    for (const player of overworld.getPlayers()) {
        const center_chunk = floor(div(player.location, 16));
        if (checked.has(stringifyVec(center_chunk))) continue;
        // console.warn("Replacing Blocks...");

        for (const volume of greey_meshes) {
            const from_chunk = add(volume.from, center_chunk);
            const to_chunk = add(volume.to, center_chunk);
            if (from_chunk.y < -4 || to_chunk.y > 19) continue;
            const begin = mul(from_chunk, 16);
            const end = add(mul(to_chunk, 16), toVec(15));
            await Promise.all([isLoaded(overworld, begin), isLoaded(overworld, end)]);
            replaceBlocks(overworld, begin, end, Filters);
        }

        checked.add(stringifyVec(center_chunk));
    }
    system.runTimeout(filterChunks, 8);
}

/**
 * Replaces blocks within an area by the list of key/value blockpermuation replacement pairs.
 * @param {Dimension} dimension 
 * @param {Vector3} begin 
 * @param {Vector3} end 
 * @param {Map<BlockPermutation, BlockPermutation>} replacements 
 */
function replaceBlocks(dimension, begin, end, replacements) {
    for (const [perm1, perm2] of replacements.entries()) {
        dimension.fillBlocks(begin, end, perm2, {matchingBlock: perm1});
    }
}

/**
 * 
 * @param {Dimension} dimension 
 * @param {Vector3} location 
 */
async function isLoaded(dimension, location) {
    return new Promise(resolve => {
        if (dimension.getBlock(location)) return resolve();
        const task = system.runInterval(() => {
            if (dimension.getBlock(location)) {
                system.clearRun(task);
                return resolve();
            }
        });
    });
}