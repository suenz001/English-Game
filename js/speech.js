// ===== 語音系統（優化快取與穩定音源版）=====
// 解決原本 Google TTS 會因為 CORS 阻擋導致 Blob 快取失敗，以及頻繁請求被限制而產生的延遲問題。

// ===== 語音音量控制 =====
let voiceVolume = parseFloat(localStorage.getItem('vocabSpire_voiceVolume') ?? '1.0');
export function setVoiceVolume(val) {
    voiceVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('vocabSpire_voiceVolume', voiceVolume);
}
export function getVoiceVolume() { return voiceVolume; }

let currentAudio = null;
let preloaded = false;
// 快取改為儲存 Audio 物件實例，而不是 URL 字串或 Blob
const audioCache = new Map(); 

// 改用有道詞典的開放 API (type=2 代表美式發音)，對單字發音的反應速度更快，且不易被阻擋
function ttsUrl(word) {
    return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
}

// ===== 預載入：建立 Audio 物件並交由瀏覽器底層快取 =====
export function preloadWords(words) {
    if (preloaded) return;
    preloaded = true;
    const unique = [...new Set(words.map(w => w.toLowerCase().trim()))];

    unique.forEach(word => {
        if (!audioCache.has(word)) {
            const audio = new Audio();
            audio.preload = 'auto'; // 提示瀏覽器預先下載音檔
            audio.src = ttsUrl(word);
            audio.load(); // 強制觸發下載
            audioCache.set(word, audio);
        }
    });
    console.log(`🔊 已發送預載請求：${unique.length} 個單字音檔`);
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

        // 安全超時機制
        const timeout = setTimeout(() => {
            if (!settled) {
                console.log('⚠️ Audio 播放超時，改用 speechSynthesis');
                useSpeechSynthesis(key, rate).then(finish);
            }
        }, 3000);

        function finishClean() {
            clearTimeout(timeout);
            finish();
        }

        try {
            // 從快取取得已準備好的 Audio 物件，若無則當下建立
            let audio = audioCache.get(key);
            if (!audio) {
                audio = new Audio(ttsUrl(key));
                audioCache.set(key, audio);
            }

            // 每次播放前重置播放進度
            audio.currentTime = 0;
            audio.volume = voiceVolume;

            // 支援直接調整 HTML5 Audio 的播放速度
            if (audio.playbackRate !== undefined) {
                audio.playbackRate = rate;
            }

            currentAudio = audio;
            audio.onended = finishClean;

            audio.onerror = () => {
                console.log('⚠️ Audio 音檔載入失敗，改用 speechSynthesis');
                clearTimeout(timeout);
                useSpeechSynthesis(key, rate).then(finish);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('⚠️ Audio 播放被阻擋或失敗:', error);
                    clearTimeout(timeout);
                    useSpeechSynthesis(key, rate).then(finish);
                });
            }
        } catch (e) {
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
    // 直接利用 HTML5 Audio 的 playbackRate 來降速，保留原本的人聲而不是變回機器音
    return speakWord(word, 0.6);
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
            u.volume = voiceVolume;
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
