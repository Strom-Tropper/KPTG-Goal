// Cấu hình
const REM = 2;
const EPSILON = 0.001;

function rem(value) {
    return value * REM;
}
// mỗi cột 1 boom, random 1 hàng
function randomMines(rows, cols) {
    const mines = [];
    for (let col = 0; col < cols; col++) {
        const row = Math.floor(Math.random() * rows);
        mines.push(row * cols + col);
    }
    console.log('vị trí boom', mines);
    return mines;
}
const settings = {
    size: {
        screen: { width: 900, height: 600 },
        box: { width: rem(40), height: rem(40), radius: rem(3), border: rem(1) },
        board: { gap: rem(3) },
        title: { top: rem(2.5) },
        subtitle: { top: rem(1.5) },
        field: { width: rem(63), height: rem(15), padX: rem(7), padRight: rem(6), chevronW: rem(5), chevronH: rem(3) },
        fieldMenu: { optionH: rem(15), padTop: rem(3), pad: rem(4), inset: rem(3), radius: rem(5), itemRadius: rem(4), offset: rem(2) },
        multi: { height: rem(15), padX: rem(6), minWidth: rem(54) },
        bottom: { height: rem(32), radius: rem(15), margin: rem(6), border: rem(1), padX: rem(6), gap: rem(4), gapBet: rem(5), gapWide: rem(6) },
        bet: { width: rem(75), height: rem(23), radius: rem(11.5), captionY: rem(3), valueY: rem(11), border: rem(1) },
        icon: { size: rem(17) },
        coin: { radius: rem(3) },
        reset: { size: rem(23) },
        play: { width: rem(66), height: rem(23), radius: rem(11.5), iconW: rem(6), iconH: rem(7) },
        betMenu: { pad: rem(5), titleH: rem(14), itemW: rem(54), itemH: rem(15), gap: rem(4), cols: 2, radius: rem(7), itemRadius: rem(7.5), offset: rem(4) },
        broke: { width: rem(210), height: rem(84), radius: rem(8), btnW: rem(90), btnH: rem(21), btnRadius: rem(10.5), gap: rem(8) },
        result: { width: rem(210), height: rem(136), radius: rem(8), btnW: rem(90), btnH: rem(21), btnRadius: rem(10.5) },
        mute: { size: rem(18) },
        theme: { radius: rem(5), gap: rem(7), offset: rem(6), ring: rem(1) },
        history: { width: rem(320), height: rem(280), radius: rem(8), pad: rem(8), rowH: rem(12), page: 10, chipH: rem(12), btnW: rem(90), btnH: rem(21), btnRadius: rem(10.5) },
    },
    font: {
        title: { fontSize: rem(12), fontWeight: 'bold' },
        subtitle: { fontSize: rem(8), fontWeight: 'bold' },
        body: { fontSize: rem(7), fontWeight: 'normal' },
        multi: { fontSize: rem(7), fontWeight: 'bold' },
        bet: { fontSize: rem(8), fontWeight: 'bold' },
        caption: { fontSize: rem(5.5), fontWeight: 'normal' },
        icon: { fontSize: rem(11), fontWeight: 'normal' },
        reset: { fontSize: rem(12), fontWeight: 'normal' },
        button: { fontSize: rem(9), fontWeight: 'bold' },
        menu: { fontSize: rem(7), fontWeight: 'normal' },
        menuTitle: { fontSize: rem(8), fontWeight: 'bold' },
        popup: { fontSize: rem(9), fontWeight: 'bold' },
        popupButton: { fontSize: rem(8), fontWeight: 'bold' },
    },
    // màu lấy từ palette.js
    color: {
        screen: palette.bg,
        // ink là chữ tối trên nút sáng, money là số tiền
        text: { main: palette.text, title: palette.text, subtitle: palette.gold, disabled: palette.muted, ink: palette.ink, win: palette.win, money: palette.gold },
        board: { base: palette.grid, active: palette.safe, lose: palette.lose, border: palette.gridBorder, borderActive: palette.safeBorder, loseBorder: palette.loseDark, loseSoft: palette.loseSoft, loseSoftBorder: palette.loseSoftBorder, colActive: palette.colActive, colBorder: palette.primary },
        field: { bg: palette.primaryDark, menu: palette.surfaceDeep, item: palette.grid },
        multi: palette.orange,
        bottom: { bg: palette.surface, border: palette.goldDark },
        bet: { bg: palette.bg, border: palette.gridBorder, text: palette.gold },
        button: { bet: palette.primary, cash: palette.gold, icon: palette.primaryDark, iconBorder: palette.gold, reset: palette.primaryDark, disabled: palette.disabled },
        coin: { bg: palette.primaryDark, dark: palette.goldDark, mid: palette.gold, light: palette.goldLight },
        betMenu: { bg: palette.surface, item: palette.primaryDark },
    },
    grid: {
        rows: 4,
        cols: 7,
    },
    // fields
    fields: {
        Small: { rows: 3, cols: 6 },
        Medium: { rows: 4, cols: 7 },
        Large: { rows: 5, cols: 8 },
    },
    // muti 
    multi: { start: 1, step: 0.15 },
    // menu bet
    bets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.2, 2, 4, 10, 20, 50, 100, 200],
    // thêm point
    bonus: 100,
    // nhạc nền 35%, tiếng hiệu ứng
    sound: { music: 0.35, sfx: 0.8 },
    initialScore: 300,
    // ô boom láy theo index, random lúc bấm BET
    mines: [],
    state: {
        eventMode: 'static',
        cursor: 'pointer',
    },
    input: {
        press: 'pointerdown',
    },
};
// hàm canh giữa so với cha
function centerIn(child, parentWidth, parentHeight, childWidth, childHeight) {
    child.position.set(
        (parentWidth - childWidth) / 2,
        (parentHeight - childHeight) / 2,
    );
}
// mở trang, lấy balance rồi mới vẽ
async function init() {
    const balance = await getBalance(settings.initialScore);
    main(balance);
}
// APP chính
async function main(balance) {
    const { size, font, color, state, input } = settings;
    const bets = [...settings.bets].sort(function(a, b) { return a - b; });
    const betMin = bets[0];
    const betMax = bets[bets.length - 1];
    const app = new PIXI.Application();
    await app.init({
        width: size.screen.width,
        height: size.screen.height,
        backgroundColor: color.screen,
    });
    document.getElementById('app').appendChild(app.canvas);
    loadSounds(settings.sound.music);
    function sfx(name) {
        playSound(name, settings.sound.sfx);
    }

    const frame = settings.fields.Medium;
    const boardWidth = frame.cols * size.box.width + (frame.cols - 1) * size.board.gap;
    const boardHeight = frame.rows * size.box.height + (frame.rows - 1) * size.board.gap;
    const board = new PIXI.Container();
    centerIn(board, size.screen.width, size.screen.height, boardWidth, boardHeight);
    const row2Y = board.y;
    board.y += size.board.gap;

    // //// row 1 /////////////////////////////////////////////////////////
    // title
    const title = new PIXI.Text('DEMO GOAL GAME', { ...font.title, fill: color.text.title });
    title.position.set((size.screen.width - title.width) / 2, size.board.gap + size.title.top);
    app.stage.addChild(title);
    // loa góc phải, ngang với title. mặc định mở, gạch là tắt
    const muteBtn = new PIXI.Container();
    const muteSpeaker = new PIXI.Graphics();
    const muteWaves = new PIXI.Graphics();
    const muteSlash = new PIXI.Graphics();
    const muteBox = size.mute.size;
    muteSpeaker.roundRect(muteBox * 0.16, muteBox * 0.38, muteBox * 0.16, muteBox * 0.24, 1);
    muteSpeaker.fill({ color: color.text.title });
    muteSpeaker.poly([
        muteBox * 0.34, muteBox * 0.34,
        muteBox * 0.56, muteBox * 0.16,
        muteBox * 0.56, muteBox * 0.84,
        muteBox * 0.34, muteBox * 0.66,
    ]);
    muteSpeaker.fill({ color: color.text.title });
    muteWaves.arc(muteBox * 0.52, muteBox * 0.5, muteBox * 0.2, -0.9, 0.9);
    muteWaves.stroke({ width: 2, color: color.text.title });
    muteWaves.arc(muteBox * 0.52, muteBox * 0.5, muteBox * 0.34, -0.8, 0.8);
    muteWaves.stroke({ width: 2, color: color.text.title });
    muteSlash.moveTo(muteBox * 0.12, muteBox * 0.12);
    muteSlash.lineTo(muteBox * 0.88, muteBox * 0.88);
    muteSlash.stroke({ width: 2.5, color: color.text.title });
    muteSlash.visible = false;
    muteBtn.addChild(muteSpeaker, muteWaves, muteSlash);
    muteBtn.position.set(board.x + boardWidth - muteBox, title.y + (title.height - muteBox) / 2);
    muteBtn.hitArea = new PIXI.Rectangle(0, 0, muteBox, muteBox);
    app.stage.addChild(muteBtn);
    // lịch sử góc trái, ngang title, cùng nét với loa
    const historyBtn = new PIXI.Container();
    const historyPage = new PIXI.Graphics();
    const historyLines = new PIXI.Graphics();
    const historyClock = new PIXI.Graphics();
    const historyHands = new PIXI.Graphics();
    historyPage.roundRect(muteBox * 0.28, muteBox * 0.16, muteBox * 0.56, muteBox * 0.68, 2);
    historyPage.stroke({ width: 2, color: color.text.title });
    historyLines.moveTo(muteBox * 0.4, muteBox * 0.36);
    historyLines.lineTo(muteBox * 0.72, muteBox * 0.36);
    historyLines.moveTo(muteBox * 0.4, muteBox * 0.5);
    historyLines.lineTo(muteBox * 0.72, muteBox * 0.5);
    historyLines.moveTo(muteBox * 0.4, muteBox * 0.64);
    historyLines.lineTo(muteBox * 0.64, muteBox * 0.64);
    historyLines.stroke({ width: 2, color: color.text.title });
    historyClock.circle(muteBox * 0.3, muteBox * 0.28, muteBox * 0.16);
    historyClock.fill({ color: color.screen });
    historyClock.stroke({ width: 2, color: color.text.title });
    historyHands.moveTo(muteBox * 0.3, muteBox * 0.28);
    historyHands.lineTo(muteBox * 0.3, muteBox * 0.16);
    historyHands.moveTo(muteBox * 0.3, muteBox * 0.28);
    historyHands.lineTo(muteBox * 0.4, muteBox * 0.34);
    historyHands.stroke({ width: 2, color: color.text.title });
    historyBtn.addChild(historyPage, historyLines, historyClock, historyHands);
    historyBtn.position.set(board.x, title.y + (title.height - muteBox) / 2);
    historyBtn.hitArea = new PIXI.Rectangle(0, 0, muteBox, muteBox);
    app.stage.addChild(historyBtn);
    let soundEnabled = true;
    function paintMute() {
        muteWaves.visible = soundEnabled;
        muteSlash.visible = !soundEnabled;
    }
    // subtitle
    let score = balance;
    const subtitle = new PIXI.Text('', { ...font.subtitle, fill: color.text.subtitle });
    function shownScore() {
        return Number.isInteger(score) ? String(score) : score.toFixed(2);
    }
    function renderSubtitle() {
        const shown = shownScore();
        subtitle.text = 'Storm - ' + shown + ' POINTS';
        subtitle.position.set((size.screen.width - subtitle.width) / 2, size.board.gap * size.subtitle.top + title.height);
    }
    // tâm cụm số trên dòng storm
    function subtitleNumberPoint() {
        const shown = shownScore();
        const metrics = PIXI.CanvasTextMetrics;
        let prefixW = subtitle.width * 0.4;
        let numberW = subtitle.width * 0.2;
        if (metrics && metrics.measureText) {
            prefixW = metrics.measureText('Storm - ', subtitle.style).width;
            numberW = metrics.measureText(shown, subtitle.style).width;
        }
        const g = subtitle.getGlobalPosition();
        return { x: g.x + prefixW + numberW / 2, y: g.y + subtitle.height / 2 };
    }
    function boxCenter(obj, w, h) {
        const g = obj.getGlobalPosition();
        return { x: g.x + w / 2, y: g.y + h / 2 };
    }
    function textCenter(obj) {
        const g = obj.getGlobalPosition();
        return { x: g.x + obj.width / 2, y: g.y + obj.height / 2 };
    }
    renderSubtitle();
    app.stage.addChild(subtitle);

    // //// row 2 /////////////////////////////////////////////////////////
    // tag multi
    let multi = settings.multi.start;
    let cashPoints = 0;
    const multiTag = new PIXI.Container();
    const multiBg = new PIXI.Graphics();
    const multiLabel = new PIXI.Text('Next: ' + multi.toFixed(2) + 'x', { ...font.multi, fill: color.text.ink });
    multiTag.addChild(multiBg, multiLabel);
    app.stage.addChild(multiTag);
    // tự động vẽ lại tag multi
    function placeMultiTag() {
        const tagW = Math.max(size.multi.minWidth, multiLabel.width + size.multi.padX * 2);
        const tagH = size.multi.height;
        multiBg.clear();
        multiBg.roundRect(0, 0, tagW, tagH, tagH / 2);
        multiBg.fill({ color: color.multi });
        multiLabel.position.set((tagW - multiLabel.width) / 2, (tagH - multiLabel.height) / 2);
        multiTag.position.set(board.x + boardWidth - tagW, row2Y - size.board.gap - tagH);
    }

    // btn field
    const fieldOptions = ['Small', 'Medium', 'Large'];
    let fieldName = 'Medium';
    const fieldBtn = new PIXI.Container();
    const fieldBg = new PIXI.Graphics();
    fieldBg.roundRect(0, 0, size.field.width, size.field.height, size.field.height / 2);
    fieldBg.fill({ color: color.field.bg });
    const fieldLabel = new PIXI.Text('Field: ' + fieldName, { ...font.body, fill: color.text.main });
    fieldLabel.position.set(size.field.padX, (size.field.height - fieldLabel.height) / 2);
    const chevron = new PIXI.Graphics();
    chevron.poly([0, 0, size.field.chevronW, 0, size.field.chevronW / 2, size.field.chevronH]);
    chevron.fill({ color: color.text.main });
    chevron.position.set(size.field.width - size.field.padRight - size.field.chevronW, (size.field.height - size.field.chevronH) / 2);
    fieldBtn.addChild(fieldBg, fieldLabel, chevron);
    fieldBtn.position.set(board.x, row2Y - size.board.gap - size.field.height);
    fieldBtn.hitArea = new PIXI.Rectangle(0, 0, size.field.width, size.field.height);
    app.stage.addChild(fieldBtn);
    // select field
    const fieldPicks = [];
    const fieldMenu = new PIXI.Container();
    const fieldMenuH = fieldOptions.length * size.fieldMenu.optionH + size.fieldMenu.pad;
    const fieldMenuBg = new PIXI.Graphics();
    fieldMenuBg.roundRect(0, 0, size.field.width, fieldMenuH, size.fieldMenu.radius);
    fieldMenuBg.fill({ color: color.field.menu });
    fieldMenu.addChild(fieldMenuBg);
    fieldOptions.forEach(function(name, index) {
        const option = new PIXI.Container();
        const optionBg = new PIXI.Graphics();
        const optionW = size.field.width - size.fieldMenu.inset * 2;
        const optionH = size.fieldMenu.optionH - size.fieldMenu.offset;
        optionBg.roundRect(size.fieldMenu.inset, 0, optionW, optionH, size.fieldMenu.itemRadius);
        optionBg.fill({ color: color.field.item });
        const optionText = new PIXI.Text(name, { ...font.body, fill: color.text.main });
        optionText.position.set(size.fieldMenu.inset + (optionW - optionText.width) / 2, (optionH - optionText.height) / 2);
        option.addChild(optionBg, optionText);
        option.position.set(0, size.fieldMenu.padTop + index * size.fieldMenu.optionH);
        option.hitArea = new PIXI.Rectangle(size.fieldMenu.inset, 0, optionW, optionH);
        fieldPicks.push({ target: option, name });
        fieldMenu.addChild(option);
    });
    fieldMenu.position.set(fieldBtn.x, fieldBtn.y + size.field.height + size.fieldMenu.offset);
    fieldMenu.hitArea = new PIXI.Rectangle(0, 0, size.field.width, fieldMenuH);
    fieldMenu.visible = false;

    placeMultiTag();

    // //// row 3 /////////////////////////////////////////////////////////
    // grid
    const cells = [];
    let boxW = size.box.width;
    let boxH = size.box.height;
    let gridRows = frame.rows;
    let gridCols = frame.cols;
    let roundOn = false;
    let controlsLocked = false;
    let activeCol = -1;
    let showMines = false;
    let loseCol = -1;
    let betBeforeAllIn = 0;
    let allInStake = 0;
    let allInArmed = false;
    let allInRound = false;
    let stakeHeld = 0;
    let reachedMulti = null;
    function paintCell(cell, fill, border) {
        cell.clear();
        cell.roundRect(0, 0, boxW, boxH, size.box.radius);
        cell.fill({ color: fill });
        cell.stroke({ width: size.box.border, color: border });
    }
    // hàm vẽ
    function drawGrid(rows, cols) {
        boxW = (boardWidth - (cols - 1) * size.board.gap) / cols;
        boxH = (boardHeight - (rows - 1) * size.board.gap) / rows;
        gridRows = rows;
        gridCols = cols;
        cells.forEach(function(cell) { stopFlip(cell, app.ticker); });
        board.removeChildren();
        cells.length = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = new PIXI.Graphics();
                cell.col = col;
                cell.lost = false;
                paintCell(cell, color.board.base, color.board.border);
                cell.position.set(col * (boxW + size.board.gap), row * (boxH + size.board.gap));
                cell.hitArea = new PIXI.Rectangle(0, 0, boxW, boxH);
                cells.push(cell);
                board.addChild(cell);
            }
        }
    }
    // in ra ô vuông
    drawGrid(frame.rows, frame.cols);
    app.stage.addChild(board);
    app.stage.addChild(fieldMenu);
    // btn đổi theme, chấm tròn nhỏ sát mép phải, canh giữa lưới. màu = màu chủ đạo của theme đó
    const themeBtns = Object.keys(themes).map(function(name, index) {
        const r = size.theme.radius;
        const count = Object.keys(themes).length;
        const stackH = count * r * 2 + (count - 1) * size.theme.gap;
        const btn = new PIXI.Container();
        const swatch = new PIXI.Graphics();
        swatch.circle(r, r, r);
        swatch.fill({ color: themes[name].gridBorder });
        // theme đang dùng có vòng trắng
        if (name === themeName) swatch.stroke({ width: size.theme.ring, color: color.text.main });
        btn.addChild(swatch);
        btn.position.set(size.screen.width - size.theme.offset - r * 2, board.y + (boardHeight - stackH) / 2 + index * (r * 2 + size.theme.gap));
        btn.hitArea = new PIXI.Circle(r, r, r + size.theme.gap / 2);
        app.stage.addChild(btn);
        return { name: name, btn: btn };
    });

    // //// row 4 /////////////////////////////////////////////////////////
    const barW = size.bottom.padX * 2
        + size.bet.width + size.bottom.gapBet
        + size.icon.size + size.bottom.gap
        + size.icon.size + size.bottom.gap
        + size.icon.size + size.bottom.gapWide
        + size.reset.size + size.bottom.gapWide
        + size.play.width;
    const barH = size.bottom.height;
    const bottom = new PIXI.Container();
    const bottomBg = new PIXI.Graphics();
    const barInset = size.bottom.border / 2;
    bottomBg.roundRect(barInset, barInset, barW - size.bottom.border, barH - size.bottom.border, size.bottom.radius);
    bottomBg.fill({ color: color.bottom.bg });
    bottomBg.stroke({ width: size.bottom.border, color: color.bottom.border });
    bottom.addChild(bottomBg);
    bottom.position.set((size.screen.width - barW) / 2, size.screen.height - barH - size.bottom.margin);
    app.stage.addChild(bottom);

    let betValue = betMin.toFixed(2);
    let betFocused = false;
    let barX = size.bottom.padX;
    // input bet
    const betPill = new PIXI.Container();
    const betBg = new PIXI.Graphics();
    // vẽ ô bet
    function drawBetBg() {
        betBg.clear();
        betBg.roundRect(0, 0, size.bet.width, size.bet.height, size.bet.radius);
        betBg.fill({ color: color.bet.bg });
        betBg.stroke({ width: size.bet.border, color: betFocused ? color.bet.text : color.bet.border });
    }
    drawBetBg();
    const betCaption = new PIXI.Text('Bet POINTS', { ...font.caption, fill: color.text.main });
    betCaption.position.set((size.bet.width - betCaption.width) / 2, size.bet.captionY);
    const betValueText = new PIXI.Text(betValue, { ...font.bet, fill: color.bet.text });
    const caret = new PIXI.Graphics();
    caret.rect(0, 0, rem(1), font.bet.fontSize);
    caret.fill({ color: color.bet.text });
    caret.visible = false;
    function placeCaret() {
        caret.position.set(
            betValueText.x + betValueText.width + rem(1),
            betValueText.y + (betValueText.height - font.bet.fontSize) / 2,
        );
    }
    function renderBet() {
        betValueText.text = betValue;
        betValueText.position.set((size.bet.width - betValueText.width) / 2, size.bet.valueY);
        placeCaret();
    }
    renderBet();
    betPill.addChild(betBg, betCaption, betValueText, caret);
    betPill.position.set(barX, (barH - size.bet.height) / 2);
    betPill.hitArea = new PIXI.Rectangle(0, 0, size.bet.width, size.bet.height);
    bottom.addChild(betPill);
    barX += size.bet.width + size.bottom.gapBet;

    // vẽ btn hình tròn, dùng cho btn coin và btn step
    function circleButton(x, diameter, fill) {
        const btn = new PIXI.Container();
        const g = new PIXI.Graphics();
        g.circle(diameter / 2, diameter / 2, diameter / 2);
        g.fill({ color: fill });
        btn.addChild(g);
        btn.position.set(x, (barH - diameter) / 2);
        btn.hitArea = new PIXI.Circle(diameter / 2, diameter / 2, diameter / 2);
        bottom.addChild(btn);
        return btn;
    }
    function circleParts(x, diameter) {
        const btn = new PIXI.Container();
        const bg = new PIXI.Graphics();
        btn.addChild(bg);
        btn.position.set(x, (barH - diameter) / 2);
        btn.hitArea = new PIXI.Circle(diameter / 2, diameter / 2, diameter / 2);
        bottom.addChild(btn);
        return { btn, bg };
    }
    // function step button
    function stepButton(x) {
        return circleParts(x, size.icon.size);
    }
    // btn minus
    const minusParts = stepButton(barX);
    const minusBtn = minusParts.btn;
    const minusBg = minusParts.bg;
    const minusLabel = new PIXI.Text('−', { ...font.icon, fill: color.text.main });
    minusLabel.position.set((size.icon.size - minusLabel.width) / 2, (size.icon.size - minusLabel.height) / 2);
    minusBtn.addChild(minusLabel);
    barX += size.icon.size + size.bottom.gap;

    // btn coin
    const coinBtn = circleButton(barX, size.icon.size, color.coin.bg);
    const coins = new PIXI.Graphics();
    const coinCenter = size.icon.size / 2;
    coins.circle(coinCenter - rem(2.5), coinCenter + rem(1.5), size.coin.radius);
    coins.fill({ color: color.coin.dark });
    coins.circle(coinCenter + rem(2.5), coinCenter + rem(1.5), size.coin.radius);
    coins.fill({ color: color.coin.mid });
    coins.circle(coinCenter, coinCenter - rem(2), size.coin.radius);
    coins.fill({ color: color.coin.light });
    coinBtn.addChild(coins);
    barX += size.icon.size + size.bottom.gap;

    // btn plus
    const plusParts = stepButton(barX);
    const plusBtn = plusParts.btn;
    const plusBg = plusParts.bg;
    const plusLabel = new PIXI.Text('+', { ...font.icon, fill: color.text.main });
    plusLabel.position.set((size.icon.size - plusLabel.width) / 2, (size.icon.size - plusLabel.height) / 2);
    plusBtn.addChild(plusLabel);
    barX += size.icon.size + size.bottom.gapWide;

    // btn reset
    const resetParts = circleParts(barX, size.reset.size);
    const resetBtn = resetParts.btn;
    const resetBg = resetParts.bg;
    const refreshLabel = new PIXI.Text('↻', { ...font.reset, fill: color.text.main });
    refreshLabel.position.set((size.reset.size - refreshLabel.width) / 2, (size.reset.size - refreshLabel.height) / 2 - rem(1));
    resetBtn.addChild(refreshLabel);
    barX += size.reset.size + size.bottom.gapWide;

    // btn bet
    const playBtn = new PIXI.Container();
    const playBg = new PIXI.Graphics();
    playBg.roundRect(0, 0, size.play.width, size.play.height, size.play.radius);
    playBg.fill({ color: color.button.bet });
    const playIcon = new PIXI.Graphics();
    playIcon.poly([0, 0, 0, size.play.iconH, size.play.iconW, size.play.iconH / 2]);
    playIcon.fill({ color: color.text.ink });
    const playIconX = (size.play.height - size.play.iconH) / 2 + size.bottom.gap;
    const playIconY = (size.play.height - size.play.iconH) / 2;
    playIcon.position.set(playIconX, playIconY);
    const playLabel = new PIXI.Text('BET', { ...font.button, fill: color.text.ink });
    playLabel.position.set(playIconX + size.play.iconW + size.bottom.gap + rem(4), (size.play.height - playLabel.height) / 2);
    playBtn.addChild(playBg, playIcon, playLabel);
    playBtn.position.set(barX, (barH - size.play.height) / 2);
    playBtn.hitArea = new PIXI.Rectangle(0, 0, size.play.width, size.play.height);
    bottom.addChild(playBtn);

    // menu bet
    const betPicks = [];
    const menuRows = Math.ceil(bets.length / size.betMenu.cols);
    const menuW = size.betMenu.pad * 2 + size.betMenu.cols * size.betMenu.itemW + size.betMenu.gap;
    const menuH = size.betMenu.pad + size.betMenu.titleH + size.betMenu.gap + menuRows * size.betMenu.itemH + (menuRows - 1) * size.betMenu.gap + size.betMenu.pad;
    const betMenu = new PIXI.Container();
    const betMenuBg = new PIXI.Graphics();
    betMenuBg.roundRect(0, 0, menuW, menuH, size.betMenu.radius);
    betMenuBg.fill({ color: color.betMenu.bg });
    const betMenuTitle = new PIXI.Text('Bet POINTS', { ...font.menuTitle, fill: color.text.main });
    betMenuTitle.position.set((menuW - betMenuTitle.width) / 2, size.betMenu.pad);
    betMenu.addChild(betMenuBg, betMenuTitle);
    bets.forEach(function(amount, index) {
        const col = index % size.betMenu.cols;
        const rowIndex = Math.floor(index / size.betMenu.cols);
        const item = new PIXI.Container();
        const itemBg = new PIXI.Graphics();
        itemBg.roundRect(0, 0, size.betMenu.itemW, size.betMenu.itemH, size.betMenu.itemRadius);
        const itemText = new PIXI.Text(amount.toFixed(2), { ...font.menu, fill: color.text.main });
        itemText.position.set((size.betMenu.itemW - itemText.width) / 2, (size.betMenu.itemH - itemText.height) / 2);
        item.addChild(itemBg, itemText);
        item.position.set(
            size.betMenu.pad + col * (size.betMenu.itemW + size.betMenu.gap),
            size.betMenu.pad + size.betMenu.titleH + size.betMenu.gap + rowIndex * (size.betMenu.itemH + size.betMenu.gap),
        );
        item.hitArea = new PIXI.Rectangle(0, 0, size.betMenu.itemW, size.betMenu.itemH);
        betPicks.push({ target: item, amount, bg: itemBg, label: itemText });
        betMenu.addChild(item);
    });
    betMenu.position.set(bottom.x + size.bottom.padX, bottom.y - menuH - size.betMenu.offset);
    betMenu.hitArea = new PIXI.Rectangle(0, 0, menuW, menuH);
    betMenu.visible = false;
    app.stage.addChild(betMenu);
    app.stage.addChild(multiTag);

    // //// actions /////////////////////////////////////////////////////////
    function listen(target, fn, cursor = state.cursor) {
        target.eventMode = state.eventMode;
        target.cursor = cursor;
        target.on(input.press, function(event) {
            event.stopPropagation();
            fn();
        });
    }
    listen(historyBtn, function() {
        sfx('btn');
        closePopups();
        closeBroke();
        closeResult();
        openHistory();
    });
    // bấm đổi theme, tải lại trang, trong ván thì khóa
    themeBtns.forEach(function(item) {
        listen(item.btn, function() {
            if (controlsLocked || item.name === themeName) return;
            sfx('btn');
            switchTheme(item.name);
        }, item.name === themeName ? 'default' : state.cursor);
    });
    listen(muteBtn, function() {
        soundEnabled = !soundEnabled;
        paintMute();
        if (soundEnabled) unmuteSound(settings.sound.music);
        else muteSound();
    });
    function closePopups() {
        fieldMenu.visible = false;
        betMenu.visible = false;
    }
    function showMulti() {
        multiLabel.text = 'Next: ' + multi.toFixed(2) + 'x';
        placeMultiTag();
    }
    // tăng multi
    function bumpMulti() {
        multi = Math.round((multi + settings.multi.step) * 100) / 100;
        showMulti();
    }
    // btn + -
    function paintStep(bg, label, enabled) {
        const d = size.icon.size;
        bg.clear();
        bg.circle(d / 2, d / 2, d / 2 - rem(0.5));
        bg.fill({ color: enabled ? color.button.icon : color.button.disabled });
        bg.stroke({ width: rem(1), color: enabled ? color.button.iconBorder : color.text.disabled });
        label.style.fill = enabled ? color.text.main : color.text.disabled;
    }
    // số trong ô bet, nếu không có thì mặc định là bet min
    function betAmount() {
        const n = parseFloat(betValue);
        return Number.isFinite(n) ? n : betMin;
    }
    // check p đủ để bet mức min
    function canAfford(amount = betAmount()) {
        return amount <= score + EPSILON;
    }
    function paintBetPick(bg, label, on, enabled) {
        bg.clear();
        bg.roundRect(0, 0, size.betMenu.itemW, size.betMenu.itemH, size.betMenu.itemRadius);
        bg.fill({ color: on ? color.button.bet : enabled ? color.betMenu.item : color.button.disabled });
        label.style.fill = on ? color.text.ink : enabled ? color.text.main : color.text.disabled;
    }
    // refresh bet
    function refreshBetControls() {
        const current = betAmount();
        const canMinus = !controlsLocked && bets.some(function(amount) { return amount < current - EPSILON; });
        const canPlus = !controlsLocked && bets.some(function(amount) { return amount > current + EPSILON && canAfford(amount); });
        paintStep(minusBg, minusLabel, canMinus);
        paintStep(plusBg, plusLabel, canPlus);
        minusBtn.eventMode = canMinus ? state.eventMode : 'none';
        minusBtn.cursor = canMinus ? state.cursor : 'default';
        plusBtn.eventMode = canPlus ? state.eventMode : 'none';
        plusBtn.cursor = canPlus ? state.cursor : 'default';
        betPicks.forEach(function({ target, amount, bg, label }) {
            const enabled = canAfford(amount);
            paintBetPick(bg, label, enabled && Math.abs(amount - current) < EPSILON, enabled);
            target.eventMode = enabled && !controlsLocked ? state.eventMode : 'none';
            target.cursor = enabled && !controlsLocked ? state.cursor : 'default';
        });
        if (!roundOn) paintPlay('bet');
    }
    // function btn + -, tăng hoặc giảm bet
    function stepBet(dir) {
        closePopups();
        const current = betAmount();
        const next = dir > 0
            ? bets.find(function(amount) { return amount > current + EPSILON && canAfford(amount); })
            : [...bets].reverse().find(function(amount) { return amount < current - EPSILON; });
        if (next == null) return;
        setBet(next);
    }
    // ghi vào ô bet, nếu đổi tay thì hủy All in đang chờ
    function setBet(n) {
        betValue = Math.min(betMax, Math.max(betMin, n)).toFixed(2);
        if (allInArmed && Math.abs(betAmount() - allInStake) > EPSILON) {
            allInArmed = false;
            betBeforeAllIn = 0;
        }
        renderBet();
        refreshBetControls();
    }
    // ghi vào ô bet, nếu đổi tay thì hủy all in đang chọn
    function commitBet() {
        const n = parseFloat(betValue);
        setBet(Number.isFinite(n) ? n : betMin);
    }
    // mốc trong bet không vượt quá limit
    function nearestBet(limit) {
        let near = null;
        bets.forEach(function(amount) {
            if (amount <= limit + EPSILON) near = amount;
        });
        return near == null ? betMin : near;
    }
    // check btn reset active hay disabled
    function paintReset(enabled) {
        const d = size.reset.size;
        resetBg.clear();
        resetBg.circle(d / 2, d / 2, d / 2 - rem(0.5));
        resetBg.fill({ color: enabled ? color.button.reset : color.button.disabled });
        resetBg.stroke({ width: rem(1), color: enabled ? color.text.main : color.text.disabled });
        refreshLabel.style.fill = enabled ? color.text.main : color.text.disabled;
        resetBtn.eventMode = enabled ? state.eventMode : 'none';
        resetBtn.cursor = enabled ? state.cursor : 'default';
    }
    // màu ô theo trạng thái ván
    function cellLook(cell, index) {
        const mine = showMines && settings.mines.includes(index);
        const soft = loseCol >= 0 && cell.col >= loseCol;
        const inCol = roundOn && cell.col === activeCol && !cell.opened && !cell.lost;
        if (mine || cell.lost) return { fill: color.board.lose, border: color.board.loseBorder, canClick: false };
        if (cell.opened) return { fill: color.board.active, border: color.board.borderActive, canClick: false };
        if (soft) return { fill: color.board.loseSoft, border: color.board.loseSoftBorder, canClick: false };
        if (inCol) return { fill: color.board.colActive, border: color.board.colBorder, canClick: true };
        return { fill: color.board.base, border: color.board.border, canClick: false };
    }
    // vẽ ô vuông
    function paintBoard() {
        cells.forEach(function(cell, index) {
            const look = cellLook(cell, index);
            if (!cell.flipping) paintCell(cell, look.fill, look.border);
            cell.eventMode = look.canClick ? state.eventMode : 'none';
            cell.cursor = look.canClick ? state.cursor : 'default';
        });
    }
    // tắt ván, chưa xóa màu ô
    function stopRound() {
        roundOn = false;
        activeCol = -1;
        cashPoints = 0;
        multi = settings.multi.start;
        showMulti();
    }
    // function hiện ô boom, nút về BET
    function loseRound(cell) {
        cell.lost = true;
        showMines = true;
        loseCol = cell.col;
        const balanceBefore = Math.round((score + stakeHeld) * 100) / 100;
        const bet = stakeHeld;
        const profit = -bet;
        // bet đã trừ lúc vào ván
        stakeHeld = 0;
        updateBalance(score);
        saveGameResult({
            field: fieldName,
            rows: gridRows,
            cols: gridCols,
            bet: bet,
            result: 'lose',
            profit: profit,
            balanceBefore: balanceBefore,
            balanceAfter: score,
            maxMulti: reachedMulti,
        });
        renderSubtitle();
        // thua all in thì bet về mức thấp nhất
        if (allInRound) {
            setBet(betMin);
            betBeforeAllIn = 0;
        }
        allInRound = false;
        allInArmed = false;
        stopRound();
        paintBoard();
        paintPlay('bet');
        return { won: false, bet: bet, profit: profit, balance: score };
    }
    // label btn bet hoặc cash out + số point
    function paintPlay(mode) {
        const cash = mode !== 'bet';
        const enabled = mode === 'bet' || mode === 'cash';
        playBg.clear();
        playBg.roundRect(0, 0, size.play.width, size.play.height, size.play.radius);
        playBg.fill({ color: cash ? color.button.cash : color.button.bet });
        playIcon.visible = !cash;
        playBtn.alpha = mode === 'wait' ? 0.45 : 1;
        // cash out
        if (cash) {
            playLabel.text = 'Cash Out\n' + cashPoints.toFixed(2);
            playLabel.style.align = 'center';
            playLabel.style.fill = color.text.ink;
            playLabel.position.set((size.play.width - playLabel.width) / 2, (size.play.height - playLabel.height) / 2);
        } else {
            playLabel.text = 'BET';
            playLabel.style.fill = color.text.ink;
            playLabel.position.set(playIconX + size.play.iconW + size.bottom.gap + rem(4), (size.play.height - playLabel.height) / 2);
        }
        playBtn.eventMode = enabled ? state.eventMode : 'none';
        playBtn.cursor = enabled ? state.cursor : 'default';
    }
    // kết thúc ván(ko tính p)
    function endRound() {
        stopRound();
        showMines = false;
        loseCol = -1;
        cells.forEach(function(cell) { cell.opened = false; cell.lost = false; });
        paintBoard();
        paintPlay('bet');
    }
    // disable hoặc open field, ô bet, btn coin
    function paintSetup(locked) {
        controlsLocked = locked;
        if (locked && betFocused) {
            focusBet(false);
            commitBet();
        }
        fieldMenu.visible = false;
        betMenu.visible = false;
        fieldBtn.alpha = locked ? 0.45 : 1;
        betPill.alpha = locked ? 0.45 : 1;
        coinBtn.alpha = locked ? 0.45 : 1;
        fieldBtn.eventMode = locked ? 'none' : state.eventMode;
        fieldBtn.cursor = locked ? 'default' : state.cursor;
        betPill.eventMode = locked ? 'none' : state.eventMode;
        betPill.cursor = locked ? 'default' : 'text';
        coinBtn.eventMode = locked ? 'none' : state.eventMode;
        coinBtn.cursor = locked ? 'default' : state.cursor;
        themeBtns.forEach(function(item) {
            item.btn.alpha = locked ? 0.45 : 1;
            item.btn.cursor = locked || item.name === themeName ? 'default' : state.cursor;
        });
        refreshBetControls();
    }
    // bắt đầu chơi
    function startRound() {
        closePopups();
        if (!allInArmed) betBeforeAllIn = 0;
        allInRound = allInArmed;
        allInArmed = false;
        roundOn = true;
        activeCol = 0;
        cashPoints = 0;
        multi = settings.multi.start;
        reachedMulti = null;
        showMulti();
        showMines = false;
        loseCol = -1;
        settings.mines = randomMines(gridRows, gridCols);
        // vào ván trừ bet trên subtitle
        const fromScore = subtitleNumberPoint();
        stakeHeld = betAmount();
        sfx('coin');
        score = Math.round((score - stakeHeld) * 100) / 100;
        renderSubtitle();
        // animation hút point xuống bet
        flowPoints(app.stage, app.ticker, fromScore, textCenter(betValueText), color.bet.text, betValueText);
        cells.forEach(function(cell) { cell.opened = false; cell.lost = false; });
        paintBoard();
        paintReset(true);
        paintPlay('wait');
        paintSetup(true);
    }

    // //// lật ô /////////////////////////////////////////////////
    // màu đổi ở giữa nhịp, hàm lật nằm ở animation.js
    function playFlip(cell, done) {
        flipCell(cell, boxH, app.ticker, function() {
            const look = cellLook(cell, cells.indexOf(cell));
            paintCell(cell, look.fill, look.border);
        }, function() {
            paintBoard();
            if (done) done();
        });
    }
    // click ô
    function bindCell(cell) {
        listen(cell, function() {
            closePopups();
            if (!roundOn || cell.col !== activeCol || cell.opened || cell.lost || cell.flipping) return;
            cell.flipping = true;
            const hit = settings.mines.includes(cells.indexOf(cell));
            if (hit) {
                sfx('boom');
                const info = loseRound(cell);
                // popup thua, sau khi đã ghi balance và history
                // animation lật ô
                playFlip(cell, function() { openResult(info); });
                return;
            }
            sfx('click');
            cell.opened = true;
            bumpMulti();
            reachedMulti = multi;
            const stake = parseFloat(betValue);
            const bet = Number.isFinite(stake) ? stake : 0;
            cashPoints = Math.round((bet * multi + cashPoints) * 100) / 100;
            // hết cột cuối: thắng, tự cash out
            if (cell.col >= gridCols - 1) {
                let info;
                let left = 2;
                function finish() {
                    left -= 1;
                    if (left > 0) return;
                    openResult(info);
                }
                info = cashOut(finish);
                // popup thắng, sau khi đã ghi balance + history
                // animation lật ô, popup chờ cả lật + hút point
                playFlip(cell, finish);
                return;
            }
            activeCol += 1;
            paintBoard();
            paintPlay('cash');
            // animation lật ô
            playFlip(cell);
        });
    }
    cells.forEach(bindCell);
    paintBoard();
    paintReset(false);
    // click field
    listen(fieldBtn, function() {
        sfx('btn');
        const next = !fieldMenu.visible;
        closePopups();
        fieldMenu.visible = next;
    });
    // click select field
    fieldPicks.forEach(function({ target, name }) { listen(target, function() {
        sfx('btn');
        closePopups();
        fieldName = name;
        fieldLabel.text = 'Field: ' + name;
        fieldLabel.position.set(size.field.padX, (size.field.height - fieldLabel.height) / 2);
        const spec = settings.fields[name];
        drawGrid(spec.rows, spec.cols);
        cells.forEach(bindCell);
        endRound();
    }); });
    // click input bet
    let caretBlink = 0;
    function focusBet(on) {
        if (on) closePopups();
        betFocused = on;
        caret.visible = on;
        caretBlink = 0;
        drawBetBg();
        if (on) placeCaret();
    }
    // nhấp nháy con trỏ trong ô bet
    app.ticker.add(function(ticker) {
        if (!betFocused) return;
        caretBlink += ticker.deltaMS;
        if (caretBlink < 500) return;
        caret.visible = !caret.visible;
        caretBlink = 0;
    });
    listen(betPill, function() { focusBet(true); }, 'text');
    // click -
    listen(minusBtn, function() { sfx('btn'); stepBet(-1); });
    // click +
    listen(plusBtn, function() { sfx('btn'); stepBet(1); });
    // click select bet
    listen(coinBtn, function() {
        const next = !betMenu.visible;
        closePopups();
        refreshBetControls();
        betMenu.visible = next;
    });
    // lặp qua các bet
    betPicks.forEach(function({ target, amount }) { listen(target, function() {
        if (!canAfford(amount)) return;
        closePopups();
        setBet(amount);
    }); });
    // //// popup hết điểm //////////////////////////////////////////
    // popup thiếu point
    const brokePopup = new PIXI.Container();
    const brokeShade = new PIXI.Graphics();
    brokeShade.rect(0, 0, size.screen.width, size.screen.height);
    brokeShade.fill({ color: palette.shade, alpha: palette.shadeAlpha });
    const brokeCard = new PIXI.Container();
    const brokeBg = new PIXI.Graphics();
    brokeBg.roundRect(0, 0, size.broke.width, size.broke.height, size.broke.radius);
    brokeBg.fill({ color: color.betMenu.bg });
    // label popup khi score < bet
    const brokeTitle = new PIXI.Text('Số POINTS của bạn không đủ.', { ...font.popup, fill: color.text.main });
    brokeTitle.position.set((size.broke.width - brokeTitle.width) / 2, rem(14));
    const brokeDetail = new PIXI.Text('', { ...font.body, fill: color.text.subtitle });
    // vẽ btn thêm point hoặc all in
    function brokeButton(label, x, fill, ink) {
        const btn = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, size.broke.btnW, size.broke.btnH, size.broke.btnRadius);
        bg.fill({ color: fill });
        const text = new PIXI.Text(label, { ...font.popupButton, fill: ink });
        text.position.set((size.broke.btnW - text.width) / 2, (size.broke.btnH - text.height) / 2);
        btn.addChild(bg, text);
        btn.position.set(x, size.broke.height - size.broke.btnH - rem(14));
        btn.hitArea = new PIXI.Rectangle(0, 0, size.broke.btnW, size.broke.btnH);
        return { btn, text };
    }
    // btn 1 Chọn lại, btn 2 All in hoặc thêm point
    const brokeRetry = brokeButton('Chọn lại', (size.broke.width - size.broke.gap) / 2 - size.broke.btnW, color.button.reset, color.text.main);
    const brokeAction = brokeButton('All in', (size.broke.width + size.broke.gap) / 2, color.button.bet, color.text.ink);
    brokeCard.addChild(brokeBg, brokeTitle, brokeDetail, brokeRetry.btn, brokeAction.btn);
    brokeCard.position.set((size.screen.width - size.broke.width) / 2, (size.screen.height - size.broke.height) / 2);
    brokePopup.addChild(brokeShade, brokeCard);
    brokePopup.hitArea = new PIXI.Rectangle(0, 0, size.screen.width, size.screen.height);
    brokePopup.visible = false;
    app.stage.addChild(brokePopup);
    // dưới bet nhỏ nhất thì đổi label btn 2
    function openBroke() {
        closePopups();
        closeResult();
        closeHistory();
        const low = score + EPSILON < betMin;
        // dưới 0.10 báo hết điểm, không thì không đủ bet
        brokeTitle.text = low ? 'Bạn đã hết POINTS.' : 'Số POINTS của bạn không đủ.';
        brokeTitle.position.set((size.broke.width - brokeTitle.width) / 2, rem(14));
        brokeDetail.text = low
            ? 'Bạn còn ' + score.toFixed(2) + '.'
            : 'Bet ' + betAmount().toFixed(2) + ' · Bạn còn ' + score.toFixed(2);
        brokeDetail.position.set((size.broke.width - brokeDetail.width) / 2, rem(34));
        brokeAction.text.text = low ? 'Thêm ' + settings.bonus + ' Point' : 'All in';
        brokeAction.text.position.set((size.broke.btnW - brokeAction.text.width) / 2, (size.broke.btnH - brokeAction.text.height) / 2);
        brokePopup.visible = true;
    }
    function closeBroke() {
        brokePopup.visible = false;
    }
    // //// popup kết quả ///////////////////////////////////////////
    const resultPopup = new PIXI.Container();
    const resultShade = new PIXI.Graphics();
    resultShade.rect(0, 0, size.screen.width, size.screen.height);
    resultShade.fill({ color: palette.shade, alpha: palette.shadeAlpha });
    const resultCard = new PIXI.Container();
    const resultBg = new PIXI.Graphics();
    const resultTitle = new PIXI.Text('', { ...font.popup, fill: color.text.main });
    const resultBet = new PIXI.Text('', { ...font.body, fill: color.text.main });
    const resultProfit = new PIXI.Text('', { ...font.body, fill: color.text.main });
    const resultBalance = new PIXI.Text('', { ...font.body, fill: color.text.main });
    const resultOk = new PIXI.Container();
    const resultOkBg = new PIXI.Graphics();
    const resultOkLabel = new PIXI.Text('Đóng', { ...font.popupButton, fill: color.text.main });
    resultOkLabel.position.set((size.result.btnW - resultOkLabel.width) / 2, (size.result.btnH - resultOkLabel.height) / 2);
    resultOk.addChild(resultOkBg, resultOkLabel);
    resultOk.position.set((size.result.width - size.result.btnW) / 2, size.result.height - size.result.btnH - rem(14));
    resultOk.hitArea = new PIXI.Rectangle(0, 0, size.result.btnW, size.result.btnH);
    resultCard.addChild(resultBg, resultTitle, resultBet, resultProfit, resultBalance, resultOk);
    resultCard.position.set((size.screen.width - size.result.width) / 2, (size.screen.height - size.result.height) / 2);
    resultPopup.addChild(resultShade, resultCard);
    resultPopup.hitArea = new PIXI.Rectangle(0, 0, size.screen.width, size.screen.height);
    resultPopup.visible = false;
    app.stage.addChild(resultPopup);
    function placeResultLine(label, y) {
        label.position.set((size.result.width - label.width) / 2, y);
    }
    function paintResultCard(won) {
        resultBg.clear();
        resultBg.roundRect(0, 0, size.result.width, size.result.height, size.result.radius);
        resultBg.fill({ color: color.betMenu.bg });
        resultBg.stroke({ width: rem(2), color: won ? color.button.bet : color.board.lose });
        resultOkBg.clear();
        resultOkBg.roundRect(0, 0, size.result.btnW, size.result.btnH, size.result.btnRadius);
        resultOkBg.fill({ color: won ? color.button.bet : color.board.lose });
        resultOkLabel.style.fill = won ? color.text.ink : color.text.main;
    }
    // hiện sau khi đã ghi balance và history
    function openResult(info) {
        closePopups();
        closeBroke();
        closeHistory();
        paintResultCard(info.won);
        resultTitle.text = info.won ? 'Thắng' : 'Thua';
        resultTitle.style.fill = info.won ? color.text.win : color.board.lose;
        resultBet.text = 'Bet: ' + info.bet.toFixed(2);
        resultProfit.text = (info.won ? 'Win: ' : 'Lose: ') + (info.profit > 0 ? '+' : '') + info.profit.toFixed(2);
        resultProfit.style.fill = info.profit < 0 ? color.board.lose : color.text.money;
        resultBalance.text = 'POINTS: ' + info.balance.toFixed(2);
        placeResultLine(resultTitle, rem(16));
        placeResultLine(resultBet, rem(46));
        placeResultLine(resultProfit, rem(62));
        placeResultLine(resultBalance, rem(78));
        resultPopup.visible = true;
    }
    function closeResult() {
        resultPopup.visible = false;
    }
    // lấy của nút reset
    function doReset() {
        sfx('btn');
        // tắt hút point nếu đang bay
        stopFlow(app.ticker);
        closePopups();
        closeBroke();
        closeResult();
        closeHistory();
        // reset giữa ván thì trả bet, chưa ghi history
        if (stakeHeld) {
            score = Math.round((score + stakeHeld) * 100) / 100;
            stakeHeld = 0;
            renderSubtitle();
        }
        allInArmed = false;
        allInRound = false;
        endRound();
        paintReset(false);
        paintSetup(false);
    }
    // score > mức cũ thì trả mức đó, không thì lấy mốc gần nhất
    function settleBet(level) {
        if (score > level + EPSILON) setBet(level);
        else setBet(nearestBet(score));
        betBeforeAllIn = 0;
    }
    // chỉ chạy khi ván vừa chơi là all in
    function applyAllInResult() {
        if (!allInRound) return;
        allInRound = false;
        allInArmed = false;
        settleBet(betBeforeAllIn);
    }
    // cộng cash point vào storm, hiện ô boom, nút về bet
    function cashOut(done) {
        const fromCash = boxCenter(playBtn, size.play.width, size.play.height);
        const balanceBefore = Math.round((score + stakeHeld) * 100) / 100;
        const profit = cashPoints;
        const bet = stakeHeld;
        stakeHeld = 0;
        sfx('win');
        score = Math.round((score + profit) * 100) / 100;
        updateBalance(score);
        saveGameResult({
            field: fieldName,
            rows: gridRows,
            cols: gridCols,
            bet: bet,
            result: 'win',
            profit: profit,
            balanceBefore: balanceBefore,
            balanceAfter: score,
            maxMulti: reachedMulti,
        });
        renderSubtitle();
        showMines = true;
        loseCol = -1;
        stopRound();
        applyAllInResult();
        paintBoard();
        // animation hút point - cash out lên - nút disabled tới khi bay xong
        if (profit > EPSILON) {
            paintPlay('bet');
            playBtn.eventMode = 'none';
            playBtn.alpha = 0.45;
            flowPoints(app.stage, app.ticker, fromCash, subtitleNumberPoint(), color.text.subtitle, subtitle, function() {
                paintPlay('bet');
                if (done) done();
            });
        } else {
            paintPlay('bet');
            if (done) done();
        }
        return { won: true, bet: bet, profit: profit, balance: score };
    }
    // popup thiếu point
    listen(brokePopup, function() {});
    listen(resultPopup, function() {});
    listen(resultOk, function() { sfx('btn'); closeResult(); });
    listen(brokeRetry.btn, function() { doReset(); });
    // btn all in hoặc thêm point
    listen(brokeAction.btn, function() {
        sfx('btn');
        if (score + EPSILON < betMin) {
            // thêm point
            score = Math.round((score + settings.bonus) * 100) / 100;
            updateBalance(score);
            renderSubtitle();
            allInRound = false;
            allInArmed = false;
            settleBet(betBeforeAllIn > 0 ? betBeforeAllIn : betAmount());
            closeBroke();
            return;
        }
        // all in nhớ mức bet, điền hết p vào ô bet
        const previous = betAmount();
        const stake = Math.round(score * 100) / 100;
        setBet(stake);
        betBeforeAllIn = previous;
        allInStake = stake;
        allInArmed = true;
        closeBroke();
    });
    // click reset
    listen(resetBtn, function() { doReset(); });
    paintReset(false);
    // click bet
    listen(playBtn, function() {
        if (!roundOn) {
            if (canAfford()) startRound();
            else {
                sfx('btn');
                openBroke();
            }
        }
        // popup thắng, sau khi đã ghi balance và history
        else {
            let info;
            info = cashOut(function() { openResult(info); });
        }
    });
    paintPlay('bet');
    listen(fieldMenu, function() {});
    listen(betMenu, function() {});
    refreshBetControls();

    app.stage.eventMode = state.eventMode;
    app.stage.hitArea = app.screen;
    app.stage.on(input.press, function() {
        closePopups();
        if (!betFocused) return;
        focusBet(false);
        commitBet();
    });
    window.addEventListener('keydown', function(event) {
        if (!betFocused) return;
        if (event.key === 'Enter') {
            focusBet(false);
            commitBet();
            return;
        }
        if (event.key === 'Backspace') {
            betValue = betValue.slice(0, -1);
            renderBet();
            event.preventDefault();
            return;
        }
        if (event.key === '.' && betValue.includes('.')) return;
        if (!/^[0-9.]$/.test(event.key) || betValue.length >= betMax.toFixed(2).length) return;
        betValue += event.key;
        renderBet();
        event.preventDefault();
    });
    mountHistory(app.stage, {
        screen: size.screen,
        card: size.history,
        sfx: settings.sound.sfx,
        font: {
            title: font.popup,
            body: font.body,
            chip: font.popupButton,
            filter: { fontSize: rem(6.5), fontWeight: 'normal' },
            row: { fontSize: rem(6), fontWeight: 'normal' },
        },
        color: {
            card: color.betMenu.bg,
            text: color.text.main,
            muted: color.text.disabled,
            ink: color.text.ink,
            win: color.text.win,
            money: color.text.money,
            lose: color.board.lose,
            frame: color.bottom.border,
            chip: color.field.bg,
            button: color.button.bet,
            list: color.field.menu,
            zebra: color.bottom.bg,
            pick: color.board.colActive,
        },
    });
}

document.addEventListener('DOMContentLoaded', init);
