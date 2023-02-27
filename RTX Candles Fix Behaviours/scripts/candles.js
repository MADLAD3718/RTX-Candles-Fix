import { world, Direction, Dimension, BlockLocation, MinecraftBlockTypes, Location, ItemStartUseOnEvent, ItemUseOnEvent, MinecraftEffectTypes, ItemStack, Items, system } from "@minecraft/server";

const CHUNK_SIZE = 16;
const checkedChunks = new Set();

world.events.beforeItemUseOn.subscribe(event => {
    const source = event.source;
    const interactionBlock = source.dimension.getBlock(event.blockLocation);

    if (event.item.typeId === "minecraft:flint_and_steel") {
        let blockLocation = event.blockLocation;
        switch (event.blockFace) {
            case (Direction.up):
                blockLocation.y++;
                break;
            case (Direction.down):
                blockLocation.y--;
                break;
            case (Direction.north):
                blockLocation.z--;
                break;
            case (Direction.south):
                blockLocation.z++;
                break;
            case (Direction.east):
                blockLocation.x++;
                break;
            case (Direction.west):
                blockLocation.x--;
        }
        if (source.dimension.getBlock(blockLocation).hasTag("rtx_candle") === true && interactionBlock.hasTag("rtx_candle") === false) {
            event.cancel = true;
        }
        return;
    }

    if (event.item.typeId.includes("candle") === false) return;
    const itemType = event.item.typeId.slice(event.item.typeId.indexOf(":") + 1);
    if (interactionBlock.typeId === "minecraft:cake") {
        if (interactionBlock.permutation.getProperty("bite_counter").value === 0) {
            event.cancel = true;
            const permutation = MinecraftBlockTypes.get(`rtxfixes:${itemType}_cake`).createDefaultBlockPermutation();
            interactionBlock.setPermutation(permutation);
            playSound("use.candle", event.blockLocation);
            source.runCommandAsync(`testfor @s[m=creative]`).catch(() => {
                const itemStack = source.getComponent("minecraft:inventory").container.getItem(source.selectedSlot);
                itemStack.amount--;
                source.getComponent("minecraft:inventory").container.setItem(source.selectedSlot, itemStack);
            });
        } else if (event.blockFace === Direction.up || event.blockFace === Direction.down || source.isSneaking) event.cancel = true;
        return;
    }
    const candleType = interactionBlock.typeId.slice(interactionBlock.typeId.indexOf(":") + 1);
    if (source.isSneaking === true) {
        event.cancel = true;
        return;
    }
    let blockLocation = event.blockLocation;
    const state = interactionBlock.permutation.getProperty("rtxfixes:state")?.value ?? 4;
    if (interactionBlock.hasTag("rtx_candle") === true && event.blockFace === Direction.up) {
        if (state >= 3) event.cancel = true;
        else if (candleType !== itemType) event.cancel = true;
        return;
    }
    switch (event.blockFace) {
        case (Direction.up):
            blockLocation.y++;
            break;
        case (Direction.down):
            blockLocation.y--;
            break;
        case (Direction.south):
            if (state >= 3 || candleType !== itemType) blockLocation.z++;
            break;
        case (Direction.north):
            if (state >= 3 || candleType !== itemType) blockLocation.z--;
            break;
        case (Direction.east):
            if (state >= 3 || candleType !== itemType) blockLocation.x++;
            break;
        case (Direction.west):
            if (state >= 3 || candleType !== itemType) blockLocation.x--;
    }
    if (source.dimension.getBlock(blockLocation).hasTag("rtx_candle") === true) return;
    event.cancel = true;
    const supportBlock = source.dimension.getBlock(new BlockLocation(blockLocation.x, blockLocation.y - 1, blockLocation.z))
    if (supportBlock.typeId === "minecraft:air" || supportBlock.typeId === "minecraft:water" || source.dimension.getBlock(blockLocation).typeId === "minecraft:water" || source.dimension.getBlock(blockLocation).typeId !== "minecraft:air" || supportBlock.typeId.includes("candle")) return;
    playSound("use.candle", event.blockLocation);
    source.runCommandAsync(`testfor @s[m=creative]`).catch(() => {
        const itemStack = source.getComponent("minecraft:inventory").container.getItem(source.selectedSlot);
        itemStack.amount--;
        source.getComponent("minecraft:inventory").container.setItem(source.selectedSlot, itemStack);
    });
    const permutation = MinecraftBlockTypes.get(`rtxfixes:${itemType}`).createDefaultBlockPermutation();
    source.dimension.getBlock(blockLocation).setPermutation(permutation);
})

world.events.worldInitialize.subscribe(() => {
    checkedChunks.clear();
})

system.run(() => {
    checkSurroundingChunks();
})

async function checkSurroundingChunks() {
    for (const player of world.getPlayers()) {
        for (let relChunkX = -3; relChunkX <= 3; relChunkX++) {
            for (let relChunkY = -1; relChunkY <= 1; relChunkY++) {
                for (let relChunkZ = -3; relChunkZ <= 3; relChunkZ++) {
                    const chunkX = Math.floor(player.location.x / CHUNK_SIZE) + relChunkX;
                    const chunkY = Math.floor(player.location.y / CHUNK_SIZE) + relChunkY;
                    const chunkZ = Math.floor(player.location.z / CHUNK_SIZE) + relChunkZ;
                    if (checkedChunks.has(`(${chunkX},${chunkY},${chunkZ})`)) continue;
                    await checkChunk(player.dimension, chunkX, chunkY, chunkZ).catch(e => console.warn(e));
                }
            }
        }
    }
    system.run(() => {
        checkSurroundingChunks();
    })
}

/**
 * Checks a given chunk for vanilla candles and replaces them with custom ones.
 * @param {Dimension} dimension The dimension the chunk is in.
 * @param {number} x The x coordinate of the origin of the chunk.
 * @param {number} y The y coordinate of the origin of the chunk.
 * @param {number} z The z coordinate of the origin of the chunk.
 */
function checkChunk(dimension, x, y, z) {
    return new Promise(resolve => {
        const from = new BlockLocation(x * CHUNK_SIZE, y * CHUNK_SIZE, z * CHUNK_SIZE);
        const to = new BlockLocation(from.x + 15, from.y + 15, from.z + 15);
        for (const blockLocation of from.blocksBetween(to)) {
            if (blockLocation.y < -64 || blockLocation.y >= 320) continue;
            const block = dimension.getBlock(blockLocation);
            if (block?.typeId.includes("minecraft:") !== true || block.typeId.includes("candle") === false) continue;
            const block_type = block.typeId.slice(block.typeId.indexOf(":") + 1);
            const permutation = MinecraftBlockTypes.get(`rtxfixes:${block_type}`).createDefaultBlockPermutation();
            if (!block_type.includes("cake")) permutation.getProperty("rtxfixes:state").value = block.permutation.getProperty("candles").value;
            permutation.getProperty("rtxfixes:lit").value = block.permutation.getProperty("lit").value;
            block.setPermutation(permutation);
        }
        checkedChunks.add(`(${x},${y},${z})`);
        resolve();
    })
}

world.events.itemStartUseOn.subscribe(handleSounds);

let waterlogPermutation;
let rayBlock;
world.events.itemUseOn.subscribe(consumeCake);
world.events.itemUseOn.subscribe(handleWaterlog);
world.events.itemStopUseOn.subscribe(setWaterlog);

/**
 * Handles player eating a candle cake in an itemUseOn event.
 * @param {ItemUseOnEvent} event The event where the player ate some candle cake.
 */
function consumeCake(event) {
    const interactionBlock = event.source.dimension.getBlock(event.blockLocation);
    if (event.item.typeId !== "" || !interactionBlock.hasTag("rtx_candle_cake") || interactionBlock.permutation.getProperty("rtxfixes:lit")?.value !== false) return;
    event.source.addEffect(MinecraftEffectTypes.saturation, 1, 1, false);
    const candleType = interactionBlock.typeId.slice(interactionBlock.typeId.indexOf(":") + 1, interactionBlock.typeId.indexOf("_cake"));
    event.source.dimension.spawnItem(new ItemStack(Items.get(`minecraft:${candleType}`)), new Location(event.blockLocation.x + 0.5, event.blockLocation.y + 0.5, event.blockLocation.z + 0.5));
    const permutation = MinecraftBlockTypes.cake.createDefaultBlockPermutation();
    permutation.getProperty("bite_counter").value = 1;
    interactionBlock.setPermutation(permutation);
}

/**
 * Handles waterlog specific actions based on an itemUseOn event.
 * @param {ItemUseOnEvent} event The event used to determine what waterlog actions should be taken.
 */
function handleWaterlog(event) {
    if (event.item.typeId !== "minecraft:bucket") return;
    const rayOptions = {
        includeLiquidBlocks: true
    }
    rayBlock = event.source.getBlockFromViewDirection(rayOptions);
    if (!rayBlock.permutation.getProperty("rtxfixes:waterlogged")?.value) return;
    waterlogPermutation = rayBlock.permutation;
    waterlogPermutation.getProperty("rtxfixes:waterlogged").value = false;
}

/**
 * Sets the pending unwaterlogged block permutation upon an itemStopUseOn event.
 */
function setWaterlog() {
    if (!waterlogPermutation) return;
    rayBlock.setPermutation(waterlogPermutation);
    waterlogPermutation = undefined;
}

/**
 * Determines and plays sounds according to an itemStartUseOn event.
 * @param {ItemStartUseOnEvent} event The event used to determine which sound to play.
 */
function handleSounds(event) {
    const interactionBlock = event.source.dimension.getBlock(event.blockLocation);
    if (interactionBlock.hasTag("rtx_candle_cake")) {
        if (interactionBlock.permutation.getProperty("rtxfixes:lit").value === false && event.item.typeId === "minecraft:flint_and_steel") playSound("fire.ignite", event.blockLocation);
        if (interactionBlock.permutation.getProperty("rtxfixes:lit").value === true && event.item.typeId === "") playSound("extinguish.candle", event.blockLocation);
        if (interactionBlock.permutation.getProperty("rtxfixes:lit").value === false && event.item.typeId === "") playSound("random.burp", event.blockLocation);
        return;
    }
    if (!interactionBlock.hasTag("rtx_candle")) return;
    const candleType = interactionBlock.typeId.slice(interactionBlock.typeId.indexOf(":") + 1);
    if (event.item.typeId.slice(event.item.typeId.indexOf(":") + 1) === candleType && interactionBlock.permutation.getProperty("rtxfixes:state").value < 3 && event.source.isSneaking === false) playSound("use.candle", event.blockLocation);
    if (interactionBlock.permutation.getProperty("rtxfixes:lit").value === false && interactionBlock.permutation.getProperty("rtxfixes:waterlogged").value === false) {
        if (event.item.typeId === "minecraft:flint_and_steel" || event.item.typeId === "minecraft:fire_charge") playSound("fire.ignite", event.blockLocation);
        if (event.item.typeId === "minecraft:fire_charge") playSound("mob.ghast.fireball", event.blockLocation);
    }
    if (event.item.typeId === "" && interactionBlock.permutation.getProperty("rtxfixes:lit").value === true) playSound("extinguish.candle", event.blockLocation);
    if (event.item.typeId === "minecraft:water_bucket" && interactionBlock.permutation.getProperty("rtxfixes:waterlogged").value === false) {
        if (interactionBlock.permutation.getProperty("rtxfixes:lit").value === true) playSound("extinguish.candle", event.blockLocation);
        playSound("bucket.empty_water", event.blockLocation);
    }
}

/**
 * Plays a sound from a given block in the world.
 * @param {string} soundId The id of the sound to play.
 * @param {BlockLocation} blockLocation The block location of the sound.
 */
function playSound(soundId, blockLocation) {
    const soundOptions = {
        location: new Location(blockLocation.x + 0.5, blockLocation.y + 0.5, blockLocation.z + 0.5)
    }
    world.playSound(soundId, soundOptions);
}