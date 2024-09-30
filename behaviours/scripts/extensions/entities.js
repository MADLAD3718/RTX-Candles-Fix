import { Entity, EntityComponentTypes, Player } from "@minecraft/server";

Object.defineProperties(Entity.prototype, {
    health: {
        get() {
            return this.getComponent(EntityComponentTypes.Health)?.currentValue;
        },
        set(v) {
            this.getComponent(EntityComponentTypes.Health)?.setCurrentValue(v);
        }
    },
    maxHealth: {
        get() {
            return this.getComponent(EntityComponentTypes.Health)?.effectiveMax;
        }
    },
    inventory: {
        get() {
            return this.getComponent(EntityComponentTypes.Inventory);
        }
    },
    equipment: {
        get() {
            return this.getComponent(EntityComponentTypes.Equippable);
        }
    },
    isLeashed: {
        get() {
            const leashable = this.getComponent(EntityComponentTypes.Leashable);
            return leashable?.isLeashed ?? false;
        }
    },
    seatCount: {
        get() {
            const rideable = this.getComponent(EntityComponentTypes.Rideable);
            return rideable?.seatCount ?? 0;
        }
    },
    projectile: {
        get() {
            return this.getComponent(EntityComponentTypes.Projectile);
        }
    },
    entityRidingOn: {
        get() {
            return this.getComponent(EntityComponentTypes.Riding)?.entityRidingOn;
        }
    },
    locationXZ: {
        get() {
            return {x: this.location.x, z: this.location.z};
        }
    }
});

/** Thrown when an entity is missing a component whose values were accessed. */
class EntityMissingComponentError extends Error {
    /** @param {String} componentId The id of the missing component. */
    constructor(componentId) {
        super(`Entity does not have component "${componentId}".`);
    }
}

Entity.prototype.leashTo = function (leashHolder) {
    const leashable = this.getComponent(EntityComponentTypes.Leashable);
    if (!leashable) throw new EntityMissingComponentError(EntityComponentTypes.Leashable);

    return leashable.leashTo(leashHolder);
}

Entity.prototype.unleash = function () {
    const leashable = this.getComponent(EntityComponentTypes.Leashable);
    if (!leashable) throw new EntityMissingComponentError(EntityComponentTypes.Leashable);

    return leashable.unleash();
}

Entity.prototype.addRider = function (rider) {
    const rideable = this.getComponent(EntityComponentTypes.Rideable);
    if (!rideable) throw new EntityMissingComponentError(EntityComponentTypes.Rideable);

    return rideable.addRider(rider);
}

Entity.prototype.getRiders = function () {
    const rideable = this.getComponent(EntityComponentTypes.Rideable);
    if (!rideable) throw new EntityMissingComponentError(EntityComponentTypes.Rideable);

    return rideable.getRiders();
}

Entity.prototype.ejectRider = function (rider) {
    const rideable = this.getComponent(EntityComponentTypes.Rideable);
    if (!rideable) throw new EntityMissingComponentError(EntityComponentTypes.Rideable);

    return rideable.ejectRider(rider);
}

Entity.prototype.ejectRiders = function () {
    const rideable = this.getComponent(EntityComponentTypes.Rideable);
    if (!rideable) throw new EntityMissingComponentError(EntityComponentTypes.Rideable);

    return rideable.ejectRiders();
}

Entity.prototype.getBlockStandingOn = function () {
    if (!this.isOnGround) return this.dimension.getBlock(this.location);
    return this.dimension.getTopmostBlock(this.locationXZ);
}

Player.prototype.applyImpulse = function (vector) {
    const {x, y, z} = vector;
    this.applyKnockback(x, z, Math.hypot(x, z), y);
}

Player.prototype.stopSound = function (sound = "") {
    this.runCommand("stopsound @s " + sound);
}

Player.prototype.getHeldSlot = function () {
    return this.inventory.container.getSlot(this.selectedSlotIndex);
}
