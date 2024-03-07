import { BlockPermutation, GameMode, ItemStack, ItemUseOnAfterEvent, PlayerPlaceBlockAfterEvent } from "@minecraft/server";
import { withoutNamespace } from "./util";

/**
 * Handles candle placement events, replacing vanilla candles with custom ones.
 * @param {PlayerPlaceBlockAfterEvent} event 
 */
export function placeCandle(event) {
    const { block } = event;
    const permutation = BlockPermutation.resolve("rtx:" + withoutNamespace(block.typeId));
    block.setPermutation(permutation);
}

/**
 * Handles candle waterlogging events, loading the corresponding custom structure.
 * @param {ItemUseOnAfterEvent} event 
 */
export function waterlogCandle(event) {
    const {block, itemStack, source} = event;
    const id = withoutNamespace(block.typeId);
    const candles = block.permutation.getState("rtx:candles");
    block.dimension.loadStructure(`candles/${id}/${id}_waterlogged_${candles}`, block.location);
    if (event.source.gameMode == GameMode.creative) return;
    if (itemStack.amount == 1)
        source.inventory.container.setItem(source.selectedSlot, new ItemStack("minecraft:bucket"));
    else source.runCommand("loot give @s loot bucket mainhand");
}

/**
 * Handles candle unwaterlogging events, altering the corresponding candle.
 * @param {ItemUseOnAfterEvent} event 
 */
export function unwaterlogCandle(event) {
    const {block} = event, {permutation} = block;
    block.setPermutation(permutation.withState("rtx:waterlogged", false));
}