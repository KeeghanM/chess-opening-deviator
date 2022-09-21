<script>
	// 1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 6. Bd3 Bc5 7. Nb3 Ba7 8. O-O Nf6
	import { parse } from '@mliebelt/pgn-parser'

	let username = ''
	let message = ''
	let games = []
	let blackSide = false
	let openingPgn = ''
	let minMoves = 3

	async function getGames() {
		if (username.length < 3) return
		let url = `https://lichess.org/api/games/user/${username}?max=500&moves=true&tags=true&perfType=blitz,rapid,classical,correspondence`

		const response = await fetch(url)
		if (response.status == 404) {
			message = 'Invalid Username'
			return
		}
		const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
		let pgn = ''

		while (true) {
			message = 'Loading games...'
			const { value, done } = await reader.read()
			if (done) break
			pgn += value
		}
		message = ''
		games = pgn.split('\n\n\n')
		games.pop()
		games = games.map((x) => {
			let game = parse(x)
			game.playerSide = game[0].tags.Black == username ? 'Black' : 'White'

			return game
		})

		let parsedOpening = parse(openingPgn)
		console.log(parsedOpening)
		console.log(games)

		let compareSide = blackSide ? 'Black' : 'White'
		let stats = []
		for (let game of games) {
			if (game.playerSide == compareSide) {
				// First ensure the minimum moves match
				let match = true
				for (let i = 0; i < minMoves * 2; i++) {
					match =
						game[0]?.moves[i]?.notation?.notation == parsedOpening[0]?.moves[i]?.notation?.notation
				}
				if (!match) continue // Move to the next game as this one isn't valid

				stats.gameCount++
				for (let i = 0; i < parsedOpening[0].moves.length; i++) {
					let gameMove = game[0].moves[i].notation.notation
					let modelMove = parsedOpening[0].moves[i].notation.notation
					let whosMove = game[0].moves[i].moveNumber == null ? 'Black' : 'White'
					if (gameMove != modelMove) {
						stats.push({
							moveNumber: Math.ceil(i / 2),
							who: whosMove == game.playerSide ? 'Player' : 'Opponent',
							should: modelMove,
							did: gameMove
						})
						break
					}
				}
			}
		}
		console.log(stats)
	}
</script>

<header class="width-full bg-slate-800 px-24 py-12">
	<h1 class="text-2xl font-bold text-orange-600">Opening DeviatOr</h1>
	<p class="text-slate-200">Find where you make mistakes in your repertoire</p>
</header>
<section class="width-full px-24 py-12 text-slate-800">
	<div class="flex max-w-sm flex-col gap-2">
		<div class="-space-between flex flex-row items-center gap-4">
			<label for="username" class="font-bold">Username</label>
			<input
				required
				id="username"
				name="username"
				type="text"
				class="border-2 border-slate-800 px-4 py-2"
				bind:value={username}
			/>
		</div>
		<div class="-space-between flex flex-row items-center gap-4">
			<label for="pgnCompare" class="font-bold">Opening PGN</label>
			<input
				required
				type="text"
				name="pgnCompare"
				id="pgnCompare"
				class="border-2 border-slate-800 px-4 py-2"
				bind:value={openingPgn}
			/>
		</div>
		<div class="flex flex-row content-center gap-2 align-middle font-bold">
			<span>White</span>
			<label class="switch">
				<input type="checkbox" bind:checked={blackSide} />
				<span class="slider round" />
			</label><span>Black</span>
		</div>
		<button
			class="rounded-lg bg-orange-600 px-4 py-2 text-slate-800 hover:bg-orange-500 hover:shadow-lg"
			on:click={getGames}>Search</button
		>
		<span>{message}</span>
	</div>
</section>

<style>
	/* The switch - the box around the slider */
	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
