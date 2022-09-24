<script lang="ts">
	// 1D1HCJEb
	import { parse } from '@mliebelt/pgn-parser'

	let username = ''
	let message = ''
	let blackSide = false
	let studyId = ''
	let minMoves = 1
	let stats = {
		gameCount: 0,
		analysedGames: []
	}
	let results = false
	let wrongPlayerMoves = []

	let playerDeviations = 0
	let oppDeviations = 0

	async function getGames() {
		if (username.length < 3 || studyId.length < 3) return
		results = false
		wrongPlayerMoves = []

		let games = await fetchGames()
		if (!games) return

		let repertoire = await fetchRepertoire()
		if (!repertoire) return

		let compareSide = blackSide ? 'Black' : 'White'
		let analysedGames = []

		for (let game of games) {
			if (game.playerSide == compareSide) {
				// First ensure the game matches at least the minimum moves in one
				// of the lines in the repertoire
				let match = true
				for (let chapter of repertoire) {
					for (let i = 0; i <= minMoves * 2; i++) {
						let gameMove = game[0]?.moves[i]?.notation?.notation
						let repertoireMove = chapter[0]?.moves[i]?.notation?.notation

						match = gameMove == repertoireMove
					}
				}

				if (!match) continue // Move to the next game as this one isn't valid

				let moveNumber = 0
				let repertoireMove = ''
				let gameMove = ''
				let who = ''

				for (let chapter of repertoire) {
					for (let i = 0; i < Math.min(chapter[0].moves.length, game[0].moves.length); i++) {
						let currentGameMove = game[0].moves[i].notation.notation
						let modelMove = chapter[0].moves[i].notation.notation
						let whosMove = game[0].moves[i].moveNumber == null ? 'Black' : 'White'
						let currentMoveNumber = Math.ceil(i / 2)
						if (currentGameMove != modelMove) {
							if (currentMoveNumber > moveNumber) {
								moveNumber = currentMoveNumber
								repertoireMove = modelMove
								gameMove = currentGameMove
								who = whosMove == game.playerSide ? 'Player' : 'Opponent'
							}
							console.log({ chapter, game })
							break
						}
					}
				}
				analysedGames.push({
					moveNumber,
					repertoireMove,
					gameMove,
					who,
					gameUrl: game[0].tags.Site
				})
			}
		}
		stats.analysedGames = analysedGames

		generateResults()
	}

	async function fetchRepertoire() {
		let url = `https://lichess.org/api/study/${studyId}.pgn?comments=false&clocks=false`

		const response = await fetch(url)
		if (response.status == 404) {
			message = 'Study ID'
			return
		}
		const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
		let repertoire = ''

		while (true) {
			message = 'Loading repertoire...'
			const { value, done } = await reader.read()
			if (done) break
			repertoire += value
		}

		message = ''

		let lines = repertoire.split('\n\n\n')
		lines.pop()
		lines = lines.map((x) => parse(x))

		return lines
	}

	async function fetchGames() {
		let url = `https://lichess.org/api/games/user/${username}?max=100&moves=true&tags=true&perfType=blitz,rapid,classical,correspondence`

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
		let games = pgn.split('\n\n\n')
		games.pop()
		games = games.map((x) => {
			let game = parse(x)
			game.playerSide = game[0].tags.Black == username ? 'Black' : 'White'

			return game
		})
		stats.gameCount = games.length
		return games
	}

	function generateResults() {
		playerDeviations = stats.analysedGames.filter((game) => game.who == 'Player').length
		oppDeviations = stats.analysedGames.filter((game) => game.who == 'Opponent').length
		stats.analysedGames
			.filter((game) => game.who == 'Player')
			.forEach((game) => {
				wrongPlayerMoves.push({
					played: game.gameMove,
					should: game.repertoireMove,
					moveNumber: game.moveNumber
				})
			})

		wrongPlayerMoves = wrongPlayerMoves.sort((a, b) => {
			if (a.moveNumber == b.moveNumber) return a.played.localeCompare(b.played)

			return a.moveNumber - b.moveNumber
		})
		results = true
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
			<label for="pgnCompare" class="font-bold">LiChess Study Id</label>
			<input
				required
				type="text"
				name="pgnCompare"
				id="pgnCompare"
				class="border-2 border-slate-800 px-4 py-2"
				bind:value={studyId}
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
		<span
			>{message}{#if message.length > 0}
				<div class="loader" />
			{/if}</span
		>
	</div>
	{#if results == true}
		<p>Total Games Loaded from LiChess: {stats.gameCount}</p>
		<p>Games played within repertoire: {stats.analysedGames.length}</p>
		<p>Number of times player deviated: {playerDeviations}</p>
		<p>Number of times opponent deviated: {oppDeviations}</p>
		<div class="p-12">
			{#each wrongPlayerMoves as move, i}
				<p>
					On move {move.moveNumber} you played {move.played} but should've played {move.should}
				</p>
			{/each}
		</div>
	{/if}
</section>

<style>
	.loader {
		border: 16px solid #f3f3f3; /* Light grey */
		border-top: 16px solid #3498db; /* Blue */
		border-radius: 50%;
		width: 80px;
		height: 80px;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
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
