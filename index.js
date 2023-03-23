// Default the date picker to 3 months
let date = new Date()
date.setDate(date.getDate() - 90)
document.getElementById("min-date").valueAsDate = date

let openingForm = document.getElementById("opening-form")
let loading = document.getElementById("loading")
let linesLoadedCount = document.getElementById("lines-loaded-count")
let gamesLoadedCount = document.getElementById("games-loaded-count")
let username, studyId, colour, minDate, minMoves
let loadedGames = 0
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
    let game = new Pgn(value)
    games.push(game)
  }

  console.log(games)
}
