const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let loop = false;
let decsending = false;
let limit = 54;

const getRandomValue = () => {
    const values = ['🟦', '🟪', '🟫', '🟥', '🟧', '🟨', '🟩']
    return values[Math.floor(Math.random() * values.length)]
}

const generateGrid = (size) => Array(size).fill().map(() => getRandomValue()).join('')

const canvas = new TouchBarLabel()
canvas.label = ''

const startLoop = () => {
    let count = canvas.label.length;
    loop = setInterval(() => {
        if (decsending && count == 0) {
            count = 1
            decsending = false
        } else if (!decsending && canvas.label.length < limit) {
            count++
        } else if (decsending || canvas.label.length >= limit) {
            decsending = true
            count--
        }
        canvas.label = generateGrid(count)
    }, 100);
}

const stopLoop = () => {
    clearInterval(loop)
    loop = false
}

const startButton = new TouchBarButton({
    label: 'Start',
    textColor: '#fffff',
    backgroundColor: '#28a745',
    click: () => {
        if (loop) {
            startButton.label = 'Start'
            startButton.backgroundColor = '#28a745'
            stopLoop()
        } else {
            startButton.backgroundColor = '#dc3545'
            startButton.label = 'Stop'
            startLoop()
            
        }
    }
})

const touchBar = new TouchBar({
    items: [
        startButton,
        new TouchBarSpacer({ size: 'large' }),
        new TouchBarSpacer({ size: 'flexible' }),
        canvas,
    ]
})

let window

app.whenReady().then(() => {
    window = new BrowserWindow({
        frame: false,
        titleBarStyle: 'hiddenInset',
        width: 200,
        height: 200,
        backgroundColor: '#000'
    })
    window.loadURL('about:blank')
    window.setTouchBar(touchBar)
})