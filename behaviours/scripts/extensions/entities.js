import { Entity, EntityEquippableComponent, EntityHealthComponent, EntityInventoryComponent, EquipmentSlot, GameMode, Player, TicksPerSecond } from "@minecraft/server";

Object.defineProperties(Entity.prototype, {
    health: {
        get() {
            return this.getComponent(EntityHealthComponent.componentId)?.currentValue;
        },
        set(v) {
            this.getComponent(EntityHealthComponent.componentId)?.setCurrentValue(v);
        }
    },
    maxHealth: {
        get() {
            return this.getComponent(EntityHealthComponent.componentId)?.effectiveMax;
        }
    },
    inventory: {
        get() {
            return this.getComponent(EntityInventoryComponent.componentId);
        }
    },
    equipment: {
        get() {
            return this.getComponent(EntityEquippableComponent.componentId);
        }
    }
});

Entity.prototype.clearTags = function () {
    for (const tag of this.getTags())
        this.removeTag(tag);
}

Entity.prototype.clearEffects = function () {
    for (const effect of this.getEffects())
        this.removeEffect(effect.typeId);
}

Entity.prototype.clearInventory = function () {
    this.inventory?.container.clearAll();
    for (const slot in EquipmentSlot)
        this.equipment?.getEquipmentSlot(slot).setItem();
}

Entity.prototype.transferInventory = function (entity) {
    const other = entity.inventory?.container;
    if (!other) return;
    this.equipment?.transfer(other);
    this.inventory?.container.transfer(other);
}

export const CameraShakeType = Object.freeze({
    Positional: 'positional',
    Rotational: 'rotational'
});

class CameraShake {
    #player;
    constructor(player) {
        this.#player = player;
    }
    stop() {
        this.#player.runCommand("camerashake stop @s");
    }
    add(intensity = 0.5, time = TicksPerSecond, type = CameraShakeType.Positional) {
        this.#player.runCommand(`camerashake add @s ${intensity} ${time / TicksPerSecond} ${type}`);
    }
}

class InputPermissions {
    #player;
    constructor(player) {
        this.#player = player;
    }
    get camera() {
        return this.#player.runCommand("testfor @s[haspermission={camera=enabled}]").successCount == 1;
    }
    set camera(b) {
        this.#player.runCommand(`inputpermission set @s camera ${b ? "enabled" : "disabled"}`);
    }
    get movement() {
        return this.#player.runCommand("testfor @s[haspermission={movement=enabled}]").successCount == 1; 
    }
    set movement(b) {
        this.#player.runCommand(`inputpermission set @s movement ${b ? "enabled" : "disabled"}`);
    }
}

class FogStack {
    #player;
    constructor(player) {
        this.#player = player;
    }
    add(id) {
        this.#player.runCommand(`fog @s push ${id} ${id}`);
    }
    remove(id) {
        this.#player.runCommand(`fog @s remove ${id}`);
    }
}

Object.defineProperties(Player.prototype, {
    gameMode: {
        get() {
            return Object.values(GameMode).find(g => this.matches({gameMode: g}));
        },
        set(g) {
            this.runCommand("gamemode " + g);
        }
    },
    inputPermissions: {
        get() {
            return new InputPermissions(this);
        }
    },
    cameraShake: {
        get() {
            return new CameraShake(this);
        }
    },
    fogStack: {
        get() {
            return new FogStack(this);
        }
    },
    isHoldingItem: {
        get() {
            return this.inventory.container.getItem(this.selectedSlot) != undefined;
        }
    }
});

Player.prototype.applyImpulse = function (vector) {
    const {x,y,z} = vector;
    this.applyKnockback(x, z, Math.hypot(x, z), y);
}

Player.prototype.clearVelocity = function () {
    this.teleport(this.location);
}

Player.prototype.stopSound = function () {
    this.runCommand("stopsound @s");
}