import { Block, BlockPermutation, GameMode, ItemStack, system, world } from "@minecraft/server";
import { add, stringifyVec } from "./extensions/vectors";
import { withoutNamespace } from "./util";
import "./extensions/entities";
import "./extensions/classes";
import "./extensions/vectors";

/** @type {import("@minecraft/server").BlockCustomComponent} */
export const candleComponent = {
    onPlayerInteract: event => {
        const {player, block} = event;
        const {permutation, dimension} = block;
        const slot = player.getHeldSlot();
        const states = permutation.getAllStates();
        switch (slot.getItem()?.typeId) {
            case `minecraft:${withoutNamespace(block.typeId)}`:
                if (states["rtx:candles"] == 3) return;
                block.setPermutation(permutation.withState(
                    "rtx:candles", states["rtx:candles"] + 1));
                dimension.playSound("use.candle", block.center());
                if (states["rtx:lit"])
                    spawnParticles(block, "minecraft:candle_flame_particle");
                if (player.getGameMode() !== GameMode.creative) slot.decrementSlot();
                break;
            case "minecraft:flint_and_steel":
                if (states["rtx:lit"] || states["rtx:waterlogged"]) return;
                block.setPermutation(permutation.withState("rtx:lit", true));
                dimension.playSound("fire.ignite", block.center());
                spawnParticles(block, "minecraft:candle_flame_particle");
                if (player.getGameMode() !== GameMode.creative)
                    if (slot.damageSlot()) dimension.playSound("random.break", block.center());
                break;
            case "minecraft:water_bucket":
                const id = withoutNamespace(block.typeId);
                const structureId = `candles/${id}/${id}_waterlogged_${states["rtx:candles"]}`;
                world.structureManager.place(structureId, block.dimension, block.location);
                dimension.playSound("bucket.empty_water", block.center());
                if (player.getGameMode() == GameMode.creative) return;
                if (slot.amount == 1) slot.setItem(new ItemStack("minecraft:bucket"));
                else player.runCommand("loot give @s loot bucket mainhand");
                break;
            case "minecraft:bucket":
                block.setType("minecraft:air");
                block.setPermutation(permutation.withState("rtx:waterlogged", false));
                dimension.playSound("bucket.fill_water", block.center());
                if (player.getGameMode() == GameMode.creative) return;
                if (slot.amount == 1) slot.setItem(new ItemStack("minecraft:water_bucket"));
                else player.runCommand("loot give @s loot water_bucket mainhand");
                break;
            default:
                if (!states["rtx:lit"]) return;
                block.setPermutation(permutation.withState("rtx:lit", false));
                dimension.playSound("extinguish.candle", block.center());
                spawnParticles(block, "minecraft:basic_smoke_particle");
        }
    },
    onTick: event => {
        const {block} = event, {permutation} = block;
        if (permutation.getState("rtx:lit")) {
            spawnParticles(block, "minecraft:candle_flame_particle");
            spawnRandParticle(block, "minecraft:basic_smoke_particle");
        }
    }
}

/**
 * Spawns particles for the given candle block.
 * @param {Block} block A candle block.
 * @param {String} particle The identifier of the particle to spawn.
 */
function spawnParticles(block, particle) {
    const {dimension} = block, center = block.center();
    switch (block.permutation.getState("rtx:candles")) {
        case 0:
            dimension.spawnParticle(particle, center);
            break;
        case 1:
            dimension.spawnParticle(particle, 
                add(center, {x: 0.125, y: 0.0, z: 0.0}));
            dimension.spawnParticle(particle, 
                add(center, {x: -0.125, y: -0.0625, z: 0.0625}));
            break;
        case 2:
            dimension.spawnParticle(particle, 
                add(center, {x: 0.0625, y: 0.0, z: -0.0625}));
            dimension.spawnParticle(particle, 
                add(center, {x: -0.125, y: -0.0625, z: 0.0}));
            dimension.spawnParticle(particle, 
                add(center, {x: 0.0, y: -0.1875, z: 0.125}));
            break;
        case 3:
            dimension.spawnParticle(particle, 
                add(center, {x: 0.0625, y: 0.0, z: -0.125}));
            dimension.spawnParticle(particle, 
                add(center, {x: -0.125, y: -0.0625, z: -0.125}));
            dimension.spawnParticle(particle, 
                add(center, {x: -0.0625, y: -0.1875, z: 0.0625}));
            dimension.spawnParticle(particle, 
                add(center, {x: 0.125, y: -0.0625, z: 0.0625}));
            break;
    }
}

/**
 * Spawns a particle in a random candle position for the given candle block.
 * @param {Block} block A candle block.
 * @param {String} particle The identifier of the particle to spawn.
 */
function spawnRandParticle(block, particle) {
    const {dimension} = block, center = block.center();
    switch (block.permutation.getState("rtx:candles")) {
        case 0:
            dimension.spawnParticle(particle, center);
            break;
        case 1:
            if (Math.floor(2 * Math.random()))
                dimension.spawnParticle(particle, 
                    add(center, {x: 0.125, y: 0.0, z: 0.0}));
            else dimension.spawnParticle(particle, 
                add(center, {x: -0.125, y: -0.0625, z: 0.0625}));
            break;
        case 2:
            switch (Math.floor(3 * Math.random())) {
                case 0:
                    dimension.spawnParticle(particle, 
                        add(center, {x: 0.0625, y: 0.0, z: -0.0625}));
                    break;
                case 1:
                    dimension.spawnParticle(particle, 
                        add(center, {x: -0.125, y: -0.0625, z: 0.0}));
                    break;
                case 2:
                    dimension.spawnParticle(particle, 
                        add(center, {x: 0.0, y: -0.1875, z: 0.125}));
                    break;
            }
            break;
        case 3:
            switch (Math.floor(4 * Math.random())) {
                case 0:
                    dimension.spawnParticle(particle, 
                        add(center, {x: 0.0625, y: 0.0, z: -0.125}));
                    break;
                case 1:
                    dimension.spawnParticle(particle, 
                        add(center, {x: -0.125, y: -0.0625, z: -0.125}));
                    break;
                case 2:
                    dimension.spawnParticle(particle, 
                        add(center, {x: -0.0625, y: -0.1875, z: 0.0625}));
                    break;
                case 3:
                    dimension.spawnParticle(particle, 
                        add(center, {x: 0.125, y: -0.0625, z: 0.0625}));
                    break;
            }
            break;
    }
}

world.afterEvents.itemUseOn.subscribe(event => {
    const {itemStack, block} = event, {permutation} = block;
    if (itemStack.typeId !== "minecraft:bucket") return;
    if (!/^rtx:.*candle$/.test(block.typeId)) return;
    block.setPermutation(permutation.withState("rtx:waterlogged", false));
});

const candleIds = [
    "minecraft:candle",
    "minecraft:black_candle",
    "minecraft:blue_candle",
    "minecraft:brown_candle",
    "minecraft:cyan_candle",
    "minecraft:gray_candle",
    "minecraft:green_candle",
    "minecraft:light_blue_candle",
    "minecraft:light_gray_candle",
    "minecraft:lime_candle",
    "minecraft:magenta_candle",
    "minecraft:orange_candle",
    "minecraft:pink_candle",
    "minecraft:purple_candle",
    "minecraft:red_candle",
    "minecraft:white_candle",
    "minecraft:yellow_candle"
];

world.afterEvents.playerPlaceBlock.subscribe(
    event => replaceCandle(event.block), {blockTypes: candleIds});

/**
 * Replaces a vanilla candle with a custom one.
 * @param {Block} candle The vanilla candle to be replaced.
 */
export function replaceCandle(candle) {
    const {permutation} = candle;
    const states = permutation.getAllStates();
    candle.setPermutation(BlockPermutation.resolve(
        `rtx:${withoutNamespace(candle.typeId)}`,
        {
            "rtx:candles": states["candles"] ?? 1,
            "rtx:lit": states["lit"] ?? false
        }
    ));
}

const custom_block_ids = [
    "rtx:candle",
	"rtx:black_candle",
	"rtx:blue_candle",
	"rtx:brown_candle",
	"rtx:cyan_candle",
	"rtx:gray_candle",
	"rtx:green_candle",
	"rtx:light_blue_candle",
	"rtx:light_gray_candle",
	"rtx:lime_candle",
	"rtx:magenta_candle",
	"rtx:orange_candle",
	"rtx:pink_candle",
	"rtx:purple_candle",
	"rtx:red_candle",
	"rtx:white_candle",
	"rtx:yellow_candle",
	"rtx:candle_cake",
	"rtx:black_candle_cake",
	"rtx:blue_candle_cake",
	"rtx:brown_candle_cake",
	"rtx:cyan_candle_cake",
	"rtx:gray_candle_cake",
	"rtx:green_candle_cake",
	"rtx:light_blue_candle_cake",
	"rtx:light_gray_candle_cake",
	"rtx:lime_candle_cake",
	"rtx:magenta_candle_cake",
	"rtx:orange_candle_cake",
	"rtx:pink_candle_cake",
	"rtx:purple_candle_cake",
	"rtx:red_candle_cake",
	"rtx:white_candle_cake",
	"rtx:yellow_candle_cake"
];

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const {block, dimension, player} = event, {location} = block;
    event.cancel = true;
    system.run(() => {
        dimension.runCommand(`setblock ${stringifyVec(location)} air destroy`);
        if (player.getHeldSlot().damageSlot())
            dimension.playSound("random.break", player.getHeadLocation());
    });
}, {blockTypes: custom_block_ids});
