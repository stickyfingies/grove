export type Item = {
    name: string;
    damage: number;
    ranged?: boolean;
};

const inventory: Item[] = [];
let equippedIndex = 0;

inventory.push({ name: 'Fists', damage: 3 });

export function addToInventory(item: Item, equip = false) {
    inventory.push(item);
    if (equip) equippedIndex = inventory.length - 1;
}

export function equip(index: number) {
    // assert index <= inventory.length;
    equippedIndex = index;
}

export function getEquippedItem(): Item | undefined { return inventory[equippedIndex]; }