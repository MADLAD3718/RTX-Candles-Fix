import { TicksPerSecond, system, world } from "@minecraft/server";
import { placeCandle, unwaterlogCandle, waterlogCandle } from "./candles";
import { filterChunks } from "./chunk_filtering/block_filtering";
import { withoutNamespace } from "./util";
import "./extensions/export";

world.beforeEvents.itemUseOn.subscribe(event => {
    const {block, itemStack, blockFace} = event;
    if (!itemStack.typeId.endsWith("candle")) return;
    if (!block.typeId.endsWith("candle")) return;
    if (blockFace == "Up" && event.source.isSneaking) event.cancel = true;
    if (withoutNamespace(block.typeId) == withoutNamespace(itemStack.typeId))
        if (block.permutation.getState("rtx:candles") < 3) return;
    if (blockFace == "Up") event.cancel = true;
});

world.afterEvents.itemUseOn.subscribe(event => {
    const {block, itemStack} = event;
    if (!block.typeId.endsWith("candle")) return;
    if (itemStack.typeId == "minecraft:bucket") unwaterlogCandle(event);
    if (itemStack.typeId == "minecraft:water_bucket") waterlogCandle(event);
});

world.afterEvents.playerPlaceBlock.subscribe(event => {
    if (event.block.typeId.endsWith("candle")) placeCandle(event);
});

world.afterEvents.worldInitialize.subscribe(() => {
    system.runTimeout(filterChunks, TicksPerSecond);
});