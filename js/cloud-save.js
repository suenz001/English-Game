// ===== 雲端存檔系統 =====
// 登入後自動同步 Firestore，訪客用 localStorage
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from './firebase-config.js';

let currentUser = null;
let cloudData = null;
const listeners = [];

// 所有需要隔離的 localStorage key（localKey → firebaseKey）
const ALL_KEYS = [
    ['vocabSpire_activeCardIds',    'activeCardIds'],
    ['vocabSpire_playerCollection', 'playerCollection'],
    ['vocabSpire_playerDeckConfig', 'playerDeckConfig'],
    ['vocabSpire_customWords',      'customWords'],
    ['vocabSpire_customSimilar',    'customSimilar'],
    ['vocabSpire_cardImages',       'cardImages'],
    ['vocabSpire_savedRun',         'savedRun'],
];

// 登出時清除所有遊戲相關的 localStorage
function clearAllLocalData() {
    ALL_KEYS.forEach(([lk]) => localStorage.removeItem(lk));
    console.log('🗑️ 已清除本地資料');
}

// 登入後：把雲端資料寫回 localStorage，確保 admin.js 等讀到正確帳號的資料
function applyCloudToLocal(data) {
    ALL_KEYS.forEach(([lk, fk]) => {
        if (data[fk] !== undefined) {
            localStorage.setItem(lk, JSON.stringify(data[fk]));
        } else {
            localStorage.removeItem(lk); // 雲端沒有的也清掉，避免殘留前帳號資料
        }
    });
}

// 監聽登入狀態
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        await loadCloudData();
        if (cloudData) applyCloudToLocal(cloudData);
        console.log('☁️ 已載入雲端資料並同步至本地');
    } else {
        cloudData = null;
        clearAllLocalData(); // 登出時清除本地，防止不同帳號資料混用
    }
    listeners.forEach(fn => fn(user));
});

export function onUserChange(fn) { listeners.push(fn); }
export function getUser() { return currentUser; }

// ===== Firestore 讀寫 =====
async function loadCloudData() {
    if (!currentUser) return;
    try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        cloudData = snap.exists() ? snap.data() : {};
    } catch (e) {
        console.warn('⚠️ 載入雲端資料失敗', e);
        cloudData = {};
    }
}

async function saveCloudData(key, value) {
    if (!currentUser) return;
    // 立即更新本地快取，避免 race condition（不等 Firebase 寫入就能讀到新值）
    if (cloudData) cloudData[key] = value;
    try {
        const ref = doc(db, 'users', currentUser.uid);
        await setDoc(ref, { [key]: value, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
        console.warn('⚠️ 儲存雲端資料失敗', e);
    }
}

// ===== 通用存取（自動選擇 localStorage / Firestore）=====
export function cloudGet(localKey, firebaseKey) {
    // 登入：優先用雲端資料
    if (currentUser && cloudData && cloudData[firebaseKey] !== undefined) {
        return cloudData[firebaseKey];
    }
    // 訪客或無雲端資料：用 localStorage
    try { return JSON.parse(localStorage.getItem(localKey)); }
    catch { return null; }
}

export function cloudSet(localKey, firebaseKey, value) {
    // 一律存 localStorage（離線備份）
    localStorage.setItem(localKey, JSON.stringify(value));
    // 登入時同步到雲端
    if (currentUser) saveCloudData(firebaseKey, value);
}

// ===== 首次登入：將本地資料上傳到雲端 =====
export async function syncLocalToCloud() {
    if (!currentUser) return;
    const keys = [
        ['vocabSpire_activeCardIds', 'activeCardIds'],
        ['vocabSpire_playerCollection', 'playerCollection'],
        ['vocabSpire_playerDeckConfig', 'playerDeckConfig'],
        ['vocabSpire_customWords', 'customWords'],
        ['vocabSpire_customSimilar', 'customSimilar'],
        ['vocabSpire_cardImages', 'cardImages'],
    ];
    const ref = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(ref);
    // 雲端無資料時，才上傳本地
    if (!snap.exists() || !snap.data().playerDeckConfig) {
        const data = { createdAt: Date.now(), email: currentUser.email };
        keys.forEach(([lk, fk]) => {
            try {
                const v = JSON.parse(localStorage.getItem(lk));
                if (v) data[fk] = v;
            } catch {}
        });
        await setDoc(ref, data, { merge: true });
        cloudData = data;
        console.log('☁️ 本地資料已同步到雲端');
    }
}
