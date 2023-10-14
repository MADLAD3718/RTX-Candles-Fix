/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */

import { Direction, EntityInventoryComponent, Player } from "@minecraft/server";

/**
 * Returns a substring of the id without the namespace.
 * @param {String} id 
 * @returns {String}
 */
export function withoutNamespace(id) {
    return id.substring(id.indexOf(":") + 1);
}

/**
 * Determines if a given player is in survival.
 * @param {Player} player 
 * @return {Boolean}
 */
export function inSurvival(player) {
    return player.runCommand("testfor @s[m=s]").successCount == 1;
}

/**
 * Decrements the currently held itemstack of a given player.
 * @param {Player} player 
 */
export function decrementStack(player) {
    /** @type {EntityInventoryComponent} */
    const inventory = player.getComponent("minecraft:inventory");
    const held_item = inventory.container.getSlot(player.selectedSlot);
    if (held_item.amount == 1) inventory.container.setItem(player.selectedSlot);
    else held_item.amount--;
}

/**
 * Returns the vector addition `u` + `v`.
 * @param {Vector3} u 
 * @param {Vector3} v 
 * @returns {Vector3}
 */
export function add(u, v) {
    return {
        x: u.x + v.x,
        y: u.y + v.y,
        z: u.z + v.z
    }
}

/**
 * Converts a `Direction` value to `Vector3`.
 * @param {Direction} direction 
 * @returns {Vector3}
 */
export function directionToVector(direction) {
    switch (direction) {
        case Direction.Up: return {x: 0, y: 1, z: 0};
        case Direction.Down: return {x: 0, y: -1, z: 0};
        case Direction.North: return {x: 0, y: 0, z: -1};
        case Direction.South: return {x: 0, y: 0, z: 1};
        case Direction.East: return {x: 1, y: 0, z: 0};
        case Direction.West: return {x: -1, y: 0, z: 0};
    }
}