// xanh = gameplay, vàng = tiền, cam = multi, đỏ = thua, trắng = thông tin
// mọi theme cùng một bộ key, game chỉ đọc palette
const themes = {
    emerald: {
        // //// xương sống ////////////////////////////////////////////
        // nền canvas
        bg: 0x071b18,
        // ô chưa mở
        grid: 0x163f31,
        // hành động bấm được: BET, All in, chip đang chọn, viền cột đang đi
        primary: 0x25c46a,
        // tiền: POINTS, bet, profit, Net, Cash Out, coin
        gold: 0xffc928,
        // thua mạnh: boom, chữ Lose, profit âm
        lose: 0xff5252,
        // //// màu phụ /////////////////////////////////////////////////
        // nền panel, card, popup, khay list
        surface: 0x0d2b23,
        surfaceDeep: 0x0a211b,
        // chỉ cho control bị khóa, không dùng làm nền trang trí
        disabled: 0x10241e,
        // trạng thái lưới: viền ô, cột đang đi, ô an toàn đã mở
        gridBorder: 0x23875a,
        colActive: 0x1f5a43,
        safe: 0x1d7a4c,
        // viền ô an toàn, nghĩa là đã xác nhận, không phải nút bấm
        safeBorder: 0x5fe39a,
        // nút phụ: reset, Chọn lại, field, + −
        primaryDark: 0x12633a,
        // goldDark là viền, khung vàng. goldLight là điểm sáng của tiền: coin, mảnh bay
        goldDark: 0xc79a12,
        goldLight: 0xffe38a,
        // chỉ cho multi: Next, hiệu ứng multi. không dùng cho warning
        orange: 0xff9f1c,
        // chữ thông tin chính
        text: 0xf4f7f3,
        // chỉ cho chữ bị khóa, không dùng cho metadata
        muted: 0x8fa69a,
        // chữ tối trên nút sáng, bằng màu nền
        ink: 0x071b18,
        // chỉ cho chữ thắng, không dùng cho nút
        win: 0x35d46f,
        // họ đỏ: loseDark viền boom, loseSoft nền cột chưa đi lúc thua, loseSoftBorder viền vùng đó
        loseDark: 0xb3262b,
        loseSoft: 0x4a2226,
        loseSoftBorder: 0x7a3035,
        // lớp tối sau popup, board phía sau chỉ là context
        shade: 0x000000,
        shadeAlpha: 0.62,
        // ngoài canvas: nền trang, khung
        page: 0x050f0d,
        frame: 0x19352d,
    },
    midnight: {
        bg: 0x07121f,
        grid: 0x102b3d,
        primary: 0x22d3a2,
        gold: 0xffd166,
        lose: 0xff5364,
        surface: 0x0b1e2d,
        surfaceDeep: 0x081722,
        disabled: 0x132530,
        gridBorder: 0x187a70,
        colActive: 0x154b55,
        safe: 0x177c63,
        safeBorder: 0x63f5c4,
        primaryDark: 0x105344,
        goldDark: 0xc29b32,
        goldLight: 0xffe6a3,
        orange: 0xffa62b,
        text: 0xf2f7f7,
        muted: 0x8299a5,
        ink: 0x07121f,
        win: 0x3be38d,
        loseDark: 0xb52e42,
        loseSoft: 0x38202a,
        loseSoftBorder: 0x6e2d3a,
        shade: 0x000000,
        shadeAlpha: 0.64,
        page: 0x040a12,
        frame: 0x14283a,
    },
    burgundy: {
        bg: 0x190d12,
        grid: 0x321923,
        primary: 0x35c98a,
        gold: 0xffd36a,
        lose: 0xff5a5f,
        surface: 0x29131b,
        surfaceDeep: 0x1f0e15,
        disabled: 0x302027,
        gridBorder: 0x7b3c4c,
        colActive: 0x4b2633,
        safe: 0x26714f,
        safeBorder: 0x5de0a0,
        primaryDark: 0x18553c,
        goldDark: 0xc39a3d,
        goldLight: 0xffe5a3,
        orange: 0xffa52a,
        text: 0xf7f0e9,
        muted: 0xb19b9f,
        ink: 0x190d12,
        win: 0x42d98b,
        loseDark: 0xb3343e,
        loseSoft: 0x5a1a22,
        loseSoftBorder: 0xa33a45,
        shade: 0x000000,
        shadeAlpha: 0.64,
        page: 0x0e070a,
        frame: 0x3a1d27,
    },
};
// theme lấy từ ?theme= trên url, không có thì emerald
const themeQuery = new URLSearchParams(location.search).get('theme');
const themeName = themes[themeQuery] ? themeQuery : 'emerald';
const palette = themes[themeName];
// số màu sang css #rrggbb
function cssColor(value, alpha) {
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    if (alpha == null) return '#' + value.toString(16).padStart(6, '0');
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}
// nền trang, khung, accordion trong index.html đọc các biến này
function applyThemeCss() {
    const root = document.documentElement.style;
    root.setProperty('--page', cssColor(palette.page));
    root.setProperty('--frame', cssColor(palette.frame));
    root.setProperty('--frame-border', cssColor(palette.gold, 0.35));
    root.setProperty('--surface', cssColor(palette.surface));
    root.setProperty('--grid', cssColor(palette.grid));
    root.setProperty('--text', cssColor(palette.text));
    root.setProperty('--focus', cssColor(palette.primary, 0.35));
}
// đổi theme bằng tải lại trang, balance và history vẫn đọc từ json
function switchTheme(name) {
    if (!themes[name] || name === themeName) return;
    const url = new URL(location.href);
    url.searchParams.set('theme', name);
    location.href = url.toString();
}
applyThemeCss();
