const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let spinning = false

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// Reel labels
const reel1 = new TouchBarLabel()
const reel2 = new TouchBarLabel()
const reel3 = new TouchBarLabel()

// Spin result label
const result = new TouchBarLabel()
const jackpotLabel = new TouchBarLabel();

// Jackpot label
let jackpot = 1000;
jackpotLabel.label = 'Jackpot ' + formatCurrency(jackpot)
jackpotLabel.textColor = null

// Spin button
const spin = new TouchBarButton({
    label: '🎰 Spin',
    backgroundColor: '#7851A9',
    click: () => {
        // Ignore clicks if already spinning
        if (spinning) {
            return
        }

        spinning = true
        result.label = ''

        let timeout = 10
        const spinLength = 4 * 1000 // 4 seconds
        const startTime = Date.now()

        const spinReels = () => {
            updateReels()

            if ((Date.now() - startTime) >= spinLength) {
                finishSpin()
            } else {
                // Slow down a bit on each spin
                timeout *= 1.1
                setTimeout(spinReels, timeout)
            }
        }

        spinReels()
    }
})

const getRandomValue = () => {
    const values = ['🍒', '💎', '7️⃣', '🍊', '🔔', '⭐', '🍇', '🍀']
    return values[Math.floor(Math.random() * values.length)]
}

const updateReels = () => {
    reel1.label = getRandomValue()
    reel2.label = getRandomValue()
    reel3.label = getRandomValue()
}

const finishSpin = () => {
    const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
    const winner = uniqueValues == 1
    if (winner && reel1 == '💎') {
        result.label = '💰 Jackpot! You win ' + formatCurrency(jackpot)
        result.textColor = '#FDFF00'
        jackpot = 0
    } else if (winner) {
        result.label = '🤑 Winner! You win $2,500.00'
        result.textColor = '#FDFF00'
        jackpot -= 2500
    } else if (uniqueValues == 2) {
        result.label = '🤔 So Close!'
        result.textColor = null
        jackpot += 250
    } else {
        // No values are the same
        result.label = '🙁 Spin Again'
        result.textColor = null
        jackpot += 250
    }
    jackpotLabel.label = 'Jackpot ' + formatCurrency(jackpot)
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