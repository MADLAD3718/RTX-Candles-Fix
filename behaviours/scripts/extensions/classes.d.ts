import "@minecraft/server"

declare module "@minecraft/server" {
    interface Container {
        /**
         * Returns the index of the first item in the container where predicate is
         * true, and -1 otherwise.
         * @param predicate Called once for each item of the container, in ascending
         * order, until it returns true. If an item is found, findIndex immediately
         * returns that item index. Otherwise, findIndex returns -1.
         */
        findIndex(predicate: (item?: ContainerSlot | ItemStack) => boolean): number;
        /**
         * Returns the first item slot in the container where predicate is true,
         * and undefined otherwise.
         * @param predicate Called once for each item of the container, in ascending
         * order, until it returns true. If an item is found, findSlot immediately
         * returns that item. Otherwise, findSlot returns undefined.
         */
        findSlot(predicate: (item?: ContainerSlot | ItemStack) => boolean): ContainerSlot | undefined;
    }
    interface ContainerSlot {
        /**
         * Decrements the item count in the container slot.
         * @param amount The amount of items to remove.
         * @throws This function can throw an error when attempting
         * to remove more items than available in the slot.
         */
        decrementSlot(amount?: number): void;
        /**
         * Decrements the durability of an item.
         * @returns `true` if the item was destroyed, else `false`.
         * @throws This function will throw an error if the item in 
         * the slot is lacking a durability component.
         */
        damageSlot(): boolean;
    }
}
