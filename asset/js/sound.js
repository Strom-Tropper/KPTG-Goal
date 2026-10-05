// nhạc theo tên file mp3
const soundNames = ['bgSound', 'click', 'btn', 'boom', 'win', 'coin', 'coinSound2'];
let soundOn = true;
let music = null;
let musicVolume = 0.4;
let effect = null;

function loadSounds(volume) {
    if (volume) musicVolume = volume;
    if (!window.PIXI || !PIXI.sound) return;
    soundNames.forEach(function(name) {
        try {
            PIXI.sound.add(name, {
                url: 'asset/sound/' + name + '.mp3',
                preload: true,
                singleInstance: name !== 'bgSound',
            });
        } catch (err) {}
    });
}
function soundReady(name) {
    if (!soundOn || !window.PIXI || !PIXI.sound || !PIXI.sound.exists(name)) return false;
    const item = PIXI.sound.find(name);
    return !!(item && item.isLoaded);
}
function pokeMusic() {
    if (music || !soundReady('bgSound')) return;
    try {
        music = PIXI.sound.play('bgSound', { loop: true, volume: musicVolume, singleInstance: true });
    } catch (err) {
        music = null;
    }
}
function stopEffect() {
    const old = effect;
    if (!old) return;
    effect = null;
    try { old.stop(); } catch (err) {}
}
// bấm tiếp thì cắt tiếng cũ
function playSound(name, volume) {
    pokeMusic();
    if (!soundReady(name)) return;
    stopEffect();
    try {
        const played = PIXI.sound.play(name, { volume: volume });
        if (!played || typeof played.stop !== 'function') return;
        effect = played;
        function done() {
            if (effect === played) effect = null;
        }
        if (typeof played.on === 'function') {
            played.on('end', done);
            played.on('stop', done);
        }
    } catch (err) {}
}
function muteSound() {
    soundOn = false;
    if (!window.PIXI || !PIXI.sound) return;
    PIXI.sound.muteAll();
}
function unmuteSound(volume) {
    soundOn = true;
    if (volume) musicVolume = volume;
    if (!window.PIXI || !PIXI.sound) return;
    PIXI.sound.unmuteAll();
    pokeMusic();
}
