import { BlockPermutation, ItemStack, ItemStartUseOnAfterEvent, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, system, world } from "@minecraft/server";
import { add, decrementStack, directionToVector, inSurvival, withoutNamespace } from "./util";

/**
 * Executes special logic on a candle placement event.
 * @param {ItemUseOnAfterEvent} event 
 */
export function placeCandle(event) {
    if (!event.itemStack.typeId.endsWith("candle")) return;
    const typeId = "rtxfixes:" + withoutNamespace(event.itemStack.typeId);
    const permutation = BlockPermutation.resolve(typeId);
    const location = add(event.block.location, directionToVector(event.blockFace));
    event.source.dimension.getBlock(location).setPermutation(permutation);
}

/**
 * Executes special logic on item use events.
 * @param {ItemUseOnBeforeEvent} event 
 */
export function useItem(event) {
    if (event.itemStack.typeId.endsWith("candle")) {
        if (event.block.typeId.endsWith("cake")) return createCandleCake(event);
        else return useCandle(event);
    }
    if (event.itemStack.typeId == "minecraft:flint_and_steel") return igniteCandle(event);
    if (event.itemStack.typeId == "minecraft:bucket") return useBucket(event);
}

/**
 * Creates a custom candle cake when a candle is placed on a cake.
 * @param {ItemUseOnBeforeEvent} event 
 */
function createCandleCake(event) {
    event.cancel = true;
    const typeId = "rtxfixes:" + withoutNamespace(event.itemStack.typeId) + "_cake";
    const permutation = BlockPermutation.resolve(typeId);
    system.run(() => {
        world.playSound("dig.candle", event.block.location);
        event.block.setPermutation(permutation);
        if (inSurvival(event.source)) decrementStack(event.source);
    });
}

/**
 * Prevents invalid uses of vanilla
 * candles with custom candles.
 * @param {ItemUseOnBeforeEvent} event 
 */
function useCandle(event) {
    if (withoutNamespace(event.itemStack.typeId) != withoutNamespace(event.block.typeId)) return;
    event.cancel = true;
    const candles = event.block.permutation.getState("rtxfixes:candles");
    if (candles == 3) return;
    const permutation = event.block.permutation.withState("rtxfixes:candles", candles + 1);
    system.run(() => {
        world.playSound("dig.candle", event.block.location);
        event.block.setPermutation(permutation);
        if (inSurvival(event.source)) decrementStack(event.source);
    });
}

/**
 * Handles flint and steel interactions with custom candles.
 * @param {ItemUseOnBeforeEvent} event 
 */
function igniteCandle(event) {
    if (event.block.permutation.getState("rtxfixes:lit") || event.block.permutation.getState("rtxfixes:waterlogged")) return;
    system.run(() => world.playSound("fire.ignite", event.block.location));
}

/**
 * Updates the waterlogged property on custom candles when they're drained.
 * @param {ItemUseOnBeforeEvent} event 
 */
function useBucket(event) {
    if (!event.block.typeId.endsWith("candle")) return;
    const permutation = event.block.permutation.withState("rtxfixes:waterlogged", false)
    system.run(() => event.block.setPermutation(permutation));
}

/**
 * Executes special logic upon interacting with a custom candle or candle cake.
 * @param {ItemStartUseOnAfterEvent} event 
 */
export function interactCandle(event) {
    if (event.itemStack) return;
    const { block } = event;
    if (block.typeId.endsWith("candle") || block.permutation.getState("rtxfixes:lit"))
        world.playSound("extinguish.candle", block.location);
    if (block.permutation.getState("rtxfixes:lit"))
        return block.setPermutation(block.permutation.withState("rtxfixes:lit", false));
    event.source.addEffect("saturation", 1, {amplifier: 3, showParticles: false});
    world.playSound("random.burp", block.location);
    const permutation = BlockPermutation.resolve("minecraft:cake", {"bite_counter": 1});
    const candleId = withoutNamespace(block.typeId).replace("_cake", "");
    block.setPermutation(permutation);
    if (inSurvival(event.source))
        event.source.dimension.spawnItem(new ItemStack(candleId), block.location);
}