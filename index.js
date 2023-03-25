// Default the date picker to 3 months
let date = new Date()
date.setDate(date.getDate() - 1)
document.getElementById("min-date").valueAsDate = date

let openingForm = document.getElementById("opening-form")
let loading = document.getElementById("loading")
let linesLoadedCount = document.getElementById("lines-loaded-count")
let gamesLoadedCount = document.getElementById("games-loaded-count")
let username, studyId, colour, minDate, minMoves
let loadedGames = 0
let loadedLines = 0
let games = []
let lines = []

let testPGN =
  '[White "Keeghan"] 1. e4 e5 2. Nf3 Nc6 (2... Nf6 3. d4 Nxe4 (3... exd4 4. e5) 4. Nxe5) (2... d6 3. d4) 3. d4'
let PGN = parse(testPGN)
for (let line of PGN) {
  recursiveParse([], line.moves, line.tags, lines)
}
for (let line of lines) {
  prettyPrintLine(line)
}

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
    let game = parse(value)
    games.push(game[0])
  }

  console.log(games)
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

  for (let line of lines) {
    prettyPrintLine(line)
  }
}

function recursiveParse(lineSoFar, newMoves, tags, outputArray) {
  let lineArray = JSON.parse(JSON.stringify(lineSoFar))
  for (let move of newMoves) {
    // if (move.variations.length > 0) {
    for (let variation of move.variations) {
      recursiveParse(lineArray, variation, tags, outputArray)
    }
    // } else {
    lineArray.push(move)
    // }
  }
  let line = {
    tags,
    moves: lineArray,
  }
  outputArray.push(line)
}

function prettyPrintLine(line) {
  // console.log(line)
  let string = ""
  for (let move of line.moves) {
    string +=
      (move.turn == "w" ? move.moveNumber : "") +
      " " +
      move.notation.notation +
      " "
  }
  console.log(string)
}
