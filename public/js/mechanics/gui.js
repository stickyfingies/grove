var gui = function GUI(title, body, ...btns) {
    $('#gui').toggle(400);
    $('#gui-title').text(title);
    $('#gui-content').html(body);
    var btns_txt = '';
    for (var key in btns) {
        btns_txt += ('<button onclick=$("#gui").fadeOut(400); class="btn btn-default">' + btns[key].name + '</button>');
    }
    $('#gui-btns').html(btns_txt);
};
gui.quests = function () {
    var txt = '';
    for (var key in quests) {
        if (quests[key].completed) txt += '<s>';
        txt += '<h2>' + quests[key].name + '</h2><small>' + quests[key].description + '</small>';
        if (quests[key].completed) txt += '</s>';
    }
    gui('Quests', txt, {
        name: 'close',
        action: '$("#gui").fadeOut(400);'
    });
};
gui.inventory = function () {
    var txt = '';
    for (var key in player.inventory) {
        txt += '<h2>' + player.inventory[key] + '</h2>';
    }
    gui('Inventory', txt, {
        name: 'close',
        action: '$("#gui").fadeOut(400);'
    });
};

var hide = function Hide(elem) {
    $(elem).fadeOut(400);
};