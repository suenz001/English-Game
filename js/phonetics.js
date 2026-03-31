// ===== 語音混淆系統（完整版）=====
// 根據母音/子音/字母組合/字首字尾/不發音字母等規則，
// 自動產生與目標單字發音相似的假單字

// ===== 一、母音與雙母音混淆 =====
const VOWEL_SWAPS = {
    'a': ['e', 'u', 'o', 'i'],
    'e': ['a', 'i', 'u'],
    'i': ['e', 'y', 'u'],
    'o': ['a', 'u', 'e'],
    'u': ['o', 'a', 'i'],
    'y': ['i', 'e'],
};

// ===== 二、子音混淆（亞洲學生聽力弱點）=====
const CONSONANT_SWAPS = {
    'b': ['p', 'd'],
    'p': ['b', 't'],
    'd': ['t', 'b'],
    't': ['d', 'p'],
    'g': ['k', 'c'],
    'k': ['g', 'c'],
    'c': ['k', 'g', 's'],
    'n': ['m'],
    'm': ['n'],
    'f': ['v', 'ph'],
    'v': ['f', 'w', 'b'],
    'w': ['v', 'wh', 'r'],
    's': ['z', 'c'],
    'z': ['s', 'x'],
    'l': ['r'],
    'r': ['l'],
    'j': ['g'],
    'h': [''],
    'x': ['ks', 'z'],
};

// ===== 三、字母組合替換（最核心的混淆來源）=====
const COMBO_SWAPS = {
    // --- 母音組合（同音異拼）---
    // 長音 /i/
    'ee': ['ea', 'ie', 'ei', 'e'],
    'ea': ['ee', 'ie', 'ei'],
    'ie': ['ee', 'ea', 'ei'],
    'ei': ['ee', 'ea', 'ie'],
    'ey': ['y', 'ie', 'ee'],
    // 長音 /eɪ/
    'ai': ['ay', 'ei', 'eigh'],
    'ay': ['ai', 'ey', 'eigh'],
    'eigh': ['ay', 'ai'],
    // 長音 /oʊ/
    'oa': ['ow', 'oe', 'o_e'],
    'ow': ['ou', 'oa', 'oe'],
    'oe': ['oa', 'ow'],
    // 長音 /u/
    'ue': ['oo', 'ew', 'ui'],
    'oo': ['ue', 'ew', 'ui', 'ou'],
    'ew': ['oo', 'ue', 'ou'],
    'ui': ['ue', 'oo', 'ew'],
    // 雙母音 /aʊ/
    'ou': ['ow'],
    // 雙母音 /ɔɪ/
    'oi': ['oy'],
    'oy': ['oi'],
    // 雙母音 /ɔ/
    'au': ['aw', 'al'],
    'aw': ['au', 'al'],
    'augh': ['ough', 'aw'],
    'ough': ['augh', 'aw', 'off', 'uff'],
    // R控母音 /ɝ/
    'er': ['ur', 'ir', 'or', 'ar'],
    'ir': ['er', 'ur'],
    'ur': ['er', 'ir'],
    'ar': ['or', 'er'],
    'or': ['ar', 'er'],
    // R控母音 /ɛr/
    'air': ['are', 'ear', 'ere'],
    'are': ['air', 'ear'],
    // R控母音 /ɪr/
    'ear': ['eer', 'ere'],
    'eer': ['ear', 'ere'],
    'ere': ['ear', 'eer'],

    // --- 子音組合 ---
    // 氣音/摩擦音
    'th': ['f', 'v', 'd', 's'],
    'sh': ['ch', 's'],
    'ch': ['sh', 'tch', 'j'],
    'tch': ['ch'],
    'ph': ['f'],
    // 軟顎/硬顎
    'dg': ['j', 'g'],
    'ck': ['k', 'c'],
    'qu': ['kw', 'cw'],
    // 不發音字母陷阱
    'wh': ['w'],
    'wr': ['r'],
    'kn': ['n'],
    'gn': ['n'],
    'mb': ['m'],
    'bt': ['t'],
    'alk': ['awk', 'ok'],
    'alf': ['af'],
    'ps': ['s'],
    'pn': ['n'],
    'sc': ['s'],

    // --- 字尾結構（發音幾乎相同）---
    'tion': ['sion', 'cian', 'shon'],
    'sion': ['tion', 'cian'],
    'cian': ['tion', 'sion'],
    'tial': ['cial', 'shal'],
    'cial': ['tial', 'shal'],
    'able': ['ible'],
    'ible': ['able'],
    'ant': ['ent'],
    'ent': ['ant'],
    'ance': ['ence'],
    'ence': ['ance'],
    'ary': ['ery', 'ory'],
    'ery': ['ary', 'ory'],
    'ory': ['ary', 'ery'],
    'ous': ['us', 'ious'],
    'cle': ['kle', 'cal'],
    'kle': ['cle', 'cal'],
    'cal': ['cle', 'kle'],
    'le': ['el', 'al'],
    'al': ['el', 'le'],
    'ight': ['ite', 'yte'],
    'ough': ['off', 'uff', 'ow'],

    // --- 單雙子音混淆 ---
    'll': ['l'],
    'ss': ['s'],
    'mm': ['m'],
    'nn': ['n'],
    'pp': ['p'],
    'tt': ['t'],
    'rr': ['r'],
    'ff': ['f'],
};

// 反向：單子音→雙子音
const DOUBLE_CONSONANTS = { 'l': 'll', 's': 'ss', 'm': 'mm', 'n': 'nn', 'p': 'pp', 't': 'tt', 'r': 'rr', 'f': 'ff' };

const VOWELS = new Set('aeiouy');
function isVowel(ch) { return VOWELS.has(ch.toLowerCase()); }

// ===== 產生混淆單字 =====
export function generateConfusingWords(word, count = 5) {
    const results = new Set();
    const w = word.toLowerCase().trim();

    // 1. 字母組合替換（優先，最接近真實拼字陷阱）
    // 從最長的組合開始匹配，避免短組合搶先
    const sortedCombos = Object.entries(COMBO_SWAPS).sort((a, b) => b[0].length - a[0].length);
    for (const [combo, swaps] of sortedCombos) {
        const idx = w.indexOf(combo);
        if (idx === -1) continue;
        for (const swap of swaps) {
            const newWord = w.slice(0, idx) + swap + w.slice(idx + combo.length);
            if (newWord !== w && newWord.length >= 2) results.add(newWord);
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

    // 4. 單雙子音混淆（短母音後重複字尾）
    for (const [single, double] of Object.entries(DOUBLE_CONSONANTS)) {
        // 加倍
        const idx = w.lastIndexOf(single);
        if (idx > 0 && w[idx - 1] && isVowel(w[idx - 1]) && w.indexOf(double) === -1) {
            const doubled = w.slice(0, idx) + double + w.slice(idx + 1);
            if (doubled !== w) results.add(doubled);
        }
    }

    // 5. 字母省略或重複
    if (w.length >= 4) {
        for (let i = 1; i < w.length - 1; i++) {
            const shorter = w.slice(0, i) + w.slice(i + 1);
            if (shorter !== w && shorter.length >= 2) results.add(shorter);
        }
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

    // 7. 混合替換（母音+子音各換一個）
    for (let i = 0; i < w.length && results.size < count * 4; i++) {
        if (!isVowel(w[i])) continue;
        const vowelSwap = (VOWEL_SWAPS[w[i]] || [])[0];
        if (!vowelSwap) continue;
        const temp = w.slice(0, i) + vowelSwap + w.slice(i + 1);
        for (let j = 0; j < temp.length; j++) {
            if (isVowel(temp[j])) continue;
            const cs = CONSONANT_SWAPS[temp[j]];
            if (!cs) continue;
            const mixed = temp.slice(0, j) + cs[0] + temp.slice(j + 1);
            if (mixed !== w && mixed.length >= 2) results.add(mixed);
            if (results.size >= count * 4) break;
        }
    }

    // 過濾、洗牌
    results.delete(w);
    const arr = [...results].filter(r =>
        r.length >= 2 &&
        r.length <= w.length + 3 &&
        /^[a-z]+$/.test(r)
    );

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0, count);
}

// ===== 為答題產生選項 =====
export function generateQuizOptions(correctWord, optionCount = 4) {
    const confusing = generateConfusingWords(correctWord, optionCount - 1);

    while (confusing.length < optionCount - 1) {
        const w = correctWord.toLowerCase();
        const idx = Math.floor(Math.random() * w.length);
        const ch = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        const fake = w.slice(0, idx) + ch + w.slice(idx + 1);
        if (fake !== w && !confusing.includes(fake)) confusing.push(fake);
    }

    const options = [correctWord.toLowerCase(), ...confusing.slice(0, optionCount - 1)];

    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}
