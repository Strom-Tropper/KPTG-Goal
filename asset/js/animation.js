// lật ô
function stopFlip(cell, ticker) {
    if (cell.flipTick) {
        ticker.remove(cell.flipTick);
        cell.flipTick = null;
    }
    cell.flipping = false;
    cell.scale.set(1);
    cell.pivot.set(0, 0);
}
function flipEase(p) {
    return (1 - Math.cos(Math.PI * p)) / 2;
}
function placeFlip(cell, originX, originY, boxH, scaleY) {
    cell.pivot.set(0, 0);
    cell.scale.set(1, scaleY);
    cell.position.set(originX, originY + boxH * (1 - scaleY) / 2);
}
// lật dọc tới 1/2 thì đổi màu
function flipCell(cell, boxH, ticker, paintNow, done) {
    const originX = cell.position.x;
    const originY = cell.position.y;
    // thời gian một nửa nhịp lật
    const half = 140;
    cell.flipping = true;
    placeFlip(cell, originX, originY, boxH, 1);
    let t = 0;
    let swapped = false;
    function tick(frame) {
        if (cell.flipTick !== tick) return;
        t += frame.deltaMS;
        if (!swapped) {
            placeFlip(cell, originX, originY, boxH, 1 - flipEase(Math.min(1, t / half)));
            if (t < half) return;
            swapped = true;
            paintNow();
        }
        const u = Math.min(1, (t - half) / half);
        placeFlip(cell, originX, originY, boxH, flipEase(u));
        if (u < 1) return;
        ticker.remove(tick);
        cell.flipTick = null;
        cell.scale.set(1);
        cell.position.set(originX, originY);
        cell.flipping = false;
        if (done) done();
    }
    cell.flipTick = tick;
    ticker.add(tick);
}

// hút point
let flowJob = null;
function stopFlow(ticker) {
    const job = flowJob;
    if (!job) return;
    flowJob = null;
    ticker.remove(job.tick);
    if (job.mark) {
        job.mark.scale.set(1);
        job.mark.position.set(job.markX, job.markY);
    }
    job.layer.destroy({ children: true });
}
function flowPoints(stage, ticker, from, to, tint, mark, done) {
    stopFlow(ticker);
    const layer = new PIXI.Container();
    layer.eventMode = 'none';
    stage.addChild(layer);
    // tạo mảnh - count số lượng, radius cỡ, spark là mảnh nhọn
    const count = 10;
    const dots = [];
    const span = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    const px = -(to.y - from.y) / span;
    const py = (to.x - from.x) / span;
    for (let i = 0; i < count; i++) {
        const spark = i % 5 === 0;
        const radius = spark ? 9 : 6 + Math.random() * 4;
        const dot = new PIXI.Graphics();
        if (spark) {
            dot.poly([0, -radius, radius * 0.45, 0, 0, radius, -radius * 0.45, 0]);
            dot.fill({ color: palette.goldLight });
        } else {
            dot.circle(0, 0, radius);
            dot.fill({ color: tint });
        }
        dot.alpha = 0;
        dot.eventMode = 'none';
        layer.addChild(dot);
        dots.push({
            g: dot,
            angle: Math.random() * Math.PI * 2,
            dist: 12 + Math.random() * 16,
            delay: Math.random() * 120,
            bend: (Math.random() * 2 - 1) * 64,
            jx: (Math.random() - 0.5) * 12,
            jy: (Math.random() - 0.5) * 8,
            bx: from.x,
            by: from.y,
        });
    }
    // thời gian ms: burst nổ và bay về đích
    const burst = 160;
    const fly = 680;
    let time = 0;
    let pulsed = false;
    const job = { tick: null, layer: layer, mark: null, markX: 0, markY: 0, markW: 0, markH: 0 };
    function tick(frame) {
        if (flowJob !== job) return;
        time += frame.deltaMS;
        let alive = false;
        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            const local = time - d.delay;
            if (local < 0) {
                alive = true;
                continue;
            }
            if (local >= burst + fly) {
                d.g.visible = false;
                continue;
            }
            alive = true;
            let x;
            let y;
            if (local <= burst) {
                const e = flipEase(local / burst);
                x = from.x + Math.cos(d.angle) * d.dist * e;
                y = from.y + Math.sin(d.angle) * d.dist * e;
                d.bx = x;
                d.by = y;
                d.g.alpha = 0.35 + 0.65 * e;
                d.g.scale.set(0.7 + 0.3 * e);
            } else {
                const u = flipEase((local - burst) / fly);
                const p2x = to.x + d.jx;
                const p2y = to.y + d.jy;
                const mx = (d.bx + p2x) / 2 + px * d.bend;
                const my = (d.by + p2y) / 2 + py * d.bend;
                const k = 1 - u;
                x = k * k * d.bx + 2 * k * u * mx + u * u * p2x;
                y = k * k * d.by + 2 * k * u * my + u * u * p2y;
                const fade = u > 0.72 ? 1 - (u - 0.72) / 0.28 : 1;
                d.g.alpha = fade;
                d.g.scale.set(Math.max(0.2, fade));
            }
            d.g.position.set(x, y);
        }
        if (!pulsed && mark && time >= burst + fly * 0.7) {
            pulsed = true;
            job.mark = mark;
            job.markX = mark.x;
            job.markY = mark.y;
            job.markW = mark.width;
            job.markH = mark.height;
        }
        if (job.mark) {
            const pt = Math.min(1, (time - burst - fly * 0.7) / 180);
            const s = 1 + Math.sin(pt * Math.PI) * 0.14;
            job.mark.scale.set(s);
            job.mark.position.set(job.markX - job.markW * (s - 1) / 2, job.markY - job.markH * (s - 1) / 2);
            if (pt >= 1) {
                job.mark.scale.set(1);
                job.mark.position.set(job.markX, job.markY);
                job.mark = null;
            }
        }
        if (alive || job.mark) return;
        ticker.remove(tick);
        job.layer.destroy({ children: true });
        flowJob = null;
        if (done) done();
    }
    job.tick = tick;
    flowJob = job;
    ticker.add(tick);
}
