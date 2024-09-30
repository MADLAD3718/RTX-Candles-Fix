import "@minecraft/server"

declare module "@minecraft/server" {
    interface Entity {
        /** The current health of this entity. */
        health: number;
        /** The maximum health of this entity. */
        readonly maxHealth: number;
        /** This entity's inventory properties. */
        readonly inventory?: EntityInventoryComponent;
        /** This entity's equipment slots. */
        readonly equipment?: EntityEquippableComponent;
        /** Returns true if the entity is leashed. */
        readonly isLeashed: boolean;
        /**
         * Leashes this entity to another entity.
         * @param leashHolder The entity to leash this entity to.
         */
        leashTo(leashHolder: Entity): void;
        /** Unleashes this entity if it is leashed to another entity. */
        unleash(): void;
        /** Number of seats for riders defined for this entity. */
        readonly seatCount: number;
        /**
         * Adds an entity to this entity as a rider.
         * @param rider Entity that will become the rider of this entity.
         * @returns True if the rider entity was successfully added.
         */
        addRider(rider: Entity): boolean;
        /** Gets a list of the all the entities currently riding this entity. */
        getRiders(): Entity[];
        /**
         * Ejects the specified rider of this entity.
         * @param rider Entity that should be ejected from this entity.
         */
        ejectRider(rider: Entity): void;
        /** Ejects all riders of this entity. */
        ejectRiders(): void;
        /** This entity's projectile component. */
        readonly projectile?: EntityProjectileComponent;
        /** The entity this entity is currently riding on. */
        readonly entityRidingOn?: Entity;
        /** The XZ coordinates of this entity. */
        readonly locationXZ: VectorXZ;
        /** Returns the block this entity is standing on, if they are on the ground. */
        getBlockStandingOn(): Block;
    }
    interface Player {
        /** Stops a specified sound. If no sound is specified all sounds are stopped. */
        stopSound(sound?: string): void;
        /** Returns the item slot this player is currently holding. */
        getHeldSlot(): ContainerSlot | undefined;
    }
}
