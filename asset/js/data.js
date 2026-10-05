// //// data //////////////////////////////////////////////////////////////
// số hợp lệ thì dùng, ko thì bỏ
function asNumber(value) {
    const n = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
}
// history của phiên này, lần đầu lấy từ json
let historyCache = null;
let loggedFile = false;

function canFetchJson() {
    const ok = location.protocol === 'http:' || location.protocol === 'https:';
    if (!ok && !loggedFile) {
        loggedFile = true;
        console.log('mở bằng file://, không đọc được json');
    }
    return ok;
}
// đọc balance json, rồi points gốc
async function getBalance(initialScore) {
    if (canFetchJson()) {
        try {
            const res = await fetch('data/balance.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('balance');
            const data = await res.json();
            const n = asNumber(data && data.balance);
            if (n != null) {
                console.log('lấy data từ json', n);
                return n;
            }
        } catch (err) {}
    }
    console.log('points mặc đinh', initialScore);
    return initialScore;
}
// ghi data balance xuống json
async function updateBalance(balance) {
    if (!canFetchJson()) return;
    try {
        const res = await fetch('data/balance.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: balance }),
        });
        if (!res.ok) throw new Error('balance');
        console.log('ghi data balance vào json', balance);
    } catch (err) {
        console.log('không ghi được balance.json', balance);
    }
}
// đọc history từ json, chưa có thì rỗng
async function getGameHistory() {
    if (historyCache != null) {
        console.log('history ván này', historyCache);
        return historyCache.slice();
    }
    if (canFetchJson()) {
        try {
            const res = await fetch('data/history.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('history');
            const list = await res.json();
            if (Array.isArray(list)) {
                historyCache = list.slice();
                console.log('lấy history từ json', historyCache);
                return historyCache.slice();
            }
        } catch (err) {}
    }
    historyCache = [];
    console.log('history trống', []);
    return [];
}
// ghi 1 ván, tự gắn id và timestamp
async function saveGameResult(record) {
    const history = await getGameHistory();
    history.push({
        id: Date.now() + '-' + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        field: record.field,
        rows: record.rows,
        cols: record.cols,
        bet: record.bet,
        result: record.result,
        profit: record.profit,
        balanceBefore: record.balanceBefore,
        balanceAfter: record.balanceAfter,
        maxMulti: record.maxMulti == null ? null : record.maxMulti,
    });
    historyCache = history;
    if (!canFetchJson()) return;
    try {
        const res = await fetch('data/history.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(history),
        });
        if (!res.ok) throw new Error('history');
        console.log('ghi history vào json', history);
    } catch (err) {
        console.log('không ghi được history.json', history);
    }
}
