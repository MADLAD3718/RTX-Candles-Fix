import { Dimension, system } from "@minecraft/server";
import { stringifyVec } from "../math/vectors";

Dimension.prototype.loadStructure = function (path, location) {
    this.runCommandAsync(`structure load "mystructure:${path}" ${stringifyVec(location)}`);
}

Dimension.prototype.playSound = function (soundId, location, soundOptions) {
    this.runCommandAsync(`playsound ${soundId} @a ${stringifyVec(location)} ${soundOptions?.volume ?? 1.0} ${soundOptions?.pitch ?? 1.0}`);
}

Dimension.prototype.getBlockAsync = async function (location) {
    return new Promise(resolve => {
        let block = this.getBlock(location);
        if (block) return resolve(block);
        this.runCommand(`tickingarea add ${stringifyVec(location)} ${stringifyVec(location)}`);
        if (block = this.getBlock(location)) return resolve(block);
        const task = system.runInterval(() => {
            if (block = this.getBlock(location)) {
                system.clearRun(task);
                return resolve(block);
            }
        });
    }).finally(() => {
        this.runCommand(`tickingarea remove ${stringifyVec(location)}`);
    });
}