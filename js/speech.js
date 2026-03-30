// ===== 語音系統（Blob 快取版）=====
// 預載音檔到記憶體 Blob，避免第一次播放斷斷續續

let currentAudio = null;
let preloaded = false;
const audioCache = new Map(); // word -> blobURL

// Google TTS URL
function ttsUrl(word) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
}

// ===== 預載入：下載到 Blob 快取 =====
export function preloadWords(words) {
    if (preloaded) return;
    preloaded = true;
    const unique = [...new Set(words.map(w => w.toLowerCase().trim()))];
    let i = 0;

    function next() {
        if (i >= unique.length) {
            console.log(`🔊 已預載 ${audioCache.size}/${unique.length} 個單字音檔`);
            return;
        }
        const word = unique[i++];
        if (audioCache.has(word)) { setTimeout(next, 50); return; }

        // 用 fetch 下載到 Blob 快取
        fetch(ttsUrl(word), { mode: 'no-cors' })
            .then(r => r.blob())
            .then(blob => {
                if (blob.size > 0) {
                    audioCache.set(word, URL.createObjectURL(blob));
                }
            })
            .catch(() => {
                // fetch no-cors 會回傳 opaque response，改用 Audio 預載
                preloadViaAudio(word);
            })
            .finally(() => setTimeout(next, 200));
    }
    next();
}

// 用 Audio 預載（備用）
function preloadViaAudio(word) {
    return new Promise(resolve => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = ttsUrl(word);
        audio.oncanplaythrough = () => {
            // 標記已載入（但無法存 blob，靠 HTTP 快取）
            audioCache.set(word, ttsUrl(word));
            resolve();
        };
        audio.onerror = resolve;
        audio.load();
        setTimeout(resolve, 3000); // 安全超時
    });
}

// ===== 播放單字（核心函數）=====
export function speakWord(word, rate = 1.0) {
    return new Promise(resolve => {
        stopCurrent();

        const key = word.toLowerCase().trim();
        let settled = false;

        function finish() {
            if (settled) return;
            settled = true;
            currentAudio = null;
            resolve();
        }

        const timeout = setTimeout(finish, 5000);

        function finishClean() {
            clearTimeout(timeout);
            finish();
        }

        try {
            // 優先使用快取的 Blob URL
            const cachedSrc = audioCache.get(key) || ttsUrl(key);
            const audio = new Audio(cachedSrc);
            currentAudio = audio;
            audio.onended = finishClean;

            audio.onerror = () => {
                console.log('⚠️ Audio 播放失敗，改用 speechSynthesis');
                clearTimeout(timeout);
                useSpeechSynthesis(key, rate).then(finish);
            };

            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(() => {
                    clearTimeout(timeout);
                    useSpeechSynthesis(key, rate).then(finish);
                });
            }
        } catch {
            clearTimeout(timeout);
            useSpeechSynthesis(key, rate).then(finish);
        }
    });
}

// 停止目前播放
function stopCurrent() {
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.onended = null;
            currentAudio.onerror = null;
        } catch {}
        currentAudio = null;
    }
    if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
    }
}

// ===== 慢速朗讀 =====
export function speakWordSlowly(word) {
    return useSpeechSynthesis(word, 0.6);
}

// ===== speechSynthesis 備用方案 =====
let voices = [];
let englishVoice = null;

function loadVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    voices = speechSynthesis.getVoices();
    englishVoice = voices.find(v => v.name.includes('Google US English'))
        || voices.find(v => v.lang === 'en-US' && !v.localService)
        || voices.find(v => v.lang === 'en-US')
        || voices.find(v => v.lang.startsWith('en'))
        || null;
}

if (typeof speechSynthesis !== 'undefined') {
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    setTimeout(loadVoices, 500);
}

function useSpeechSynthesis(word, rate = 0.85) {
    return new Promise(resolve => {
        if (typeof speechSynthesis === 'undefined') { resolve(); return; }
        speechSynthesis.cancel();

        setTimeout(() => {
            const u = new SpeechSynthesisUtterance(word);
            u.lang = 'en-US';
            u.rate = rate;
            u.pitch = 1.0;
            u.volume = 1.0;
            if (englishVoice) u.voice = englishVoice;

            const safety = setTimeout(resolve, 3000);
            const keepAlive = setInterval(() => {
                if (speechSynthesis.speaking) speechSynthesis.resume();
            }, 5000);

            const done = () => {
                clearInterval(keepAlive);
                clearTimeout(safety);
                resolve();
            };

            u.onend = done;
            u.onerror = done;
            speechSynthesis.speak(u);
        }, 80);
    });
}

export function isSpeechAvailable() {
    return typeof Audio !== 'undefined' || typeof speechSynthesis !== 'undefined';
}
