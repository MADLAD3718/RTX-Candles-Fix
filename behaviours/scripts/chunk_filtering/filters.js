import { BlockPermutation } from "@minecraft/server";

/** @type {Map<BlockPermutation, BlockPermutation} */
export const Filters = new Map;
// Normal
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 0, "lit": false}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 0, "rtx:lit": false})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 1, "lit": false}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 1, "rtx:lit": false})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 2, "lit": false}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 2, "rtx:lit": false})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 3, "lit": false}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 3, "rtx:lit": false})
);

Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 0, "lit": true}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 0, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 1, "lit": true}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 1, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 2, "lit": true}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 2, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:candle", {"candles": 3, "lit": true}),
    BlockPermutation.resolve("rtx:candle", {"rtx:candles": 3, "rtx:lit": true})
);

// White
Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 0, "lit": false}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 0, "rtx:lit": false})
);
Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 3, "lit": false}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 3, "rtx:lit": false})
);

Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 0, "lit": true}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 0, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 1, "lit": true}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 1, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 2, "lit": true}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 2, "rtx:lit": true})
);
Filters.set(
    BlockPermutation.resolve("minecraft:white_candle", {"candles": 3, "lit": true}),
    BlockPermutation.resolve("rtx:white_candle", {"rtx:candles": 3, "rtx:lit": true})
);