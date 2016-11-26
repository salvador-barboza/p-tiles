let synth;
let two;

let	keyHeight;
let keyWidth;
//Changs with screen size
let rowsInScreen = 4;

/**
*Row object queue.
*/
let rows = [];
let rowQueue;

let score =  0;
let scoreText;

const NOTES = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];

const KEYS_PER_ROW = 4;

const KEY_PRESSED_FILL = '#546E7A';
const KEY_EMPTY_FILL = '#FFFFFF';
const KEY_ACTIVE_FILL = '#333333'


let start = function() {
	const makeRow = (y) => {
		//puts the key n times keyHeight from the top. Because y position is measured in the center,
		//so half the height is added.
		const keyX = (n) => {
			return (n * keyWidth) + (keyWidth / 2);
		}

		// nth - 1 row of screen + half the height of the key.
		let rowY =  (y - 1) * keyHeight + (.5 * keyHeight);

		let keys = [];
		for(let i = 0; i < KEYS_PER_ROW; i++) {
			keys.push(two.makeRectangle(keyX(i), rowY, keyWidth,  keyHeight));
		}

		let group = two.makeGroup(keys);

		group.stroke = '#B0BEC5';
		group.fill = KEY_EMPTY_FILL;
		group.linewidth = 2;

		return group;
	}

	score = 0;
	rowQueue = [];
	rows = [];
	two.clear();
	// add an extra row to appear offscreen
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
	two.play();
}

let gameLoop = function() {
	const moveRow = function(row, rowNumber) {
		const INITIAL_SPEED = 10;
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
	for (let i = 0; i < rows.length; i++) {
		moveRow(rows[i], i);
	}

	if(rowQueue.length > rowsInScreen + 1)
		two.pause();
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

//todo: mover esto a un sola sola funcion con bind y unbind.
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
  checkRow(keys[e.key]);
});

window.addEventListener('keyup', function(e) {
	keyWasReleased = true;
});

let tap = function(e) {
	const stage = document
		.querySelector('#stage')
		.getBoundingClientRect();

	if( e.clientX < stage.left || e.clientX > stage.right)
		return;

	let screenSector = Math.floor((e.clientX - stage.left )/ (two.width / KEYS_PER_ROW));
  checkRow(screenSector);
};

window.addEventListener('load', function() {
	synth = new Tone.PolySynth().toMaster();

	const stage = document.querySelector('#stage');
	const card = document.querySelector('#card');
	stage.addEventListener('click', tap);

	if (stage.offsetHeight < 600)
		rowsInScreen = 3;

	two = new Two({width: stage.offsetWidth, height: stage.offsetHeight})
		.appendTo(document.querySelector('#stage'))
		.bind('update', gameLoop)
		//time to reset the game
		.bind('pause', () => {
			card.show().then(() => {
				console.log(score);
				start();
			});
		})

	keyWidth = two.width / KEYS_PER_ROW;
	keyHeight = two.height / rowsInScreen;
	start();
});
