import { BlockPermutation, GameMode, ItemStack, world } from "@minecraft/server";
import { withoutNamespace } from "./util";
import { add, Unit } from "./extensions/vectors";

/** @type {import("@minecraft/server").BlockCustomComponent} */
export const candleCakeComponent = {
    onPlayerInteract: event => {
        const {player, block} = event;
        const {permutation, dimension} = block;
        const slot = player.getHeldSlot();
        const states = permutation.getAllStates();
        switch (slot.getItem()?.typeId) {
            case "minecraft:flint_and_steel": 
                if (states["rtx:lit"]) return;
                block.setPermutation(permutation.withState("rtx:lit", true));
                dimension.playSound("fire.ignite", block.center());
                dimension.spawnParticle(
                    "minecraft:candle_flame_particle",
                    add(block.bottomCenter(), Unit.Up));
                if (player.getGameMode() !== GameMode.creative)
                    if (slot.damageSlot()) dimension.playSound("random.break", block.center());
                break;
            default:
                player.addEffect("saturation", 1, {
                    amplifier: 1,
                    showParticles: false
                });
                dimension.playSound("random.burp", block.center());
                const drop = new ItemStack(`minecraft:${withoutNamespace(block.typeId.replace("_cake", ""))}`);
                block.setPermutation(BlockPermutation.resolve(
                    "minecraft:cake", { "bite_counter": 1 }
                ));
                dimension.spawnItem(drop, block.center());
                break;
        }
    },
    onTick: event => {
        const {block} = event, {permutation, dimension} = block;
        if (permutation.getState("rtx:lit")) {
            const location = add(block.bottomCenter(), Unit.Up);
            dimension.spawnParticle("minecraft:candle_flame_particle", location);
            dimension.spawnParticle("minecraft:basic_smoke_particle", location);
        }
    }
}

world.afterEvents.itemUseOn.subscribe(event => {
    const {block} = event;
    if (!/^minecraft:.*candle_cake$/.test(block.typeId)) return;

    block.setType(`rtx:${withoutNamespace(block.typeId)}`);
});
