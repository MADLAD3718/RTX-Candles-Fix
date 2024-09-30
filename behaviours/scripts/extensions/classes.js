import { Container, ContainerSlot, ItemComponentTypes } from "@minecraft/server";
import "./items";

Container.prototype.findIndex = function (predicate) {
    for (let i = 0; i < this.size; ++i) {
        const item = this.getItem(i);
        if (predicate(item)) return i;
    }
    return -1;
}

Container.prototype.findSlot = function (predicate) {
    for (let i = 0; i < this.size; ++i) {
        const slot = this.getItem(i);
        if (predicate(slot)) return this.getSlot(i);
    }
    return undefined;
}

ContainerSlot.prototype.decrementSlot = function (amount = 1) {
    if (this.amount < amount)
        throw new Error("Cannot remove more items than slot amount.");
    if (this.amount > amount) this.amount -= amount;
    else this.setItem();
}

/** Thrown when an item is missing a component whose values were accessed. */
class ItemMissingComponentError extends Error {
    /** @param {String} componentId The id of the missing component. */
    constructor(componentId) {
        super(`Item does not have component "${componentId}".`);
    }
}

ContainerSlot.prototype.damageSlot = function () {
    const item = this.getItem();
    if (!item.durability)
        throw new ItemMissingComponentError(ItemComponentTypes.Durability);

    const level = item.enchantments.getEnchantment("unbreaking")?.level ?? 0;
    if (Math.random() >= 1 / (level + 1)) return;
    if (item.durability.damage == item.durability.maxDurability) {
        this.setItem();
        return true;
    }        
    item.durability.damage++;
    this.setItem(item);
    return false;
}
