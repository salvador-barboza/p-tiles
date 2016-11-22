//libs
var two;
//key height used to draw
var game = {
	keyHeight: 0,
	keyWidth: 0,
	keyIndexQueue: [],
	rowQueue: [],
	score: 0,
	synth: null
};

var keyWasReleased = true;

const NOTES = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];
const KEYS_PER_ROW = 4;
const KEY_PRESSED_FILL = 'red';
let rowsInScreen = 4;

makeRow = function(y) {
	game.keyWidth = two.width / KEYS_PER_ROW;
	//puts the key n times keyHeight from the top. Because y position is measured in the center,
	//so half the height is added.

	let reativeKeyX = (n) => {
		return (n * game.keyWidth) + (game.keyWidth / 2);
	}

	// nth - 1 row of screen + half the height of the key.
	let rowY =  (y - 1) * game.keyHeight + (.5 * game.keyHeight);

	let key1 = two.makeRectangle(reativeKeyX(0), rowY, game.keyWidth,  game.keyHeight);
	var key2 = two.makeRectangle(reativeKeyX(1), rowY,  game.keyWidth,  game.keyHeight);
	var key3 = two.makeRectangle(reativeKeyX(2), rowY,  game.keyWidth,  game.keyHeight);
	var key4 = two.makeRectangle(reativeKeyX(3), rowY,  game.keyWidth,  game.keyHeight);

	let group = two.makeGroup(key1, key2, key3, key4);

	group.stroke = '#BBB';
	group.fill = '#FFFFFF';
	group.linewidth = 1;

	return group;
}

window.addEventListener('load', function() {
	const TEXT_POSITION_Y = 100;
	let rows = [];
	//init synth
	game.synth = new Tone.Synth().toMaster();
	//init two
	two = new Two({fullscreen: true}).appendTo(document.querySelector('#draw-shapes'));
	game.keyHeight = two.height / rowsInScreen;

	//add an extra row to appear offscreen
	for (let i = 0; i < rowsInScreen + 1; i++) {
		rows.push(makeRow(i));
	}

	let scoreText = new Two.Text(0, two.width / 2, TEXT_POSITION_Y, {
		size: 100,
		fill: '#fff',
		stroke: '#000',
		linewidth: 4
	});
	two.add(scoreText);

	two.bind('update', function(frameCount) {
		scoreText.value = game.score;
		for (let i = 0; i < rows.length; i++) {
			refreshRow(rows[i], i);
		}
	}).play();
});

refreshRow = function(row, rowNumber) {
	const INITIAL_LEVEL = 5;
	let ydif =  INITIAL_LEVEL + game.score / 10;

	var rowY = row.getBoundingClientRect().bottom;

	let yLimit = two.height + game.keyHeight;
	let keyY = rowNumber * game.keyHeight;

	let targetTranslationY =  0;

	if (rowY > yLimit) {
		row.translation.set(row.translation.x, -keyY);

		for (let i = 0; i < row.children.length; i++)
			row.children[i].fill = '#FFFFFF';


		var blackKey = Math.floor(Math.random() * (4));
		row.children[blackKey].fill = '#333333';

		game.rowQueue.push(row);
		game.keyIndexQueue.push(blackKey);

		if (game.rowQueue.length === 5)
		  two.pause();
	}
	row.translation.set(row.translation.x, row.translation.y + ydif);
}

check = function(i) {
  if (game.keyIndexQueue[0] == i) {
    var note = NOTES[Math.floor(Math.random() * (6))] + (Math.floor(Math.random() * (4)) + 3);
    game.synth.triggerAttackRelease(note, "8n");
    game.score++;

    var row = game.rowQueue[0];
    row.children[game.keyIndexQueue[0]].fill = KEY_PRESSED_FILL;
    game.rowQueue.shift();
    game.keyIndexQueue.shift();

  }
}

window.onkeydown = function(e) {
	if (!keyWasReleased)
		return;

	var keys = {
		'a': 0,
		's': 1,
		'd': 2,
		'f': 3
	}

	if (e.key == 'p') {
		two.pause();
	}
  keyWasReleased = false;
  check(keys[e.key]);
}
window.onkeyup = function(e) {
	keyWasReleased = true;
}
window.onclick = function(e) {
	let screenSector = Math.floor(e.clientX / (two.width / 4));
  check(screenSector);
}
