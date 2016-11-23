let synth;
let two;

let	keyHeight;
let keyWidth;
//Changs with screen size
let rowsInScreen = 5;

/**
*Row object queue.
*/
let rowQueue;

let score =  0;
let scoreText;

const NOTES = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];

const KEYS_PER_ROW = 4;

const KEY_PRESSED_FILL = '#F99AAA';
const KEY_EMPTY_FILL = '#FFFFFF';
const KEY_ACTIVE_FILL = '#333333'


//Creates text and returns row group.
let initScene = function() {
	const makeRow = function(y) {
		//puts the key n times keyHeight from the top. Because y position is measured in the center,
		//so half the height is added.

		let relativeKeyX = (n) => {
			return (n * keyWidth) + (keyWidth / 2);
		}

		// nth - 1 row of screen + half the height of the key.
		let rowY =  (y - 1) * keyHeight + (.5 * keyHeight);

		let keys = [];
		for(let i = 0; i < KEYS_PER_ROW; i++) {
			keys.push(two.makeRectangle(relativeKeyX(i), rowY, keyWidth,  keyHeight));
		}

		let group = two.makeGroup(keys);

		// group.stroke = '#BBB';
		group.stroke = '#BBBBBB';
		group.fill = KEY_EMPTY_FILL;
		group.linewidth = 2;

		return group;
	}
	let rows = [];

	//add an extra row to appear offscreen
	for (let i = 0; i < rowsInScreen + 1; i++) {
		rows.push(makeRow(i));
	}

	const TEXT_POSITION_Y = 100;
	scoreText = new Two.Text(0, two.width / 2, TEXT_POSITION_Y, {
		size: 100,
		fill: '#fff',
		stroke: '#000',
		linewidth: 4
	});

	two.add(scoreText);

	return rows;
}
let moveRow = function(row, rowNumber) {
	const INITIAL_SPEED = 4;
	let deltaY = INITIAL_SPEED + score / 10;

	//the original position of the row.
	let initiallDistanceToOrigin = -1 * rowNumber * keyHeight;
	let rowY = row.getBoundingClientRect().bottom - keyHeight;


	row.translation.set(row.translation.x, row.translation.y + deltaY);

	if(rowY + deltaY >= two.height) {
		/**
		*substract what was left at the bottom to deltaY, so that it doesn't overlap with
		* the next row when relocationg at the top.
		*/
		let distanceToBottom = two.height - rowY;
		row.translation.set(row.translation.x, initiallDistanceToOrigin + (deltaY - distanceToBottom));

		for (let i = 0; i < row.children.length; i++)
			row.children[i].fill = KEY_EMPTY_FILL;

		let blackKey = Math.floor(Math.random() * (KEYS_PER_ROW));
		row.children[blackKey].fill = KEY_ACTIVE_FILL;

		rowQueue.push(row);
	}
}
let start = function(callback) {
	rowQueue = [];
	score = 0;

	two.clear();

	let rows = initScene();

	two.bind('update', function(frameCount) {
		for (let i = 0; i < rows.length; i++) {
			moveRow(rows[i], i);
		}

		if(rowQueue.length > rowsInScreen + 1) {
			two.pause();
			callback();
		}
	}).play();
}

let checkRow = function(keyIndex) {
	if (!rowQueue[0] || !rowQueue[0].children)
		return;

	let key = rowQueue[0].children[keyIndex];

	if (key.fill === KEY_ACTIVE_FILL) {
		// [note] + [octave]
    let note = NOTES[Math.floor(Math.random() * (6))] + (Math.floor(Math.random() * (4)) + 3);
    synth.triggerAttackRelease(note, "8n");

		scoreText.value = ++score;

		key.fill = KEY_PRESSED_FILL;
    rowQueue.shift();
  }
}

let keyWasReleased = true;
window.addEventListener('keypress', function(e) {
	if (!keyWasReleased)
		return;

	var keys = {
		'a': 0,
		's': 1,
		'd': 2,
		'f': 3
	}

	//wait for the key to go up again
  keyWasReleased = false;
  checkRow(keys[e.key]);
});
window.addEventListener('keyup', function(e) {
	keyWasReleased = true;
});
window.addEventListener('click', function(e) {
	let screenSector = Math.floor(e.clientX / (two.width / KEYS_PER_ROW));
  checkRow(screenSector);
});

window.addEventListener('load', function() {
	two = new Two({fullscreen: true}).appendTo(document.querySelector('#draw-shapes'));
	synth = new Tone.Synth().toMaster();

	keyWidth = two.width / KEYS_PER_ROW;
	keyHeight = two.height / rowsInScreen;


	start(() => {
		console.log('a');
	})

});
