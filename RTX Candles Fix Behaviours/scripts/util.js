/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */
/** @typedef {{from: Vector3, to: Vector3}} BlockVolume */

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
 * Returns the vector subtraction `u` - `v`.
 * @param {Vector3} u 
 * @param {Vector3} v 
 * @returns {Vector3}
 */
export function sub(u, v) {
    return {
        x: u.x - v.x,
        y: u.y - v.y,
        z: u.z - v.z
    }
}

/**
 * Returns the component-wise multiplication of `u` and `v`.
 * @param {Vector3} u 
 * @param {Vector3 | Number} v 
 * @returns {Vector3}
 */
export function mul(u, v) {
    if (typeof v == "number") return {
        x: u.x * v,
        y: u.y * v,
        z: u.z * v
    }
    return {
        x: u.x * v.x,
        y: u.y * v.y,
        z: u.z * v.z
    }
}

/**
 * Returns the component-wise division of `u` and `v`.
 * @param {Vector3} u 
 * @param {Vector3 | Number} v 
 * @returns {Vector3}
 */
export function div(u, v) {
    if (typeof v == "number") return {
        x: u.x / v,
        y: u.y / v,
        z: u.z / v
    }
    return {
        x: u.x / v.x,
        y: u.y / v.y,
        z: u.z / v.z
    }
}

/**
 * Floors all the components of `v`.
 * @param {Vector3} v 
 * @returns {Vector3}
 */
export function floor(v) {
    return {
        x: Math.floor(v.x),
        y: Math.floor(v.y),
        z: Math.floor(v.z)
    }
}

/**
 * Returns a `Vector3` with `x` in each component.
 * @param {Number} x 
 * @returns {Vector3}
 */
export function toVec3(x) {
    return {
        x: x,
        y: x,
        z: x
    }
}

/**
 * Creates a cube shaped block volume based on a center and span from center point.
 * @param {Vector3} center 
 * @param {Vector3} span 
 * @returns {BlockVolume}
 */
export function createVolumeFromCenter(center, span) {
    return {
        from: sub(center, span),
        to: add(center, span)
    }
}

/**
 * Returns a block volume containing all blocks in a given chunk.
 * @param {Vector3} chunk 
 * @returns {BlockVolume}
 */
export function chunkToBlockVolume(chunk) {
    const origin = mul(chunk, 16);
    return {
        from: origin,
        to: add(origin, toVec3(15))
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