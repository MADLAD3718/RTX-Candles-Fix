import { div, length, max, min, neg } from "../extensions/vectors";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */
/** @typedef {{min: Number, max: Number}} Range */

export class BlockVolume {
    /**
     * @param {Vector3} from 
     * @param {Vector3} to 
     */
    constructor(from, to) {
        this.from = min(from, to);
        this.to = max(from, to);
    }
    /**
     * A world block location that represents a corner in a 3D rectangle.
     * @type {Vector3}
     */
    from;
    /**
     * A world block location that represents the opposite corner in a 3D rectangle.
     * @type {Vector3}
     */
    to;
    /**
     * Fetches a list of block locations for all blocks within the volume.
     * @returns {Vector3[]}
     */
    getBlockLocations() {
        const locations = [];
        for (let i = this.from.x; i <= this.to.x; ++i)
        for (let j = this.from.y; j <= this.to.y; ++j)
        for (let k = this.from.z; k <= this.to.z; ++k)
            locations.push({x: i, y: j, z: k});
        return locations;
    }
}

/**
 * Generates a Vector3 array in the shape of an ellipsoid from the center and radius.
 * @param {Vector3} radius 
 * @returns {Vector3[]}
 */
export function generateVoxelEllipsoid(radius) {
    const chunks = [];
    const min = neg(radius), max = radius;
    for (let x = min.x; x <= max.x; ++x)
        for (let y = min.y; y <= max.y; ++y)
            for (let z = min.z; z <= max.z; ++z)
                if (length(div({x, y, z}, radius)) <= 1)
                    chunks.push({x, y, z});
    return chunks;
}
