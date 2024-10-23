import { Vec3 } from "../@madlad3718/mcveclib";

/** @typedef {{x: Number, y: Number, z: Number}} Vector3 */

/**
 * Generates a Vector3 array in the shape of an ellipsoid from the center and radius.
 * @param {Vector3} radius 
 * @returns {Vector3[]}
 */
export function generateVoxelEllipsoid(radius) {
    const chunks = [];
    const min = Vec3.neg(radius), max = radius;
    for (let x = min.x; x <= max.x; ++x)
        for (let y = min.y; y <= max.y; ++y)
            for (let z = min.z; z <= max.z; ++z)
                if (Vec3.length(Vec3.div(Vec3.from(x, y, z), radius)) <= 1)
                    chunks.push(Vec3.from(x, y, z));
    return chunks;
}
