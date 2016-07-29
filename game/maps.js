var maps = []
maps.tutorial = [[{
    name: "Harvest the Glowbulb",
    desc: "Click the Glowbulb plants in the garden to harvest them.",
    pg: 1,
    how: ["harvest", "glowbulb"]
}, {
    name: "Eat the Glowbulb",
    desc: "Press 'I' toeat the glowbulb and glow!",
    pg: 2,
    how: ["use", "glowbulb"]
}, {
    name: "Head to the Forest",
    desc: "Good!  Now, use your newfound glowing ability to navigate your way up to the portal.",
    pg: 3,
    how: ["activate", "portal"]
}], ["floatingHouse", {
    x: -25,
    y: 0,
    z: 0
}], ["island", {
    x: 0,
    y: -7.5,
    z: 100
}], ["island", {
    x: -10,
    y: -7.5,
    z: 150
}], ["island", {
    x: -20,
    y: -7.5,
    z: 200
}], ["island", {
    x: -40,
    y: -7.5,
    z: 240
}], ["island", {
    x: -80,
    y: -7.5,
    z: 270
}], ["island", {
    x: -120,
    y: -7.5,
    z: 305
}], ["island", {
    x: -140,
    y: 2.5,
    z: 345
}], ["island", {
    x: -140,
    y: 12.5,
    z: 385
}], ["island", {
    x: -150,
    y: 22.5,
    z: 425
}], ["island", {
    x: -160,
    y: 32.5,
    z: 465
}], ["island", {
    x: -190,
    y: 42.5,
    z: 485
}], ["island", {
    x: -230,
    y: 52.5,
    z: 495
}], ["island", {
    x: -260,
    y: 62.5,
    z: 485
}], ["island", {
    x: -225,
    y: -7.5,
    z: 385,
    scale: 100
}], ["tree", {
    x: -200,
    y: 85,
    z: 400
}], ["portal", {
    x: -250,
    y: 100,
    z: 310,
    s: 20,
    map: 'helmfirth'
}]], maps.helmfirth = [[{
    name: "ooooooodle",
    desc: "crazzzzzz",
    pg: 1,
    how: ["harvest", "glowbulb"]
}], ["spawnAltarStone", {
    x: 0,
    y: 0,
    z: 0
}], ['cube', {
    x: 0,
    y: -3,
    z: 0,
    l: 2000,
    w: 1000,
    h: 5,
    map: 'img/grass.png',
    rw: 20,
    rl: 20
}], [
    'house1', {
        x: 100,
        y: 0,
        z: 100
    }
], [
    'house1', {
        x: 100,
        y: 0,
        z: 200
    }
], [
    'house1', {
        x: 100,
        y: 0,
        z: 300
    }
], [
    'house1', {
        x: 100,
        y: 0,
        z: 400
    }
], [
    'house1', {
        x: 100,
        y: 0,
        z: 500
    }
]], module.exports = maps