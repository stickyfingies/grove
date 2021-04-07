export const init = (globals, player) => {
  $('#gui').toggle();
  $('#underlay').toggle();
  $('#load-play-btn').hide();
  $('#gui-exit').click(() => {
    $('#gui').toggle();
    $('#underlay').toggle();
  });
  $(window).on('keydown', (e) => {
    if (String.fromCharCode(e.keyCode) == 'Q') {
      stats(player, globals);
    }
  });

  // draw the GUI
  setInterval(() => draw(player), 100);
};

export const quests = () => {
  $('#quest-alert > p').text('Getting Skills');
  $('#quest-alert > small').text('Use the Alchemy Table to make a health potion.');
  setTimeout(() => {
    $('#quest-alert').animate({
      right: '-280px',
    }, 1000);
  }, 10000);
};

export const stats = (player, globals) => {
  $('#gui').show();
  $('#underlay').show();
  $('#gui-title').text('');
  $('#gui-content').html(`<h1 style=margin-top:21.5%;text-align:center;width:90%;color:white>
    <span id=gui-q>quests</span> | <span id=gui-i>inventory</span> | <span id=gui-m>map</span> | <span id=gui-p>player</span>
    </h1>`);

  //

  $('#gui-q').click(() => {
    $('#gui-title').html('Quests');
    $('#gui-content').html('questy stuff');
  });
  $('#gui-i').click(() => {
    $('#gui-title').html('Inventory');
    $('#gui-content').html('');
    player.inventory.forEach((item) => {
      $(document.createElement('img'))
        .attr('src', `/img/icons/${item.icon}`)
        .attr('title', item.name)
        .css('margin', '10px')
        .width(50)
        .height(50)
        .click(function (e) {
          if (player.hotbar.list.indexOf(item) == -1) {
            player.hotbar.list.push(item);
            $(this).css('background-color', 'lightblue');
          } else {
            player.hotbar.list.splice(player.hotbar.list.indexOf(item), 1);
            $(this).css('background-color', 'transparent');
          }
        })
        .css('background-color', player.hotbar.list.indexOf(item) !== -1 ? 'lightblue' : 'transparent')
        .appendTo($('#gui-content'));
    });
  });
  $('#gui-m').click(() => {
    $('#gui-title').html('Map');
  });
  $('#gui-p').click(() => {
    $('#gui-title').html('Player');
    $('#gui-content').html('<div id=st></div>');
    skill('strength')
      .current(1)
      .max(3)
      .pos(100, 150)
      .sprite(8, 10)
      .sprites({
        2: [8, 10],
        3: [8, 3],
      })
      .name('Strength')
      .hint('This determines how much you can hold, etc.')
      .hint('You are a weakling.', 1)
      .hint('You can beat up your stepmother now.', 2)
      .hint('Hercules is a mouse compared to you.', 3)
      .$('#st');
    skill('fury')
      .current(1)
      .max(3)
      .pos(200, 150)
      .sprite(2, 6)
      .sprites({
        2: [2, 6],
        3: [2, 6],
      })
      .name('Internal Fury')
      .hint('How much you are able to mash up enemies :)')
      .hint('Not a man to be trifled with.', 1)
      .hint('Everyone stops talking when you are around.', 2)
      .hint('They say you can start fires with your eyes...', 3)
      .$('#st');

    skilltree.language.reqTitle = 'For level {0} you would need:';
    skilltree.language.req = '<h4>{1}</h4><ul class="reqs commamenu">{0}</ul>',
    skilltree.language.levelTitle = 'Level {1} {0}';
    skilltree.init($('#st'));
  });
  if ($('#gui-content').is(':visible')) document.exitPointerLock();
};

// HUD stuff

const canvas = document.getElementById('hp-bar');
canvas.setAttribute('width', window.innerWidth * 0.7);
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 40;

function draw(player) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // XP BAR
  let grd = ctx.createLinearGradient(0, 0, (player.xp.xp / player.xp.max) * canvas.width, 0);
  grd.addColorStop(0, 'darkgreen');
  grd.addColorStop(0.75, 'darkgreen');
  grd.addColorStop(0.95, 'lime');
  grd.addColorStop(1, 'lime');
  ctx.fillStyle = grd;
  ctx.fillRect(0, canvas.height - 10, (player.xp.xp / player.xp.max) * canvas.width, 10);

  // HEALTH BAR
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, canvas.height - radius, radius, 0, 2 * Math.PI, false);
  ctx.clip(); // Make a clipping region out of this path
  // instead of filling the arc, we fill a variable-sized rectangle
  // that is clipped to the arc
  ctx.fillStyle = '#cc0000';
  // We want the rectangle to get progressively taller starting from the bottom
  // There are two ways to do this:
  // 1. Change the Y value and height every time
  // 2. Using a negative height
  // I'm lazy, so we're going with 2
  ctx.fillRect(centerX - radius, canvas.height, radius * 2, -(player.hp.val / player.hp.max) * radius * 2);
  ctx.restore(); // reset clipping region

  // HEALTH BAR BORDER
  ctx.beginPath();
  ctx.arc(centerX, canvas.height - radius, radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = 6;
  grd = ctx.createLinearGradient(0, 0, 0, radius * 2);
  grd.addColorStop(0, 'grey');
  grd.addColorStop(1, 'black');
  ctx.strokeStyle = grd;
  ctx.stroke();

  // HEALTH TEXT
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${player.hp.val > 0 ? Math.floor(player.hp.val) : 0} HP`, centerX, canvas.height - radius);

  // HOTBAR ITEMS
  const xvals = [-100, -170, -240, -310, -380, 100, 170, 240, 310, 380];
  const alias = [5, 4, 3, 2, 1, 6, 7, 8, 9];
  for (let i = 0; i < xvals.length; i++) {
    ctx.strokeStyle = '#000';
    if (alias[player.hotbar.selected] == i && Math.abs(xvals[i]) !== 100) ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX + xvals[i] - 25, canvas.height - 70, 50, 50);
    if (xvals[i] == 100) {
      ctx.fillText('LH', centerX - 100, canvas.height - radius);
      ctx.fillText('RH', centerX + 100, canvas.height - radius);
    }
  }
  window.lee = player.hotbar.list.length; // for debugging purposes
  for (let i = 0; i < player.hotbar.list.length; i++) {
    if (/sword/gi.test(player.hotbar.list[i].name)) {
      const img = new Image();
      img.src = '/img/icons/two-handed-sword.svg';
      ctx.drawImage(img, centerX + xvals[alias[i + 1]] - 25, canvas.height - 70, 50, 50);
    }
  }
}

// var pie = function(Flavour, Suuculence) {
//     if (Flavour) {
//         return "I can taste the world";
//     }
// };
