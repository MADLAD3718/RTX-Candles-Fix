import "@minecraft/server";

/** Contains properties describing the current input permissions of a player. */
class InputPermissions {
    /** The permission for camera input. */
    camera: boolean;
    /** The permission for movement input. */
    movement: boolean;
}

/** Represents the type of camera shake being applied. */
enum CameraShakeType {
    /** Shakes camera as though target's X, Y, and Z coordinates are changing rapidly. */
    Positional = "positional",
    /** Shakes camera as though target's X and Y rotation is changing rapidly. */
    Rotational = "rotational"
}

/** Contains methods for manipulating the camera shake applied to a player. */
class CameraShake {
    /** Stops the player camera's shaking. */
    stop(): void;
    /** Adds shaking to a player's camera with optional `intensity`, `time`, and `type`. */
    add(intensity?: number, time?: number, type?: CameraShakeType): void;
}

/** Contains methods for manipulating the fog stack, used to determine which fog setting to use at any given time in the game. */
class FogStack {
    /** Pushes a new fog setting onto the top of the Fog Command layers of the players' active fog stack. */
    add(id: string): void;
    /** Removes all matching fog settings that match the ID. */
    remove(id: string): void;
}

declare module "@minecraft/server" {
    interface Entity {
        /** The current health of the entity. */
        health: number;
        /** The maximum health of the entity. */
        readonly maxHealth: number;
        /** The entity's inventory. */
        readonly inventory?: EntityInventoryComponent;
        /** The entity's equipment. */
        readonly equipment?: EntityEquippableComponent;
        /** Removes all tags from an entity. */
        clearTags(): void;
        /** Removes all effects from an entity. */
        clearEffects(): void;
        /** Clears this entity's inventory. */
        clearInventory(): void;
        /** Transfers this entity's inventory to another entity. */
        transferInventory(entity: Entity): void;
    }
    interface Player {
        /** The current game mode of the player. */
        gameMode: GameMode;
        /** The player's inventory. */
        readonly inventory: EntityInventoryComponent;
        /** The player's equipment. */
        readonly equipment: EntityEquippableComponent;
        /** The current input permissions of the player. */
        readonly inputPermissions: InputPermissions;
        /** The player's camera shake configuration. */
        readonly cameraShake: CameraShake;
        /** The player's active fog stack. */
        readonly fogStack: FogStack;
        /** True if this player is currently holding an item, otherwise false. */
        readonly isHoldingItem: boolean;
        /** Stops all currently playing sounds for the player. */
        stopSound(): void;
    }
}