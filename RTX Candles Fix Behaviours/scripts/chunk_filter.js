import { chunkToBlockVolume, createVolumeFromCenter, div, floor, withoutNamespace } from "./util";
import { BlockPermutation, BlockVolumeUtils, system, world } from "@minecraft/server";

const overworld = world.getDimension("overworld");

const checked = new Set;

/**
 * Filters the chunks surrounding every player for vanilla candles.
 */
export async function filterChunks() {
    for (const player of world.getAllPlayers()) {
        if (player.dimension.id != "minecraft:overworld") continue;
        const center_chunk = floor(div(player.location, 16));
        const chunk_span = {x: 3, y: 1, z: 3};
        const chunk_volume = createVolumeFromCenter(center_chunk, chunk_span);
        for (const chunk of BlockVolumeUtils.getBlockLocationIterator(chunk_volume)) {
            const {x,y,z} = chunk;
            if (checked.has([x,y,z].join(" ")) || chunk.y < -4 || chunk.y > 19) continue;
            await filterChunk(chunk);
        }
    }
    system.run(filterChunks);
}

/**
 * Replaces all vanilla candles with custom ones from within a given chunk.
 * @param {Vector3} chunk 
 * @returns {Promise}
 */
function filterChunk(chunk) {
    return new Promise(resolve => {
        const volume = chunkToBlockVolume(chunk);
        for (const location of BlockVolumeUtils.getBlockLocationIterator(volume)) {
            const block = overworld.getBlock(location);
            if (!(block?.typeId.endsWith("candle") && block.typeId.startsWith("minecraft:"))) continue;
            const typeId = "rtxfixes:" + withoutNamespace(block.typeId);
            const permutation = BlockPermutation.resolve(typeId, {
                "rtxfixes:candles": block.permutation.getState("candles"),
                "rtxfixes:lit": block.permutation.getState("lit")
            });
            block.setPermutation(permutation);
        }
        const {x,y,z} = chunk;
        resolve(checked.add([x,y,z].join(" ")));
    });
}