import * as Colors from './utils/Colors.js'

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

ctx.shadowOffsetX = 0
ctx.shadowOffsetY = 0

let mouse = {
    x: 0,
    y: 0,
    buttons: 0
}

const swap = (x1, y1, x2, y2) => (!sandAt(x1, y1) || !sandAt(x2, y2)) ? false : [grid[x1][y1], grid[x2][y2]] = [grid[x2][y2], grid[x1][y1]] || true

const sandAt = (x, y) => (x < 0 || y < 0 || x >= gridX || y >= gridY) ? false : grid[x][y]

const copySand = (x1, y1, x2, y2) => (!sandAt(x1, y1) || !sandAt(x2, y2)) ? false : grid[x2][y2] = JSON.parse(JSON.stringify(grid[x1][y1])) || true

const changeSand = (x, y, type) => {
    if (!sandAt(x, y)) return false
    const oldType = grid[x][y].type
    if (sandTypes[oldType].onDestroy) sandTypes[oldType].onDestroy(x, y, grid[x][y].mem)
    grid[x][y] = { type, mem: {} }
    if (sandTypes[type].onCreate) sandTypes[type].onCreate(x, y, grid[x][y].mem)
}

const sandTypes = {
    air: {
        types: ['air', 'empty'],
        render() { return { color: '#0000' } },
        update() { },
        onCreate() { },
        onDestroy() { }
    },
    stone: {
        types: ['stone', 'solid'],
        render() { return { color: '#333' } },
    },
    water: {
        types: ['water', 'liquid'],
        render(x, y) { return { color: '#00f' } },
        update(x, y) {
            if (sandAt(x, y + 1) && sandTypes[sandAt(x, y + 1).type].types.includes('empty')) swap(x, y, x, y + 1)
            else if (Math.random() < .5) {
                if (Math.random() < .5 && sandAt(x - 1, y) && sandTypes[sandAt(x - 1, y).type].types.includes('empty')) swap(x, y, x - 1, y)
            }
            else {
                if (Math.random() < .5 && sandAt(x + 1, y) && sandTypes[sandAt(x + 1, y).type].types.includes('empty')) swap(x, y, x + 1, y)
            }
        }
    },
    lava: {
        types: ['lava', 'liquid'],
        render(x, y) {
            const heat = grid[x][y].mem.heat
            const lavaColor = Colors.createColor(['hex', '#ff6600'])
            const stoneColor = Colors.createColor(['hex', '#4d1f00'])
            return {
                color: Colors.lerp(stoneColor, lavaColor, heat / 100).hex,
                shadowColor: Colors.lerp(Colors.createColor(['alpha', 0]), lavaColor, heat / 100).hex,
                shadowBlur: 10
            }
        },
        update(x, y) {

            function takeHeat(i) {
                grid[x][y].mem.heat -= i
                if (grid[x][y].mem.heat <= 0) changeSand(x, y, 'stone')
            }

            takeHeat(Math.random() * .05)

            if (sandAt(x, y + 1) && sandAt(x, y + 1).type == 'water') {
                changeSand(x, y + 1, 'steam')
                takeHeat(1)
            }
            if (sandAt(x, y - 1) && sandAt(x, y - 1).type == 'water') {
                changeSand(x, y - 1, 'steam')
                takeHeat(1)
            }
            if (sandAt(x + 1, y) && sandAt(x + 1, y).type == 'water') {
                changeSand(x + 1, y, 'steam')
                takeHeat(1)
            }
            if (sandAt(x - 1, y) && sandAt(x - 1, y).type == 'water') {
                changeSand(x - 1, y, 'steam')
                takeHeat(1)
            }

            if (sandAt(x, y + 1) && sandAt(x, y + 1).type == 'sand') {
                grid[x][y + 1].mem.heat++
                takeHeat(.5)
            }
            if (sandAt(x, y - 1) && sandAt(x, y - 1).type == 'sand') {
                grid[x][y - 1].mem.heat++
                takeHeat(.5)
            }
            if (sandAt(x + 1, y) && sandAt(x + 1, y).type == 'sand') {
                grid[x + 1][y].mem.heat++
                takeHeat(.5)
            }
            if (sandAt(x - 1, y) && sandAt(x - 1, y).type == 'sand') {
                grid[x - 1][y].mem.heat++
                takeHeat(.5)
            }



            if (Math.random() < .5) return
            if (sandAt(x, y + 1) && sandTypes[sandAt(x, y + 1).type].types.includes('empty')) swap(x, y, x, y + 1)
            else if (Math.random() < .5) {
                if (Math.random() < .25 && sandAt(x - 1, y) && sandTypes[sandAt(x - 1, y).type].types.includes('empty')) swap(x, y, x - 1, y)
            }
            else {
                if (Math.random() < .25 && sandAt(x + 1, y) && sandTypes[sandAt(x + 1, y).type].types.includes('empty')) swap(x, y, x + 1, y)
            }
        },
        onCreate(x, y, mem) {
            mem.heat = 100
        }
    },
    steam: {
        types: ['steam', 'gas'],
        render(x, y) {
            const steamColor = Colors.createColor(['hex', '#ffffff'])
            const rainColor = Colors.createColor(['hex', '#363663'])
            return {
                color: Colors.lerp(steamColor, rainColor, grid[x][y].mem.time / 100).hex
            }
        },
        update(x, y) {
            if (grid[x][y].mem.time == undefined) grid[x][y].mem.time = 0
            grid[x][y].mem.time += .1
            if (grid[x][y].mem.time >= 100) {
                changeSand(x, y, 'water')
                return
            }
            if (Math.random() < .5) {
                if (sandAt(x, y - 1) && (
                    sandTypes[sandAt(x, y - 1).type].types.includes('liquid') ||
                    sandTypes[sandAt(x, y - 1).type].types.includes('empty'))) swap(x, y, x, y - 1)

                else if (Math.random() < .5) {
                    if (Math.random() < .25 && sandAt(x - 1, y) && (
                        sandTypes[sandAt(x - 1, y).type].types.includes('liquid') ||
                        sandTypes[sandAt(x - 1, y).type].types.includes('empty'))) swap(x, y, x - 1, y)

                } else if (Math.random() < .25 && sandAt(x + 1, y) && (
                    sandTypes[sandAt(x + 1, y).type].types.includes('liquid') ||
                    sandTypes[sandAt(x + 1, y).type].types.includes('empty'))) swap(x, y, x + 1, y)
            }
        }
    },
    dupe: {
        types: ['dupe', 'solid'],
        render() { return { color: '#0f0' } },
        update(x, y) { copySand(x, y - 1, x, y + 1) }
    },
    void: {
        types: ['void', 'solid'],
        render() { return { color: '#60f' } },
        update(x, y) {
            7
            if (sandAt(x - 1, y).type != 'void') changeSand(x - 1, y, 'air')
            if (sandAt(x + 1, y).type != 'void') changeSand(x + 1, y, 'air')
            if (sandAt(x, y - 1).type != 'void') changeSand(x, y - 1, 'air')
            if (sandAt(x, y + 1).type != 'void') changeSand(x, y + 1, 'air')
        }
    },
    sand: {
        types: ['sand'],
        render(x, y) {
            const sandColor = Colors.createColor(['hex', '#a38529'])
            const lavaColor = Colors.createColor(['hex', '#ff6600'])
            return { color: Colors.lerp(sandColor, lavaColor, grid[x][y].mem.heat / 100).hex }
        },
        update(x, y) {
            if (grid[x][y].mem.heat >= 100) {
                changeSand(x, y, 'lava')
                return
            }
            grid[x][y].mem.heat = Math.max(0, grid[x][y].mem.heat - .1)
            if (sandAt(x, y + 1) && sandTypes[sandAt(x, y + 1).type].types.includes('empty')) swap(x, y, x, y + 1)
            if (sandAt(x, y + 1) && sandTypes[sandAt(x, y + 1).type].types.includes('liquid')) swap(x, y, x, y + 1)
        },
        onCreate(x, y) { grid[x][y].mem.heat = 0 }
    },
    wood: {
        types: ['wood', 'solid'],
        render() { return { color: '#804000' } },
        update(x, y) {
            if (grid[x][y].mem.heat > 25) changeSand(x, y, 'fire')

        },
        onCreate(x, y) { grid[x][y].mem.heat = 0 }
    },
    fire: {
        types: ['fire', 'empty'],
        render(x, y) {
            return {
                color: '#ff6200',
                shadowColor: '#ff6200',
                shadowBlur: Math.abs(Math.cos((Date.now() * grid[x][y].mem.start.offset) / 250)) * 10
            }
        },
        update(x, y) {
            const mem = grid[x][y].mem
            if (mem.start.x != x || mem.start.y != y || mem.start.time > 100) {
                changeSand(x, y, 'air')
                return
            }

            mem.start.time++

            if (sandAt(x + 1, y).type == 'wood') grid[x + 1][y].mem.heat += Math.random() * 2
            if (sandAt(x - 1, y).type == 'wood') grid[x - 1][y].mem.heat += Math.random() * 2
            if (sandAt(x, y + 1).type == 'wood') grid[x][y + 1].mem.heat += Math.random() * 2
            if (sandAt(x, y - 1).type == 'wood') grid[x][y - 1].mem.heat += Math.random() * 2

        },
        onCreate(x, y) { grid[x][y].mem.start = { x, y, offset: Math.random(), time: 0 } }
    }
}

const sandKeys = {
    1: 'air',
    2: 'stone',
    3: 'water',
    4: 'lava',
    5: 'steam',
    6: 'dupe',
    7: 'void',
    8: 'sand',
    9: 'wood',
    0: 'fire'
}

let brush = {
    type: 'air',
    r: 0,
}

let gridX, gridY, xOffset, yOffset

let pixelSize = 10

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    gridX = Math.floor(canvas.width / pixelSize)
    xOffset = canvas.width % pixelSize / 2
    gridY = Math.floor(canvas.height / pixelSize)
    yOffset = canvas.height % pixelSize / 2

    console.log(gridX * gridY)
}

window.onresize = resize
resize()

let grid
const fillGrid = (type, mem = {}) => grid = new Array(gridX).fill(0).map((_, index) => new Array(gridY).fill(0).map(() => ({ type, mem: JSON.parse(JSON.stringify(mem)) })))
fillGrid('air')


const renderPixel = (x, y, colorSettings) => {
    ctx.fillStyle = colorSettings.color
    ctx.shadowColor = colorSettings.shadowColor ?? '#00000000'
    ctx.shadowBlur = pixelSize * colorSettings.shadowBlur
    ctx.fillRect(Math.floor(xOffset + x * pixelSize), Math.floor(yOffset + y * pixelSize), Math.ceil(pixelSize), Math.ceil(pixelSize))
}

const render = () => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    grid.forEach((row, x) => row.forEach((value, y) => {
        renderPixel(x, y, sandTypes[value.type].render(x, y))
    }))

    const buttonsInBi = (mouse.buttons + 8).toString(2).split('')
    const leftPressed = buttonsInBi[3] == 1

    let gx = Math.floor((mouse.x - xOffset) / pixelSize)
    let gy = Math.floor((mouse.y - yOffset) / pixelSize)

    runFunctionInCircle(gx, gy, brush.r, (x, y) => {
        if (sandAt(x, y)) renderPixel(x, y, { color: '#fff6' })
    })

    requestAnimationFrame(render)
}
render()

function runFunctionInCircle(centerX, centerY, R, X) {
    let startX = Math.floor(centerX - R)
    let endX = Math.ceil(centerX + R)
    let startY = Math.floor(centerY - R)
    let endY = Math.ceil(centerY + R)

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            let distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

            if (distanceFromCenter <= R) {
                X(x, y)
            }
        }
    }
}

const updateMouse = (event) => {
    mouse.x = event.pageX
    mouse.y = event.pageY
    mouse.buttons = event.buttons

    const buttonsInBi = (event.buttons + 8).toString(2).split('')
    const leftPressed = buttonsInBi[3] == 1
    const middlePressed = buttonsInBi[1] == 1
    const rightPressed = buttonsInBi[2] == 1
    const x = event.pageX
    const y = event.pageY

    let gx = Math.floor((x - xOffset) / pixelSize)
    let gy = Math.floor((y - yOffset) / pixelSize)
    if (leftPressed) {
        runFunctionInCircle(gx, gy, brush.r, (x, y) => {
            if (sandAt(x, y)) changeSand(x, y, brush.type)
        })
    }
}
window.addEventListener('mousemove', event => updateMouse(event))
window.addEventListener('mousedown', event => updateMouse(event))
window.addEventListener('mouseup', event => updateMouse(event))

const ups = 60
setInterval(() => {
    for (let x = 0; x < gridX; x++) {
        for (let y = gridY - 1; y >= 0; y--) {
            const pixel = grid[x][y]
            const sandType = sandTypes[pixel.type]
            if (sandType.update) sandType.update(x, y, pixel.mem)
        }
    }
}, 1000 / ups)

window.addEventListener('keypress', event => {
    const key = event.key
    if (sandKeys[event.key]) brush.type = sandKeys[event.key]

    if (key == '-' || key == '_') brush.r = Math.max(0, brush.r - .5)
    if (key == '=' || key == '+') brush.r += .5
})