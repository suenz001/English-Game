// ===== 語音混淆系統 =====
// 自動產生與目標單字發音相似的假單字，用於答題混淆

// 母音替換對照
const VOWEL_SWAPS = {
    'a': ['e', 'u', 'o'],
    'e': ['a', 'i', 'u'],
    'i': ['e', 'y', 'u'],
    'o': ['a', 'u', 'e'],
    'u': ['o', 'a', 'i'],
    'y': ['i', 'e'],
};

// 子音替換對照（發音相近的配對）
const CONSONANT_SWAPS = {
    'b': ['p', 'd'],
    'p': ['b', 't'],
    'd': ['t', 'b'],
    't': ['d', 'p'],
    'g': ['k', 'c'],
    'k': ['g', 'c'],
    'c': ['k', 'g', 's'],
    'n': ['m', 'ng'],
    'm': ['n'],
    'f': ['v', 'ph'],
    'v': ['f', 'b'],
    's': ['z', 'c', 'sh'],
    'z': ['s', 'x'],
    'l': ['r', 'w'],
    'r': ['l', 'w'],
    'w': ['wh', 'r'],
    'j': ['g', 'ch'],
    'h': [''],        // 省略 h
    'x': ['ks', 'z'],
};

// 字母組合替換
const COMBO_SWAPS = {
    'th': ['f', 'v', 'd'],
    'sh': ['ch', 's'],
    'ch': ['sh', 'tch', 'j'],
    'ph': ['f'],
    'ck': ['k', 'c'],
    'qu': ['kw', 'cw'],
    'wh': ['w'],
    'wr': ['r'],
    'kn': ['n'],
    'tion': ['shon', 'sion'],
    'sion': ['tion', 'shon'],
    'ight': ['ite', 'yte'],
    'ough': ['off', 'uff', 'ow'],
    'ee': ['ea', 'ie'],
    'ea': ['ee', 'ie'],
    'oo': ['ue', 'ew'],
    'ai': ['ay', 'ei'],
    'ay': ['ai', 'ey'],
    'ow': ['ou', 'aw'],
    'ou': ['ow', 'aw'],
    'er': ['ur', 'ir'],
    'ir': ['er', 'ur'],
    'ur': ['er', 'ir'],
    'ar': ['or', 'er'],
    'or': ['ar', 'er'],
    'le': ['el', 'al'],
    'al': ['el', 'le'],
};

const VOWELS = new Set('aeiouy');

function isVowel(ch) {
    return VOWELS.has(ch.toLowerCase());
}

// ===== 產生混淆單字 =====
export function generateConfusingWords(word, count = 5) {
    const results = new Set();
    const w = word.toLowerCase().trim();

    // 1. 字母組合替換（優先，最像真的）
    for (const [combo, swaps] of Object.entries(COMBO_SWAPS)) {
        if (w.includes(combo)) {
            for (const swap of swaps) {
                const newWord = w.replace(combo, swap);
                if (newWord !== w && newWord.length >= 2) results.add(newWord);
            }
        }
    }

    // 2. 母音替換（每次替換一個母音）
    for (let i = 0; i < w.length; i++) {
        const ch = w[i];
        if (VOWEL_SWAPS[ch]) {
            for (const swap of VOWEL_SWAPS[ch]) {
                const newWord = w.slice(0, i) + swap + w.slice(i + 1);
                if (newWord !== w) results.add(newWord);
            }
        }
    }

    // 3. 子音替換（每次替換一個子音）
    for (let i = 0; i < w.length; i++) {
        const ch = w[i];
        if (CONSONANT_SWAPS[ch]) {
            for (const swap of CONSONANT_SWAPS[ch]) {
                const newWord = w.slice(0, i) + swap + w.slice(i + 1);
                if (newWord !== w && newWord.length >= 2) results.add(newWord);
            }
        }
    }

    // 4. 混合替換（母音+子音各換一個）
    for (let i = 0; i < w.length; i++) {
        if (!isVowel(w[i])) continue;
        const vowelSwap = (VOWEL_SWAPS[w[i]] || [])[0];
        if (!vowelSwap) continue;
        const temp = w.slice(0, i) + vowelSwap + w.slice(i + 1);
        for (let j = 0; j < temp.length; j++) {
            if (isVowel(temp[j])) continue;
            const consonantSwaps = CONSONANT_SWAPS[temp[j]];
            if (!consonantSwaps) continue;
            const mixed = temp.slice(0, j) + consonantSwaps[0] + temp.slice(j + 1);
            if (mixed !== w && mixed.length >= 2) results.add(mixed);
            if (results.size >= count * 3) break;
        }
        if (results.size >= count * 3) break;
    }

    // 5. 字母重複或省略
    if (w.length >= 4) {
        // 省略中間一個字母
        for (let i = 1; i < w.length - 1; i++) {
            const shorter = w.slice(0, i) + w.slice(i + 1);
            if (shorter !== w && shorter.length >= 2) results.add(shorter);
        }
        // 重複一個字母
        const midIdx = Math.floor(w.length / 2);
        const doubled = w.slice(0, midIdx) + w[midIdx] + w.slice(midIdx);
        if (doubled !== w) results.add(doubled);
    }

    // 6. 首尾字母替換
    if (w.length >= 3) {
        const lastChar = w[w.length - 1];
        if (CONSONANT_SWAPS[lastChar]) {
            for (const swap of CONSONANT_SWAPS[lastChar]) {
                if (swap.length === 1) results.add(w.slice(0, -1) + swap);
            }
        }
    }

    // 移除原始單字，過濾無效字，洗牌取前 count 個
    results.delete(w);

    const arr = [...results].filter(r =>
        r.length >= 2 &&
        r.length <= w.length + 2 &&
        /^[a-z]+$/.test(r)
    );

    // 洗牌
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0, count);
}

// ===== 為答題產生選項 =====
// 回傳包含正確答案 + 混淆選項的陣列（已洗牌）
export function generateQuizOptions(correctWord, optionCount = 4) {
    const confusing = generateConfusingWords(correctWord, optionCount - 1);

    // 如果混淆字不夠，補充隨機字母替換
    while (confusing.length < optionCount - 1) {
        const w = correctWord.toLowerCase();
        const idx = Math.floor(Math.random() * w.length);
        const ch = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        const fake = w.slice(0, idx) + ch + w.slice(idx + 1);
        if (fake !== w && !confusing.includes(fake)) confusing.push(fake);
    }

    const options = [correctWord.toLowerCase(), ...confusing.slice(0, optionCount - 1)];

    // 洗牌
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}
