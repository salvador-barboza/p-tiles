let synth;
let two;

let keyHeight;
let keyWidth;
//Changs with screen size
let rowsInScreen = 5;

/**
 *Row object queue.
 */
let rows = [];
let rowQueue;

score = 0;
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
		let rowY = (y - 1) * keyHeight + (.5 * keyHeight);

		let keys = [];
		for (let i = 0; i < KEYS_PER_ROW; i++) {
			keys.push(two.makeRectangle(keyX(i), rowY, keyWidth, keyHeight));
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

		if (rowY + deltaY >= two.height) {
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

	if (rowQueue.length > rowsInScreen + 1) {
		rowQueue = []; //avoid unintentional sounds
		two.pause();
	}
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
document.addEventListener('keydown', function(e) {
	if (!keyWasReleased)
		return;

	var keys = {
		'65': 0,
		'83': 1,
		'68': 2,
		'70': 3
	}
	checkRow(keys[e.keyCode]);
	keyWasReleased = false;
});

window.addEventListener('keyup', function(e) {
	keyWasReleased = true;
});


(function(document) {
//TODO: Pasar todo a esto y hacer de la logica del juego un archivo aparte

let app = document.querySelector('#app');


app.tap = function(e) {
	const stage = document
		.querySelector('#stage')
		.getBoundingClientRect();

	if (e.clientX < stage.left || e.clientX > stage.right)
		return;

	let screenSector = Math.floor((e.clientX - stage.left) / (two.width / KEYS_PER_ROW));
	checkRow(screenSector);
}

app.pushScore = function() {
	let scoreEntry = {
		name: app.$.nameInput.value,
		score: score
	}

	firebase.database().ref('/score').push(scoreEntry).then(_ => {
				start();
	});
}

app.addEventListener('dom-change', function() {
	const stage = document.querySelector('#stage');
	const card = document.querySelector('#card');

	stage.addEventListener('click', app.tap);

	let maxScore;

	synth = new Tone.PolySynth().toMaster();
	two = new Two({
				width: stage.offsetWidth,
				height: stage.offsetHeight
			}).appendTo(document.querySelector('#stage'))
				.bind('update', gameLoop)
				.bind('pause', () => {
					app.isTop = score > minMaxScore;
					app.$.card.show();
				});


	if (stage.offsetHeight < 600)
		rowsInScreen = 4;

	keyWidth = two.width / KEYS_PER_ROW;
	keyHeight = two.height / rowsInScreen;



	start();


	firebase.database().ref('/score')
			.orderByChild('score')
			.limitToLast(3).on('value', function(snap) {
				let scores = [];
				snap.forEach((child) => {
					scores.push(child.val());
				});

				for(let i = 1; i <= scores.length; i++) {
					document.querySelector('#n' + i).innerHTML =
						(scores[scores.length - i].score) +
						'&nbsp;&nbsp;&nbsp;' +
						(scores[scores.length - i].name);
				}

				minMaxScore = 0 || scores[0].score;
			});

	app.$.card.addEventListener('cancel', app.pushScore);
});
})(document);
