import "@minecraft/server";

declare module "@minecraft/server" {
    interface Dimension {
        /** Clones blocks from a volume to a target location. */
        clone(volume: BlockVolume, location: Vector3): void;
        /** Loads a strucutre with the given file path in the provided location. */
        loadStructure(path: string, location: Vector3): void;
        /** Plays a sound for all players within the dimension. */
        playSound(soundId: string, location: Vector3, soundOptions?: WorldSoundOptions): void;
        /** Returns a promise containing the block. Can resolve even if the block is in unloaded chunks. */
        getBlockAsync(location: Vector3): Promise<Block>;
    }
}