var two;
var keyHeight;
var queue = [];
var queueId = [];
var keyWasReleased = true;
var score = 0;
var synth;
var notes = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];

window.onload = function() {
	synth = new Tone.Synth().toMaster();
	two = new Two({
		fullscreen: true
	}).appendTo(document.querySelector('#draw-shapes'));

	keyHeight = two.height / 4;

	var rows = [makeRow(0), makeRow(1), makeRow(2), makeRow(3), makeRow(4)];
	var scoreText = new Two.Text(0, two.width / 2, 100, {
		size: 100,
		fill: '#fff',
		stroke: '#000',
		linewidth: 4
	});
	two.add(scoreText);

	two.bind('update', function(frameCount) {
		scoreText.value = score;
		for (let i = 0; i < rows.length; i++) {
			refreshRow(rows[i], i);
		}
	}).play();
}


makeRow = function(y) {
	var keyWidth = two.width / 4;

	var y = (y * keyHeight) + keyHeight / 2;

	var key1 = two.makeRectangle(keyWidth / 2, y, keyWidth, keyHeight);
	var key2 = two.makeRectangle(keyWidth + keyWidth / 2, y, keyWidth, keyHeight);
	var key3 = two.makeRectangle(keyWidth * 2 + keyWidth / 2, y, keyWidth, keyHeight);
	var key4 = two.makeRectangle(keyWidth * 3 + keyWidth / 2, y, keyWidth, keyHeight);

	let group = two.makeGroup(key1, key2, key3, key4);
	group.stroke = '#BBB';
	group.fill = '#FFFFFF';
	group.linewidth = 1;
	return group;
}

refreshRow = function(row, offset) {
	let ydif = score / 10 + 4;

	var rowY = row.getBoundingClientRect().bottom;
	if (rowY > two.height + keyHeight) {
		row.translation.y = -(1 + offset) * keyHeight;

		for (let i = 0; i < row.children.length; i++)
			row.children[i].fill = '#FFFFFF';

		var blackKey = Math.floor(Math.random() * (4));
		row.children[blackKey].fill = '#333333';
		queue.push(blackKey);
		queueId.push(row);

		if (queueId.length === 5)
		  two.pause();
	}
	row.translation.set(row.translation.x, row.translation.y + ydif);

}

check = function(i) {
  if (queue[0] == i) {
    var note = notes[Math.floor(Math.random() * (6))] + (Math.floor(Math.random() * (4)) + 3);
    synth.triggerAttackRelease(note, "8n");
    score++;

    var row = queueId[0];
    row.children[queue[0]].fill = 'red';
    queue.shift();
    queueId.shift();

  }
}

window.onkeydown = function(e) {
	if (!keyWasReleased || queue[0] == undefined)
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
  var w = two.width / 4;
  if (e.clientX > w * 3)
    check(3);
  else if (e.clientX > w * 2)
    check(2);
  else if (e.clientX > w)
    check(1);
  else
    check(0);
}
