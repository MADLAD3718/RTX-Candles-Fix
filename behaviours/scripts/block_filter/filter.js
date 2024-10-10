import { add, div, floor, mul, stringifyVec, toVec } from "../extensions/vectors";
import { BlockPermutation, Dimension, system, world } from "@minecraft/server";
import { BlockVolume, generateVoxelEllipsoid } from "./util";
import { withoutNamespace } from "../util";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */
/** @typedef {{from: Vector3, to: Vector3}} BlockVolume */

const chunks = new Set, centers = new Set;

/* Maximum 8 chunks in one single Dimension.fillBlocks() call, so run 
 * whatever block volume shape through a greedy meshing algorithm that 
 * prioritizes areas of larger size with a maximum size of 8 chunks.
 * 
 * When checking radii of chunks the only thing that needs to be stored 
 * as completed is the center of the volume.
 */
const range = generateVoxelEllipsoid({x: 4, y: 2, z: 4});
/** @type {Map<number, number>} */
const jobIds = new Map;

export function startFilter() {
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const {dimension, location} = player;
            const center = floor(div(location, 16));
            if (centers.has(stringifyVec(center))) continue;
            centers.add(stringifyVec(center));
            if (center.y < -4 || center.y > 19) continue;

            system.clearJob(jobIds.get(player.id) ?? 0);
            jobIds.set(player.id, system.runJob(replaceCandles(dimension, center)));
        }
    });
}

/**
 * Replaces all candles with custom ones in a chunk range surrounding
 * a center chunk. Is of generator type for use with `system.runJob`.
 * @param {Dimension} dimension The dimension the chunks reside in.
 * @param {Vector3} center The center chunk within the chunk range.
 */
function* replaceCandles(dimension, center) {
    for (const offset of range) {
        const chunk = add(center, offset);
        if (chunks.has(stringifyVec(chunk))) continue;
        chunks.add(stringifyVec(chunk));
        if (chunk.y < -4 || chunk.y > 19) continue;

        const begin = mul(chunk, 16), end = add(begin, toVec(15));
        const volume = new BlockVolume(begin, end);
        for (const location of volume.getBlockLocations()) {
            const block = dimension.getBlock(location);

            if (/^minecraft:.*candle$/.test(block?.typeId)) {
                const states = block.permutation.getAllStates();
                block.setPermutation(BlockPermutation.resolve(
                    `rtx:${withoutNamespace(block.typeId)}`, {
                        "rtx:candles": states["candles"],
                        "rtx:lit": states["lit"],
                        "rtx:waterlogged": block.isLiquid
                    }
                ));
            } else if (/^minecraft:.*candle_cake$/.test(block?.typeId)) {
                const states = block.permutation.getAllStates();
                block.setPermutation(BlockPermutation.resolve(
                    `rtx:${withoutNamespace(block.typeId)}`,
                    { "rtx:lit": states["lit"] }
                ));
            }
            yield;
        }
        yield;
    }
    return;
}
