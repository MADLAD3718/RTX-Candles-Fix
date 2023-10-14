import { interactCandle, placeCandle, useItem } from "./candles";
import { world } from "@minecraft/server";

world.afterEvents.itemUseOn.subscribe(placeCandle);
world.beforeEvents.itemUseOn.subscribe(useItem);
world.afterEvents.itemStartUseOn.subscribe(interactCandle);