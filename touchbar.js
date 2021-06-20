const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let spinning = false

const formatCurrency = (amount) => `$${amount}`

// Reel labels
const reel1 = new TouchBarLabel()
const reel2 = new TouchBarLabel()
const reel3 = new TouchBarLabel()

// Spin result label
const result = new TouchBarLabel()
const jackpotLabel = new TouchBarLabel()

// Rules
let jackpot = 1000
let pot = 1000
let cost = 25
let win = 250

// Spin button
let spinTimoout = false;
const spin = new TouchBarButton({
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
        jackpotLabel.label = `💳 ${formatCurrency(pot)} 💰 ${formatCurrency(jackpot)}`
        jackpotLabel.textColor = null
        result.label = ''
        spin.label = '🛑 Stop'

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
    reel1.label = getRandomValue()
    reel2.label = getRandomValue()
    reel3.label = getRandomValue()
}

const resetGame = () => {
    spin.label = '🎰 Start Over';
    jackpot = 5000;
    pot = 1000;
}

const finishSpin = () => {
    if (spinTimoout) {
        clearTimeout(spinTimoout)
    }
    const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
    const winner = uniqueValues == 1
    if (winner && reel1 == '💎') {
        result.label = '💰 Jackpot! You win ' + formatCurrency(jackpot)
        result.textColor = '#FDFF00'
        pot = jackpot
        jackpot = 0
    } else if (winner) {
        result.label = '🤑 Winner! You win ' + formatCurrency(win)
        result.textColor = '#FDFF00'
        jackpot -= win
        pot += win
    } else if (uniqueValues == 2) {
        result.label = '🤔 So Close!'
        result.textColor = null
    } else {
        // No values are the same
        result.label = '🙁 Spin Again'
        result.textColor = null
    }

    if (pot < cost {
        result.label = ''
        jackpotLabel.label = '🥺 Game Over! 💸 '
        jackpotLabel.textColor = '#DC3545'
        resetGame();
    } else if (jackpot <= 0) {
        jackpotLabel.label = `😲 You WON! ${formatCurrency(pot)} 💵`
        resetGame();
    } else {
        jackpotLabel.label = `💳 ${formatCurrency(pot)} 💰 ${formatCurrency(jackpot)}`
        spin.label = '🎰 Spin'
    }
    spinning = false
}

const touchBar = new TouchBar({
    items: [
        spin,
        new TouchBarSpacer({ size: 'large' }),
        reel1,
        new TouchBarSpacer({ size: 'small' }),
        reel2,
        new TouchBarSpacer({ size: 'small' }),
        reel3,
        new TouchBarSpacer({ size: 'large' }),
        result,
        new TouchBarSpacer({ size: 'flexible' }),
        jackpotLabel,
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