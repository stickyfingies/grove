# RPG Tools

RPG Tools is a set of small utilities for role-playing and similar games. Each submodule can be loaded individually (unless it depends on other module) and all of them support AMD, CommonJS and browser globals. This is not graphical engine in any sense, for one of those seek for ROT.js or PIXI.js, zounds of them out there.

## Modules

### `random`

Random number utilities.

* `int(min, max)` random.int returns random integer from `min` (including) up to `max` (not including), e.g. random.int(0, 2) will return 1's and 0's, but never 2. If `max` is omitted, then first argument is considered upper border and lower border is considered to be 0.
* `sign()` random.sign returns either 1 or -1.
* `key(objectOrArray)` returns random string key, if given an object, or numerical index, if given an array.
* `item(objectOrArray)` returns random item from given object or array.

### `Dice`

Dice representation. Understands following dice notations: 3d6 (3 6-sided dice), 2d-H (2 rolls of 6-sided die, take highest roll), 2d-L (same as previous, but take lowest), 2d4+2 (2 4-sided rolls +/- constant). Defaults to 1 roll of 6-sided die. Usage:

```js
    var die = new Dice('d');
    die.roll(); // 4
    die.roll(); // 6
    die.roll(); // 1
    die.roll(); // 1
```

This module depends on [`random`](#random).

### `requirements`

Contains one method: `met(wearer, requirements)`. Both arguments are objects. Each `requirements` field could be one of following:

1. array of possible values,
2. object with `min` and/or `max` properties (either numerical or string) or
3. primitive value.

Name of field can be pathkey, e.g. 'some.nested.property'.
If field with this name is missing from `wearer`, this too means requirements are not met.

Examples:

```js
    var slingRequirements = {
        race: ['elf', 'halfling'],
        str: {min: 5, max: 7},
        dex: 24
    };
    var goodHobbit = { race: 'halfling', str: 5, dex: 24};
    var nobleElf = { race: 'elf', str: 7, dex: 24};
    var dirtyOrk = { race: 'human', str: 6, dex: 24};

    assert.isTrue(requirements.met(goodHobbit, slingRequirements), 'good hobbit');
    assert.isTrue(requirements.met(nobleElf, slingRequirements), 'noble elf');
    assert.isFalse(requirements.met(dirtyHuman, slingRequirements), 'dirty ork');

    // nested
    var staffRequirements = {
        class: {
            subclass: ['elementalist', 'necromancer']
        }
    }
    var archMage = {
        class: {
            type: 'manaUser',
            subclass: 'elementalist'
        }
    }
    var apprentice = {
        class: {
            type: 'manaUser' // no subclass yet, too young
        }
    }
    assert.isTrue(requirements.met(archMage, staffRequirements));
    assert.isFalse(requirements.met(apprentice, staffRequirements));
```

See more examples in `test/requirements.test.js`.

This module depends on [`utils`](#utils).

### `modifiers`

* `apply(num, modifier)` applies some `modifier` to given number. Modifier can be either just number, e.g. -3, or percentage string, like '+12%'.

This module depends on [`utils`](#utils).

### `ProtoTree`

ProtoTree implements Prototype design pattern for usage in [data modelling](http://gameprogrammingpatterns.com/prototype.html#prototypes-for-data-modeling). This means you store your game data in nice, designer-friendly JSON (or maybe even in YAML or INI), where every item which wants to inherit something else, reference it in special `proto` field, but your game engine receives objects with all fields. Example:

```js
    var weaponTree = {
        '@weapon': {
            name: '-- Weapon --',
            description: 'If you see this, please contact developers.',
            type: 'weapon',
            icon: 'generic-weapon'
        },

        '@sword': {
            proto: '@weapon',
            name: '-- Sword --',
            slot: 'rightHand',
            icon: 'generic-sword'
        },

        twoHandedSword: {
            proto: '@sword',
            isTwoHanded: true,
            name: 'Two-handed sword',
            description: 'Very long and heavy sword',
            requirements: {
                'class': 'warrior'
            },
            ar: 15
        },

        flamberg: {
            proto: 'twoHandedSword',
            name: 'Flamberg',
            description: 'Flamberg is so-called flaming sword, with wavy blade.',
            requirements: {
                'class': 'warrior'
            },
            ar: 20
        },

        espada: {
            proto: '@sword',
            name: 'Espada',
            description: 'Espada',
            requirements: {
                'class': 'scout'
            },
            ar: 10,
            icon: 'generic-espada'
        },

        rapier: {
            proto: 'espada',
            name: 'Rapier',
            description: 'Rapier.',
            ar: 15,
            icon: 'rapier'
        },

        gladius: {
            proto: '@sword',
            name: 'Gladius',
            description: 'Short sword, lightweight and handy in close quarters.',
            requirements: {
                'class': 'bard'
            }
        }
    };
    var weapons = new ProtoTree(weaponTree);
    weapons.get('rapier').requirements.class; // 'scout'
    weapons.get('flamberg').isTwoHanded; // true
```

This module depends on [`utils`](#utils).

### `inventory`

Contains several method for inventory manipulation. Each of them accepts `attributes` object, consists at least of `equipped` object and `inventory` array. `equipped` object maps character slot names to items carried in those slots, and `inventory` is array of items.

Every method here can throw a lot of different exceptions, because many things can go wrong.

* `unEquip(attributes, slotName)` accepts `attributes` object and slotName string. Takes item from `equipped` and puts it to inventory.
* `equipFromInventory(attributes, index, slotName)` take item from inventory at given index and try to wear it to given slotName. If slotName is ommited it will be taken from item's `slotName` field. If there was something equipped, it will be `unEquip`ped first. Returns `attributes` back.
* `isWearable(attributes, index)` is item laying in inventory by given index can be weared? Return string with suitable slot name or throws error.

This module depends on [`requirements`](#requirements).

### Using submodules

If you're using AMD or CommonJS module loaders, all you need is to require needed module:

```js
// AMD way
    define(['rpg-tools/lib/inventory'], function (rpgToolsInventory) {
       // your code
    });

    // nodejs or browserify
    var rpgToolsInventory = require('rpg-tools/lib/inventory');
```

All dependencies will be handled, but if you're stuck in 2008, you should load dependencies manually:

```html
    <script src="js/libs/rpg-tools/lib/requirements"></script>
    <script src="js/libs/rpg-tools/lib/inventory"></script>
    <script>console.log(rpgTools.requirements, rpgTools.inventory)</script>
```

