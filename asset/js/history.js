// popup lịch sử, không giữ game đang chơi
let historyView = null;
// dựng popup một lần, nút lịch sử ở main gọi openHistory
function mountHistory(stage, look) {
    const cardW = look.card.width;
    const cardH = look.card.height;
    const popup = new PIXI.Container();
    // nền mờ, bấm ra ngoài thì đóng
    const shade = new PIXI.Graphics();
    shade.rect(0, 0, look.screen.width, look.screen.height);
    shade.fill({ color: palette.shade, alpha: palette.shadeAlpha });
    shade.eventMode = 'static';
    shade.on('pointerdown', function(event) {
        event.stopPropagation();
        closeHistory();
    });
    const card = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, cardW, cardH, look.card.radius);
    bg.fill({ color: look.color.card });
    bg.stroke({ width: rem(1), color: look.color.frame });
    card.eventMode = 'static';
    card.hitArea = new PIXI.Rectangle(0, 0, cardW, cardH);
    card.on('pointerdown', function(event) { event.stopPropagation(); });
    // title
    const title = new PIXI.Text('HISTORY', { ...look.font.title, fill: look.color.text });
    // summary 2 dòng, canh giữa theo title
    const games = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    const net = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    const split = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    const rate = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    // filter ALL / WIN / LOSE, đổi lọc thì về trang 1 và chọn dòng đầu
    const chips = ['all', 'win', 'lose'].map(function(key) {
        const btn = new PIXI.Container();
        const plate = new PIXI.Graphics();
        const label = new PIXI.Text('', { ...look.font.filter, fill: look.color.text });
        btn.addChild(plate, label);
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', function(event) {
            event.stopPropagation();
            if (!historyView || historyView.filter === key) return;
            playSound('btn', look.sfx);
            historyView.filter = key;
            historyView.page = 0;
            historyView.picked = historyFirstId(historyView.list, key, historyView.page, historyView.look.card.page);
            paintHistory();
        });
        return { key: key, btn: btn, plate: plate, label: label };
    });
    // khay list, nền khác phần detail
    const listPlate = new PIXI.Graphics();
    const rows = [];
    for (let i = 0; i < look.card.page; i++) {
        const row = new PIXI.Container();
        const plate = new PIXI.Graphics();
        const meta = new PIXI.Text('', { ...look.font.row, fill: look.color.text });
        const bet = new PIXI.Text('', { ...look.font.row, fill: look.color.text });
        const result = new PIXI.Text('', { ...look.font.row, fill: look.color.text });
        const profit = new PIXI.Text('', { ...look.font.row, fill: look.color.text });
        const balance = new PIXI.Text('', { ...look.font.row, fill: look.color.text });
        row.addChild(plate, meta, bet, result, profit, balance);
        row.eventMode = 'static';
        row.cursor = 'pointer';
        row.on('pointerdown', function(event) {
            event.stopPropagation();
            if (!historyView || !row.gameId) return;
            historyView.picked = row.gameId;
            paintHistory();
        });
        rows.push({ row: row, plate: plate, meta: meta, bet: bet, result: result, profit: profit, balance: balance });
    }
    const empty = new PIXI.Text('Chưa có game', { ...look.font.body, fill: look.color.text });
    const rule = new PIXI.Graphics();
    // detail game đang chọn
    const heading = new PIXI.Text('Đang chọn', { ...look.font.body, fill: look.color.text });
    const detailTop = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    const detailBottom = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    // ‹ › sang trang thì chọn dòng đầu trang đó
    const prev = historyChip('‹', look);
    const next = historyChip('›', look);
    const pageLabel = new PIXI.Text('', { ...look.font.body, fill: look.color.text });
    prev.btn.on('pointerdown', function(event) {
        event.stopPropagation();
        if (!historyView || historyView.page <= 0) return;
        playSound('btn', look.sfx);
        historyView.page -= 1;
        historyView.picked = historyFirstId(historyView.list, historyView.filter, historyView.page, historyView.look.card.page);
        paintHistory();
    });
    next.btn.on('pointerdown', function(event) {
        event.stopPropagation();
        if (!historyView || historyView.page >= historyView.pages - 1) return;
        playSound('btn', look.sfx);
        historyView.page += 1;
        historyView.picked = historyFirstId(historyView.list, historyView.filter, historyView.page, historyView.look.card.page);
        paintHistory();
    });
    const closeBtn = new PIXI.Container();
    const closeBg = new PIXI.Graphics();
    closeBg.roundRect(0, 0, look.card.btnW, look.card.btnH, look.card.btnRadius);
    closeBg.fill({ color: look.color.button });
    const closeLabel = new PIXI.Text('Đóng', { ...look.font.chip, fill: look.color.ink });
    closeLabel.position.set((look.card.btnW - closeLabel.width) / 2, (look.card.btnH - closeLabel.height) / 2);
    closeBtn.addChild(closeBg, closeLabel);
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.hitArea = new PIXI.Rectangle(0, 0, look.card.btnW, look.card.btnH);
    closeBtn.on('pointerdown', function(event) {
        event.stopPropagation();
        playSound('btn', look.sfx);
        closeHistory();
    });
    card.addChild(bg, title, games, net, split, rate, listPlate, empty, rule, heading, detailTop, detailBottom, prev.btn, pageLabel, next.btn, closeBtn);
    chips.forEach(function(chip) { card.addChild(chip.btn); });
    rows.forEach(function(item) { card.addChild(item.row); });
    card.position.set((look.screen.width - cardW) / 2, (look.screen.height - cardH) / 2);
    popup.addChild(shade, card);
    popup.visible = false;
    stage.addChild(popup);
    historyView = {
        look: look,
        popup: popup,
        title: title,
        games: games,
        net: net,
        split: split,
        rate: rate,
        chips: chips,
        listPlate: listPlate,
        rows: rows,
        empty: empty,
        rule: rule,
        heading: heading,
        detailTop: detailTop,
        detailBottom: detailBottom,
        prev: prev,
        next: next,
        pageLabel: pageLabel,
        closeBtn: closeBtn,
        list: [],
        filter: 'all',
        page: 0,
        pages: 1,
        picked: null,
    };
    placeHistory();
}
// nút tròn ‹ ›
function historyChip(label, look) {
    const btn = new PIXI.Container();
    const plate = new PIXI.Graphics();
    const text = new PIXI.Text(label, { ...look.font.title, fill: look.color.text });
    btn.addChild(plate, text);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    return { btn: btn, plate: plate, text: text };
}
// tiền, dấu phẩy nghìn, dương thì thêm +
function historyMoney(value, signed) {
    const n = Math.round(Number(value) * 100) / 100;
    if (!Number.isFinite(n)) return '0.00';
    const parts = Math.abs(n).toFixed(2).split('.');
    const body = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
    if (n < 0) return '-' + body;
    if (signed && n > 0) return '+' + body;
    return body;
}
// giờ dd/mm hh:mm
function historyTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return day + '/' + month + ' ' + hour + ':' + minute;
}
// games, win, lose, net, win rate. 0 game thì rate 0
function historySummary(list) {
    let win = 0;
    let lose = 0;
    let net = 0;
    list.forEach(function(game) {
        if (game.result === 'win') win += 1;
        else if (game.result === 'lose') lose += 1;
        const profit = Number(game.profit);
        if (Number.isFinite(profit)) net += profit;
    });
    const games = list.length;
    return {
        games: games,
        win: win,
        lose: lose,
        net: Math.round(net * 100) / 100,
        rate: games ? Math.round((win / games) * 1000) / 10 : 0,
    };
}
// mới nhất lên đầu, # là số của cả lịch sử
function historyOrdered(list) {
    return list.map(function(game, index) {
        return { game: game, no: index + 1 };
    }).sort(function(a, b) {
        return String(b.game.timestamp).localeCompare(String(a.game.timestamp));
    });
}
// lọc all / win / lose
function historyFiltered(items, filter) {
    if (filter === 'win' || filter === 'lose') {
        return items.filter(function(item) { return item.game.result === filter; });
    }
    return items;
}
// cắt đúng một trang
function historyPageItems(list, filter, page, pageSize) {
    const ordered = historyOrdered(list);
    const items = historyFiltered(ordered, filter);
    return items.slice(page * pageSize, page * pageSize + pageSize);
}
// id dòng đầu của trang đang xem
function historyFirstId(list, filter, page, pageSize) {
    const items = historyPageItems(list, filter, page, pageSize);
    return items.length ? items[0].game.id : null;
}
// xếp chỗ trên thẻ
function placeHistory() {
    const view = historyView;
    const card = view.look.card;
    const pad = card.pad;
    const rowW = card.width - pad * 2;
    view.title.position.set((card.width - view.title.width) / 2, pad - rem(1));
    // cách title một khoảng, rồi 2 dòng summary
    const line1 = view.title.y + view.title.height + rem(8);
    const line2 = line1 + rem(10);
    view.games.position.set(pad, line1);
    view.split.position.set(pad, line2);
    view.net.position.set(pad, line1);
    view.rate.position.set(pad, line2);
    const chipY = line2 + rem(14);
    const chipW = (rowW - rem(6)) / 3;
    view.chips.forEach(function(chip, index) {
        chip.btn.position.set(pad + index * (chipW + rem(3)), chipY);
        chip.btn.hitArea = new PIXI.Rectangle(0, 0, chipW, card.chipH);
    });
    const listY = chipY + card.chipH + rem(6);
    const listH = card.page * card.rowH;
    view.listPlate.clear();
    view.listPlate.roundRect(pad, listY, rowW, listH, rem(3));
    view.listPlate.fill({ color: view.look.color.list });
    view.listPlate.stroke({ width: rem(0.5), color: palette.text, alpha: 0.16 });
    view.rows.forEach(function(item, index) {
        item.row.position.set(pad, listY + index * card.rowH);
        item.row.hitArea = new PIXI.Rectangle(0, 0, rowW, card.rowH);
    });
    view.empty.position.set(pad + rem(6), listY + (listH - view.empty.height) / 2);
    const detailY = listY + listH + rem(7);
    view.rule.clear();
    view.rule.moveTo(pad, detailY - rem(4));
    view.rule.lineTo(card.width - pad, detailY - rem(4));
    view.rule.stroke({ width: rem(0.5), color: palette.text, alpha: 0.14 });
    view.heading.position.set(pad, detailY);
    view.detailTop.position.set(pad, detailY + rem(10));
    view.detailBottom.position.set(pad, detailY + rem(20));
    // pager sát detail, nút đóng ở đáy thẻ
    const closeY = card.height - card.btnH - pad;
    const pagerY = detailY + rem(29) + rem(4);
    view.prev.btn.position.set(card.width / 2 - rem(39), pagerY);
    view.next.btn.position.set(card.width / 2 + rem(23), pagerY);
    view.closeBtn.position.set((card.width - card.btnW) / 2, closeY);
    view.layout = { rowW: rowW, line1: line1, line2: line2 };
}
// chip đang chọn nền sáng hơn
function paintHistoryChip(chip, on) {
    const view = historyView;
    chip.plate.clear();
    const w = chip.btn.hitArea.width;
    const h = chip.btn.hitArea.height;
    chip.plate.roundRect(0, 0, w, h, h / 2);
    chip.plate.fill({ color: on ? view.look.color.button : view.look.color.chip });
    chip.label.style.fill = on ? view.look.color.ink : view.look.color.text;
    chip.label.position.set((w - chip.label.width) / 2, (h - chip.label.height) / 2);
}
// ‹ › mờ khi hết trang
function paintHistoryPager(control, on) {
    const box = rem(14);
    control.plate.clear();
    control.plate.roundRect(0, 0, box, box, rem(7));
    control.plate.fill({ color: on ? historyView.look.color.chip : historyView.look.color.card });
    control.text.position.set((box - control.text.width) / 2, (box - control.text.height) / 2);
    control.btn.alpha = on ? 1 : 0.35;
    control.btn.cursor = on ? 'pointer' : 'default';
}
// vẽ lại summary, list và game đang chọn
function paintHistory() {
    const view = historyView;
    if (!view) return;
    const summary = historySummary(view.list);
    const ordered = historyOrdered(view.list);
    const items = historyFiltered(ordered, view.filter);
    const pageSize = view.look.card.page;
    view.pages = Math.max(1, Math.ceil(items.length / pageSize));
    if (view.page > view.pages - 1) view.page = view.pages - 1;
    if (view.page < 0) view.page = 0;
    const slice = items.slice(view.page * pageSize, view.page * pageSize + pageSize);
    view.games.text = 'Games: ' + summary.games;
    view.net.text = 'Net ' + historyMoney(summary.net, true);
    view.net.style.fill = summary.net < 0 ? view.look.color.lose : view.look.color.money;
    view.split.text = 'Win/Lose: ' + summary.win + '/' + summary.lose;
    view.rate.text = 'Win rate ' + summary.rate.toFixed(1) + '%';
    view.rate.style.fill = view.look.color.text;
    // cụm summary canh giữa thẻ, cùng trục với HISTORY
    const blockGap = rem(18);
    const leftW = Math.max(view.games.width, view.split.width);
    const rightW = Math.max(view.net.width, view.rate.width);
    const blockX = (view.look.card.width - leftW - blockGap - rightW) / 2;
    view.games.position.set(blockX, view.layout.line1);
    view.split.position.set(blockX, view.layout.line2);
    view.net.position.set(blockX + leftW + blockGap, view.layout.line1);
    view.rate.position.set(blockX + leftW + blockGap, view.layout.line2);
    const counts = { all: summary.games, win: summary.win, lose: summary.lose };
    const names = { all: 'ALL', win: 'WIN', lose: 'LOSE' };
    view.chips.forEach(function(chip) {
        chip.label.text = names[chip.key] + ' (' + counts[chip.key] + ')';
        paintHistoryChip(chip, view.filter === chip.key);
    });
    // cột: thông tin game trái, bet / kết quả / profit / balance căn phải
    const rowW = view.layout.rowW;
    const rowH = view.look.card.rowH;
    const balanceRight = rowW - rem(5);
    const profitRight = balanceRight - rem(42);
    const resultRight = profitRight - rem(48);
    const betRight = resultRight - rem(22);
    view.rows.forEach(function(item, index) {
        const entry = slice[index];
        item.row.visible = !!entry;
        if (!entry) {
            item.row.gameId = null;
            return;
        }
        const game = entry.game;
        const won = game.result === 'win';
        const tint = won ? view.look.color.win : view.look.color.lose;
        const picked = view.picked === game.id;
        item.row.gameId = game.id;
        item.meta.text = '#' + entry.no + '   ' + historyTime(game.timestamp) + '   ' + game.field + ' ' + game.rows + '×' + game.cols;
        item.bet.text = 'Bet ' + historyMoney(game.bet, false);
        item.result.text = won ? 'Win' : 'Lose';
        item.profit.text = historyMoney(game.profit, true);
        item.balance.text = historyMoney(game.balanceAfter, false);
        item.result.style.fill = tint;
        item.profit.style.fill = won ? view.look.color.money : view.look.color.lose;
        const y = (rowH - item.meta.height) / 2;
        item.meta.position.set(rem(5), y);
        item.bet.position.set(betRight - item.bet.width, y);
        item.result.position.set(resultRight - item.result.width, y);
        item.profit.position.set(profitRight - item.profit.width, y);
        item.balance.position.set(balanceRight - item.balance.width, y);
        item.plate.clear();
        // dòng lẻ nền zebra, dòng đang chọn có viền
        if (picked || index % 2 === 1) {
            item.plate.roundRect(rem(1), rem(0.5), rowW - rem(2), rowH - rem(1), rem(2));
            item.plate.fill({ color: picked ? view.look.color.pick : view.look.color.zebra });
            if (picked) item.plate.stroke({ width: rem(0.75), color: view.look.color.button });
        }
    });
    view.empty.visible = items.length === 0;
    const picked = ordered.find(function(item) { return item.game.id === view.picked; });
    // hết game thì để trống, có game thì hiện Đang chọn game
    if (picked) {
        const game = picked.game;
        const won = game.result === 'win';
        const multi = game.maxMulti == null ? '—' : Number(game.maxMulti).toFixed(2) + 'x';
        view.heading.text = 'Đang chọn game ' + picked.no;
        view.detailTop.text = 'Bet ' + historyMoney(game.bet, false) + '     ' + (won ? 'Win ' : 'Lose ') + historyMoney(game.profit, true) + '     Multi ' + multi;
        view.detailTop.style.fill = won ? view.look.color.money : view.look.color.lose;
        view.detailBottom.text = 'POINTS ' + historyMoney(game.balanceBefore, false) + '   →   ' + historyMoney(game.balanceAfter, false);
        view.detailBottom.style.fill = view.look.color.text;
    } else {
        view.heading.text = '';
        view.detailTop.text = '';
        view.detailBottom.text = '';
    }
    view.pageLabel.text = (view.page + 1) + ' / ' + view.pages;
    view.pageLabel.position.set((view.look.card.width - view.pageLabel.width) / 2, view.prev.btn.y + (rem(14) - view.pageLabel.height) / 2);
    paintHistoryPager(view.prev, view.page > 0);
    paintHistoryPager(view.next, view.page < view.pages - 1);
}
// mở popup, chọn dòng đầu trang
async function openHistory() {
    if (!historyView) return;
    historyView.list = await getGameHistory();
    historyView.filter = 'all';
    historyView.page = 0;
    historyView.picked = historyFirstId(historyView.list, historyView.filter, historyView.page, historyView.look.card.page);
    paintHistory();
    historyView.popup.visible = true;
}
function closeHistory() {
    if (!historyView) return;
    historyView.popup.visible = false;
}
