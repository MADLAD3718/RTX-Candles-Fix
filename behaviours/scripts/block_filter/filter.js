import { BlockPermutation, BlockVolume, Dimension, system, world } from "@minecraft/server";
import { generateVoxelEllipsoid } from "./util";
import { Vec3 } from "../@madlad3718/mcveclib";
import { withoutNamespace } from "../util";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */

const chunks = new Set, centers = new Set;

const range = generateVoxelEllipsoid({x: 4, y: 2, z: 4});
/** @type {Map<number, number>} */
const jobIds = new Map;

export function startFilter() {
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const {dimension, location} = player;
            const {heightRange: range} = dimension;
            const center = Vec3.floor(Vec3.div(location, 16));
            if (centers.has(Vec3.toString(center))) continue;
            centers.add(Vec3.toString(center));
            if (center.y < range.min / 16 || center.y >= range.max / 16) continue;

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
    const {heightRange} = dimension;
    for (const offset of range) {
        const chunk = Vec3.add(center, offset);
        if (chunks.has(Vec3.toString(chunk))) continue;
        chunks.add(Vec3.toString(chunk));
        if (chunk.y < heightRange.min / 16 || chunk.y >= heightRange.max / 16) continue;

        const begin = Vec3.mul(chunk, 16), end = Vec3.add(begin, Vec3.from(15));
        const volume = new BlockVolume(begin, end);
        for (const location of volume.getBlockLocationIterator()) {
            const block = dimension.getBlock(location);

            if (/^minecraft:.*candle$/.test(block?.typeId)) {
                const states = block.permutation.getAllStates();
                block.setPermutation(BlockPermutation.resolve(
                    `rtx:${withoutNamespace(block.typeId)}`, {
                        "rtx:candles": states["candles"],
                        "rtx:lit": states["lit"]
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
