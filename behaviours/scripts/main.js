import { candleCakeComponent } from "./candle_cakes";
import { startFilter } from "./block_filter/filter";
import { candleComponent } from "./candles";
import { world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(event => {
    const {blockComponentRegistry} = event;
    blockComponentRegistry.registerCustomComponent("rtx:candle", candleComponent);
    blockComponentRegistry.registerCustomComponent("rtx:candle_cake", candleCakeComponent);
});

startFilter();
