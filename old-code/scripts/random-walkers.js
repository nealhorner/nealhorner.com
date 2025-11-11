// Random Walk
const stepDistance = 10
let maxLength
const devicePixelRatio = window.devicePixelRatio || 1
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.setAttribute('id', 'canvas')
document.getElementById('random-walk-container').appendChild(canvas)
resizeCanvas()
const colorPalette = ['#504D7F', '#9C8105', '#407156', '#E57769']

function initializeLines() {
    const maxWidth =
        Math.floor(canvas.clientWidth / stepDistance) * stepDistance
    const maxHeight =
        Math.floor(canvas.clientHeight / stepDistance) * stepDistance
    return [
        [{ x: 0, y: 0 }],
        [{ x: 0, y: maxHeight }],
        [{ x: maxWidth, y: maxHeight }],
        [{ x: maxWidth, y: 0 }],
    ]
}
const lines = initializeLines()

function resizeCanvas() {
    canvas.width = canvas.offsetWidth * devicePixelRatio
    canvas.height = canvas.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)
    setMaxLength()
}
window.addEventListener('resize', resizeCanvas)

function setMaxLength(value) {
    maxLength = Math.floor(canvas.width * canvas.height * 0.001)
    console.log(`Max length: ${maxLength}`)
}

let foodItems = []
function placeFood(event) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width // Relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height // Relationship bitmap vs. element for Y

    const x = event.clientX - rect.left //* scaleX // Scale mouse coordinates after they have
    const y = event.clientY - rect.top //* scaleY // been adjusted to be relative to element

    // Place food at click location
    foodItems.push({
        x: x,
        y: y,
    })
}
// Add event listener to body
document.body.addEventListener('click', placeFood)

function advanceLine(line) {
    let direction
    const lastPoint = line[line.length - 1]

    const directions = [
        { x: 0, y: 1 }, // Up
        { x: 1, y: 1 }, // Up and right
        { x: 1, y: 0 }, // Right
        { x: 1, y: -1 }, // Down and right
        { x: 0, y: -1 }, // Down
        { x: -1, y: -1 }, // Down and left
        { x: -1, y: 0 }, // Left
        { x: -1, y: 1 }, // Up and left
    ]

    // Get canvas dimensions
    const maxWidth =
        Math.floor(canvas.clientWidth / stepDistance) * stepDistance
    const maxHeight =
        Math.floor(canvas.clientHeight / stepDistance) * stepDistance

    if (foodItems.length > 0) {
        // Get the closest food
        const closestFood = foodItems.reduce((prev, curr) => {
            const prev_distance = Math.sqrt(
                Math.pow(prev.x - lastPoint.x, 2) +
                    Math.pow(prev.y - lastPoint.y, 2)
            )
            const curr_distance = Math.sqrt(
                Math.pow(curr.x - lastPoint.x, 2) +
                    Math.pow(curr.y - lastPoint.y, 2)
            )
            return prev_distance < curr_distance ? prev : curr
        })

        // Get the direction to the food
        direction = {
            x: Math.sign(closestFood.x - lastPoint.x),
            y: Math.sign(closestFood.y - lastPoint.y),
        }

        // Add randomness to the direction
        direction.x += Math.floor(Math.random() * 3) - 1
        direction.y += Math.floor(Math.random() * 3) - 1
    } else {
        // Get a random direction
        direction = directions[Math.floor(Math.random() * 8)]
    }

    // Calculate new point
    let newPoint = {
        x: lastPoint.x + direction.x * stepDistance,
        y: lastPoint.y + direction.y * stepDistance,
    }

    // Apply boundary limits
    newPoint.x = Math.max(0, Math.min(newPoint.x, maxWidth))
    newPoint.y = Math.max(0, Math.min(newPoint.y, maxHeight))

    line.push(newPoint)

    // Limit the length of the line
    const lengthDifference = line.length - maxLength
    if (lengthDifference == 1) {
        line.shift()
    } else if (lengthDifference > 1) {
        line = line.slice(lengthDifference)
    }

    return line
}

function removeEatenFood() {
    // Remove food that has been eaten
    foodItems = foodItems.filter((food) => {
        return !lines.some((line) => {
            const lastPoint = line[line.length - 1]
            return (
                Math.sqrt(
                    Math.pow(lastPoint.x - food.x, 2) +
                        Math.pow(lastPoint.y - food.y, 2)
                ) <= stepDistance
            )
        })
    })
}

function drawLine(line, index) {
    // Draw the line segments
    ctx.beginPath()
    ctx.moveTo(line[0].x, line[0].y)
    for (let j = 1; j < line.length; j++) {
        ctx.lineTo(line[j].x, line[j].y)
    }
    ctx.strokeStyle = colorPalette[index]
    ctx.lineWidth = 2
    ctx.stroke()
}

function drawFood(food) {
    // Draw the food
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.arc(food.x, food.y, Math.random() * 15, 0, 4 * Math.PI)
    ctx.fill()
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    removeEatenFood()

    foodItems.forEach((food) => {
        drawFood(food)
    })

    lines.forEach((line, index) => {
        line = advanceLine(line)
        drawLine(line, index)
    })
    requestAnimationFrame(drawCanvas)
}

requestAnimationFrame(drawCanvas)
