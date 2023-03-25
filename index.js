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

  console.log(lines)
  identifyLines()

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

function identifyLines() {
  let taggedLines = {}
  for (let line of lines) {
    let id = ""
    for (let i = 0; i < minMoves; i++) {
      id += line.moves[i].notation.notation
    }
    if (!Object.keys(taggedLines).includes(id)) {
      taggedLines[id] = []
    }
    taggedLines[id].push(line)
  }
  lines = taggedLines
}
