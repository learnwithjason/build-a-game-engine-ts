const FRAMES_PER_SECOND = 1000 / 60;
const TILE_SIZE = 16;
const COLUMNS = 32;
const ROWS = 24;
const MAP_WIDTH = COLUMNS * TILE_SIZE;
const MAP_HEIGHT = ROWS * TILE_SIZE;

const canvas = document.createElement('canvas');
canvas.width = MAP_WIDTH;
canvas.height = MAP_HEIGHT;

const context = canvas.getContext('2d');

const app = document.getElementById('app');

app?.appendChild(canvas);

type GameEvent = {
	type: 'playerMove';
	direction: 'up' | 'down' | 'left' | 'right';
};

let state: {
	previousTime: number;
	accumulator: number;
	character: [number, number];
	eventQueue: GameEvent[];
} = {
	previousTime: performance.now(),
	accumulator: 0,
	character: [0, 0],
	eventQueue: [],
};

type Message = {
	type: 'playerQueueEvent';
	event: GameEvent;
};

const messagingQueue: Message[] = [];

window.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowUp':
			messagingQueue.push({
				type: 'playerQueueEvent',
				event: { type: 'playerMove', direction: 'up' },
			});
			break;

		case 'ArrowDown':
			messagingQueue.push({
				type: 'playerQueueEvent',
				event: { type: 'playerMove', direction: 'down' },
			});
			break;
		case 'ArrowLeft':
			messagingQueue.push({
				type: 'playerQueueEvent',
				event: { type: 'playerMove', direction: 'left' },
			});
			break;
		case 'ArrowRight':
			messagingQueue.push({
				type: 'playerQueueEvent',
				event: { type: 'playerMove', direction: 'right' },
			});
			break;
	}
});

// set up the game loop
function render() {
	if (!context) {
		return;
	}

	context.strokeStyle = 'white';

	requestAnimationFrame((timestamp) => {
		// process the messaging queue
		const messages = messagingQueue.splice(0, messagingQueue.length);
		messages.forEach((msg) => {
			switch (msg.type) {
				case 'playerQueueEvent':
					state.eventQueue.push(msg.event);
					break;
			}
		});

		const delta = timestamp - state.previousTime;
		state.accumulator += delta;

		while (state.accumulator >= FRAMES_PER_SECOND) {
			// handle updates
			const events = state.eventQueue.splice(0, state.eventQueue.length);
			events.forEach((event) => {
				switch (event.type) {
					case 'playerMove':
						let newX = state.character[0];
						let newY = state.character[1];

						if (event.direction === 'up') {
							newY = Math.max(0, state.character[1] - 1);
						} else if (event.direction === 'down') {
							newY = Math.min(ROWS - 1, state.character[1] + 1);
						}

						if (event.direction === 'left') {
							newX = Math.max(0, state.character[0] - 1);
						} else if (event.direction === 'right') {
							newX = Math.min(COLUMNS - 1, state.character[0] + 1);
						}

						state.character = [newX, newY];
						break;
				}
			});

			// render the map / characters
			for (let tileColNum = 0; tileColNum < COLUMNS; tileColNum++) {
				for (let tileRowNum = 0; tileRowNum < ROWS; tileRowNum++) {
					context.fillStyle = '#f5e1e2';

					context.fillRect(
						tileColNum * TILE_SIZE,
						tileRowNum * TILE_SIZE,
						TILE_SIZE,
						TILE_SIZE,
					);
					context.strokeRect(
						tileColNum * TILE_SIZE,
						tileRowNum * TILE_SIZE,
						TILE_SIZE,
						TILE_SIZE,
					);

					if (
						state.character[0] === tileColNum &&
						state.character[1] === tileRowNum
					) {
						context.fillStyle = '#bd1434';
						context.fillRect(
							tileColNum * TILE_SIZE,
							tileRowNum * TILE_SIZE,
							TILE_SIZE,
							TILE_SIZE,
						);
					}
				}
			}

			state.accumulator -= FRAMES_PER_SECOND;
		}

		state.previousTime = timestamp;

		render();
	});
}

render();
