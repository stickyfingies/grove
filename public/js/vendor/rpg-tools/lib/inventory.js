(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define(['./requirements'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(require('./requirements'));
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.inventory = factory(root.rpgTools.requirements);
    }
}(this, function (requirements) {
    'use strict';

    /**
     * @typedef {Object} Item
     * @property {String} slot
     * @property {String} name
     * @property {Object} requirements
     */

    /**
     * @typedef {Object} Attributes
     * @property {Array.<Item>} inventory
     * @property {Object} equipped
     */

    function SlotNameError (slotName) {
        Error.call(this);
        this.message = 'No such slot: ' + slotName;
    }

    SlotNameError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: SlotNameError,
            writable: true,
            configurable: true
        }
    });

    function InventoryIndexError (index) {
        Error.call(this);
        this.message = 'Invalid inventory index: ' + index;
    }

    InventoryIndexError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: InventoryIndexError,
            writable: true,
            configurable: true
        }
    });

    function UnequippableItemError (itemName) {
        Error.call(this);
        this.message = 'Item "' + itemName + '" can not be equipped';
    }

    UnequippableItemError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: UnequippableItemError,
            writable: true,
            configurable: true
        }
    });

    function InvalidSlotError (itemSlot, slotName) {
        Error.call(this);
        this.message = 'Item intended for ' + itemSlot + ' and can not be equipped to ' + slotName;
    }

    InvalidSlotError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: InvalidSlotError,
            writable: true,
            configurable: true
        }
    });

    function RequirementsNotMetError () {
        Error.call(this);
        this.message = 'Item requirements not met';
    }

    RequirementsNotMetError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: RequirementsNotMetError,
            writable: true,
            configurable: true
        }
    });

    /**
     * Unequips item from given slotName
     * @param {Attributes} attributes which object should be operated. In Mongoose it this, in Backbone it's this.attributes
     * @param {String} slotName
     */
    function unEquip (attributes, slotName) {
        if (!(slotName in attributes.equipped)) {
            throw new SlotNameError(slotName);
        }

        if (attributes.equipped[slotName]) {
            attributes.inventory.push(attributes.equipped[slotName]);
        }

        attributes.equipped[slotName] = null;

        return attributes;
    }

    /**
     * Equips item which is located in inventory by given index
     * @param {Attributes} attributes which object should be operated.
     * @param {number} index inventory slot number
     * @param {String} slotName where to equip
     */
    function equipFromInventory (attributes, index, slotName) {
        if (index >= attributes.inventory.length) {
            throw new InventoryIndexError(index);
        }

        var item = attributes.inventory[index];

        if (!slotName) {
            slotName = item.slot;
        }

        if (!slotName) {
            throw new UnequippableItemError(item.name);
        }

        if (!(slotName in attributes.equipped)) {
            throw new SlotNameError(slotName);
        }

        if (item.slot !== slotName) {
            throw new InvalidSlotError(item.slot, slotName);
        }

        if (!requirements.met(attributes, item.requirements)) {
            throw new RequirementsNotMetError();
        }

        if (attributes.equipped[slotName]) {
            unEquip(attributes, slotName);
        }

        attributes.inventory.splice(index, 1);
        attributes.equipped[slotName] = item;

        return attributes;
    }

    /**
     * Given index of item, returns list of possible slots
     * @param {Attributes} attributes
     * @param {number} index
     * @return {String}
     */
    function isWearable (attributes, index) {
        if (index >= attributes.inventory.length) {
            throw new InventoryIndexError(index);
        }

        var item = attributes.inventory[index];

        if (!requirements.met(attributes, item.requirements)) {
            throw new RequirementsNotMetError();
        }

        var slotName = item.slot;

        if (!slotName) {
            throw new UnequippableItemError(item.name);
        }

        return slotName;
    }

    var exports = {
        unEquip: unEquip,
        equipFromInventory: equipFromInventory,
        isWearable: isWearable
    };

    return exports;
}));