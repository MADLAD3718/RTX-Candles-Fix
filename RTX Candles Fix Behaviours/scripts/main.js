import { interactCandle, placeCandle, useItem } from "./candles";
import { system, world } from "@minecraft/server";
import { filterChunks } from "./chunk_filter";

world.afterEvents.itemUseOn.subscribe(placeCandle);
world.beforeEvents.itemUseOn.subscribe(useItem);
world.afterEvents.itemStartUseOn.subscribe(interactCandle);

system.run(filterChunks);