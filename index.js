// Default the date picker to 3 months
let date = new Date()
date.setDate(date.getDate() - 90)
document.getElementById("min-date").valueAsDate = date

let openingForm = document.getElementById("opening-form")
let loading = document.getElementById("loading")
let linesLoadedCount = document.getElementById("lines-loaded-count")
let gamesLoadedCount = document.getElementById("games-loaded-count")
let gamesAnalyzedCount = document.getElementById("games-analyzed-count")
let username, studyId, colour, minDate, minMoves
let loadedGames = 0
let loadedLines = 0
let games = []
let lines = []

openingForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  formData = new FormData(openingForm)
  username = formData.get("username")
  studyId = formData.get("study-id")
  colour = formData.get("colour")
  minDate = formData.get("min-date")
  minMoves = formData.get("min-moves")
  openingForm.style.display = "none"
  loading.style.display = "block"

  await streamGames()
  await streamLines()

  games = identifyLines(games)
  lines = identifyLines(lines)

  await runAnalysis()

  loading.style.display = "none"
})

async function streamGames() {
  const response = await fetch(
    `https://lichess.org/api/games/user/${username}?moves=true&color=${colour}&since=${Date.parse(
      minDate
    )}&perfType=blitz,rapid,classical`
  )
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    loadedGames++
    gamesLoadedCount.innerText = loadedGames
    gamesAnalyzedCount.innerText = "0/" + loadedGames
    let game = parse(value)
    games.push(game[0])
  }
}

async function streamLines() {
  const response = await fetch(`https://lichess.org/api/study/${studyId}.pgn`)
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let rawString = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    loadedLines++
    linesLoadedCount.innerText = loadedLines
    rawString += value
    let parsedLine = parse(value)
    for (let line of parsedLine) {
      recursiveParse([], line.moves, line.tags, lines)
    }
  }
  lines.pop()
}

function recursiveParse(lineSoFar, newMoves, tags, outputArray) {
  let lineArray = JSON.parse(JSON.stringify(lineSoFar)) // Deep Clone the array
  for (let move of newMoves) {
    for (let variation of move.variations) {
      recursiveParse(lineArray, variation, tags, outputArray)
    }
    lineArray.push(move)
  }
  let line = {
    tags,
    moves: lineArray,
  }
  outputArray.push(line)
}

function prettyPrintLine(line) {
  let string = ""
  for (let move of line.moves) {
    string +=
      (move.turn == "w" ? move.moveNumber + ". " : "") +
      move.notation.notation +
      " "
  }
}

function identifyLines(linesInput) {
  let taggedLines = {}
  for (let line of linesInput) {
    if (line.moves.length <= minMoves) continue
    let id = getLineId(line.moves)
    if (!Object.keys(taggedLines).includes(id)) {
      taggedLines[id] = []
    }
    taggedLines[id].push(line)
  }
  return taggedLines
}

function getLineId(moves) {
  let id = ""
  for (let i = 0; i < minMoves; i++) {
    id += moves[i].notation.notation
  }
  return id
}

async function runAnalysis() {
  let analyzedCount = 0
  let stats = {
    gamesInRepertoire: 0,
    gamesNotInRepertoire: 0,
  }

  for (let [id, gamesArray] of Object.entries(games)) {
    for (let game of gamesArray) {
      analyzedCount++
      gamesAnalyzedCount.innerText = "0/" + loadedGames

      if (!lines[id]) {
        stats.gamesNotInRepertoire++
        continue
      }
      if (!stats[id]) {
        stats[id] = []
      }

      stats.gamesInRepertoire++
      let longestMatchingLine = 0
      let deviatingPlayer = ""
      let wrongMove = ""
      let rightMove = ""
      for (let line of lines[id]) {
        let matchingMoveCount = 0
        for (const [index, bookMove] of line.moves.entries()) {
          if (
            bookMove.notation.notation == game.moves[index].notation.notation
          ) {
            matchingMoveCount++
          } else {
            if (matchingMoveCount > longestMatchingLine) {
              turnColour = bookMove.turn == "w" ? "white" : "black"
              longestMatchingLine = matchingMoveCount
              deviatingPlayer = turnColour == colour ? "Player" : "Opponent"
              wrongMove = game.moves[index].notation.notation
              rightMove = bookMove.notation.notation
            }
            break
          }
        }
      }
      let gameStats = {
        movesInBook: Math.floor(longestMatchingLine / 2),
        deviatingPlayer,
        rightMove,
        wrongMove,
        result: calculateResult(game.tags.Result),
      }
      stats[id].push(gameStats)
    }
  }
  console.log(stats)
}

function calculateResult(result) {
  if (result == "1-0") {
    return colour == "white" ? "Win" : "Loss"
  }
  if (result == "0-1") {
    return colour == "white" ? "Loss" : "Win"
  }
  return "Draw"
}
