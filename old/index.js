// Default the date picker to 3 months
let date = new Date()
date.setDate(date.getDate() - 90)
document.getElementById("min-date").valueAsDate = date

let openingForm = document.getElementById("opening-form")
let loading = document.getElementById("loading")
let statsContainer = document.getElementById("stats-container")
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

  let stats = await runAnalysis()

  loading.style.display = "none"
  displayStats(stats)
  displayBreakdown(stats, "Learn from your mistakes", "Player")
  displayBreakdown(stats, "Punish your opponent", "Opponent")
})


function prettyPrintLine(line) {
  let string = ""
  for (let move of line.moves) {
    string +=
      (move.turn == "w" ? move.moveNumber + ". " : "") +
      move.notation.notation +
      " "
  }
}

function displayStats(stats) {
  let totalGames = stats.gamesInRepertoire + stats.gamesNotInRepertoire
  let winPercent = percent(stats.wins, stats.gamesInRepertoire)
  let drawPercent = percent(stats.draws, stats.gamesInRepertoire)
  let lossPercent = percent(stats.losses, stats.gamesInRepertoire)

  let intro = document.createElement("p")
  intro.classList.add("stats")
  intro.innerHTML = `
  In total you played <span>${totalGames}</span> games as ${colour}, of which <span>${stats.gamesInRepertoire}</span> matched a line in your provided repertoire.<br />
  Of those ${stats.gamesInRepertoire} games, you <span>won ${winPercent}%, lost ${lossPercent}%</span> and drew the remaining <span>${drawPercent}%</span>.
  `
  statsContainer.appendChild(intro)

  let deviations = document.createElement("p")
  let deviationStats = getDeviations(stats.games)

  deviations.classList.add("stats")
  deviations.innerHTML = `
  You reached the end of a book line <span>${
    deviationStats.endOfBook
  } times</span>, leaving <span>${
    stats.gamesInRepertoire - deviationStats.endOfBook
  } games</span> to learn from.<br />
  In those games which we can learn from, you deviated from the book <span> ${
    deviationStats.playerDeviations
  } times</span>, compared to your opponent deviating <span>${
    deviationStats.opponentDeviations
  } times</span>.<br />
  When your opponent deviated from book, you managed to <span>win ${
    deviationStats.winsWhenOpponent
  }</span> times which leaves <span>${
    deviationStats.opponentDeviations - deviationStats.winsWhenOpponent
  } games</span> where you can learn refutations to punish your opponents mistakes.
  `
  statsContainer.appendChild(deviations)
}

function displayBreakdown(stats, title, sideToShow) {
  let breakdownTitle = document.createElement("h2")
  breakdownTitle.innerText = title
  statsContainer.appendChild(breakdownTitle)
  for (let [id, gamesArray] of Object.entries(stats.games)) {
    let idContainer = document.createElement("div")

    for (let game of gamesArray) {
      if (game.deviatingPlayer != sideToShow || game.endOfBook) continue

      let ellipses = ""
      if (sideToShow == "Player") {
        ellipses = colour == "white" ? ". " : "... "
      } else {
        ellipses = colour == "white" ? "... " : ". "
      }
      let moveNumber = game.movesInBook + ellipses

      let moveText = document.createElement("p")
      if (sideToShow == "Player") {
        moveText.innerHTML = `
        You played ${moveNumber}${game.wrongMove}, correct was ${moveNumber}${game.rightMove}
        `
      } else if (game.result != "Win") {
        moveText.innerHTML = `
        You didn't win when ${moveNumber}${game.wrongMove} was played, consider adding a refutation to your repertoire
        `
      }
      if (moveText.innerHTML.length > 0) {
        idContainer.appendChild(moveText)
      }
    }

    if (idContainer.hasChildNodes()) {
      let idTitle = document.createElement("h3")
      let idTitleText = ECO[id.toLowerCase()]
      // console.log({ id, name: ECO[id] })
      if (!idTitleText) {
        idTitleText = ""
        for (let i = 0; i < minMoves; i++) {
          idTitleText += games[id][0].moves[i].notation.notation + " "
        }
      }

      idTitle.innerText = idTitleText

      statsContainer.appendChild(idTitle)
      statsContainer.appendChild(idContainer)
    }
  }
}

function displayPunishments(stats) {
  let punishmentsTitle = document.createElement("h2")
  punishmentsTitle.innerText = "Punishing opponents mistakes"
  statsContainer.appendChild(punishmentsTitle)
}

function getDeviations(games) {
  let endOfBook = 0
  let playerDeviations = 0
  let opponentDeviations = 0
  let winsWhenPlayer = 0
  let lossesWhenPlayer = 0
  let drawsWhenPlayer = 0
  let winsWhenOpponent = 0
  let lossesWhenOpponent = 0
  let drawsWhenOpponent = 0

  for (let [id, gamesArray] of Object.entries(games)) {
    for (let game of gamesArray) {
      if (game.endOfBook) {
        endOfBook++
        continue
      }

      if (game.deviatingPlayer == "Player") {
        playerDeviations++
        game.result == "Win"
          ? winsWhenPlayer++
          : game.result == "Loss"
          ? lossesWhenPlayer++
          : drawsWhenPlayer++
      } else {
        opponentDeviations++
        game.result == "Win"
          ? winsWhenOpponent++
          : game.result == "Loss"
          ? lossesWhenOpponent++
          : drawsWhenOpponent++
      }
    }
  }

  return {
    playerDeviations,
    opponentDeviations,
    winsWhenOpponent,
    winsWhenPlayer,
    drawsWhenPlayer,
    drawsWhenOpponent,
    lossesWhenOpponent,
    lossesWhenPlayer,
    endOfBook,
  }
}

function percent(number, of) {
  return Math.round((number / of) * 100)
}
