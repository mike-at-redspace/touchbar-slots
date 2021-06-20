const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let spinning = false

const formatCurrency = (amount) => `$${amount}`

// Reel labels
const slotA = new TouchBarLabel()
const slotB = new TouchBarLabel()
const slotC = new TouchBarLabel()

// Spin result labels
const results = new TouchBarLabel()
const gameStatus = new TouchBarLabel()

// Rules
let jackpot = 1000
let pot = 1000
let cost = 25
let win = 250

// Spin button
let spinTimoout = false;
const spinButton = new TouchBarButton({
    label: '🎰 Spin',
    backgroundColor: '#7851A9',
    click: () => {
        // Ignore clicks if already spinning
        if (spinning) {
            return finishSpin();
        }
        spinning = true
        pot -= cost
        jackpot += cost
        gameStatus.label = `💳 ${formatCurrency(pot)} 💰 ${formatCurrency(jackpot)}`
        gameStatus.textColor = null
        results.label = ''
        spinButton.label = '🛑 Stop'

        let timeout = 10
        const spinLength = 10000 // 10 seconds
        const startTime = Date.now()

        const spinReels = () => {
            updateReels()

            if ((Date.now() - startTime) >= spinLength) {
                finishSpin()
            } else {
                // Slow down a bit on each spin
                timeout *= 1.1
                spinTimoout = setTimeout(spinReels, timeout)
            }
        }

        spinReels()
    }
})

const getRandomValue = () => {
    const values = ['🍒', '💎', '🍋', '🍌', '🍑', '🍇', '🍉']
    return values[Math.floor(Math.random() * values.length)]
}

const updateReels = () => {
    slotA.label = getRandomValue()
    slotB.label = getRandomValue()
    slotC.label = getRandomValue()
}

const resetGame = () => {
    spinButton.label = '🎰 New Game';
    jackpot = 5000;
    pot = 1000;
}

const finishSpin = () => {
    if (spinTimoout) {
        clearTimeout(spinTimoout)
    }
    const uniqueValues = new Set([slotA.label, slotB.label, slotC.label]).size
    const winner = uniqueValues == 1
    if (winner && slotA.label == '💎') {
        results.label = '💰 Jackpot! You win ' + formatCurrency(jackpot)
        results.textColor = '#FDFF00'
        pot = jackpot
        jackpot = 0
    } else if (winner) {
        results.label = '🤑 Winner! You win ' + formatCurrency(win)
        results.textColor = '#FDFF00'
        jackpot -= win
        pot += win
    } else if (uniqueValues == 2) {
        results.label = '🤔 So Close!'
        results.textColor = null
    } else {
        // No values are the same
        results.label = '🙁 Spin Again'
        results.textColor = null
    }

    if (pot < cost) {
        results.label = ''
        gameStatus.label = '🥺 Game Over! 💸 '
        gameStatus.textColor = '#DC3545'
        resetGame();
    } else if (jackpot <= 0) {
        gameStatus.label = `😲 You WON! ${formatCurrency(pot)} 💵`
        gameStatus.textColor = '#28a745'
        resetGame();
    } else {
        gameStatus.label = `💳 ${formatCurrency(pot)} 💰 ${formatCurrency(jackpot)}`
        spinButton.label = '🎰 Spin'
    }
    spinning = false
}

const touchBar = new TouchBar({
    items: [
        spinButton,
        new TouchBarSpacer({ size: 'large' }),
        slotA,
        new TouchBarSpacer({ size: 'small' }),
        slotB,
        new TouchBarSpacer({ size: 'small' }),
        slotC,
        new TouchBarSpacer({ size: 'large' }),
        results,
        new TouchBarSpacer({ size: 'flexible' }),
        gameStatus,
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