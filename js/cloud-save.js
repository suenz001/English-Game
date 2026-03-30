// ===== 雲端存檔系統 =====
// 登入後自動同步 Firestore，訪客用 localStorage
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from './firebase-config.js';

let currentUser = null;
let cloudData = null;
const listeners = [];

// 監聽登入狀態
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        await loadCloudData();
        console.log('☁️ 已載入雲端資料');
    } else {
        cloudData = null;
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
    try {
        const ref = doc(db, 'users', currentUser.uid);
        await setDoc(ref, { [key]: value, updatedAt: Date.now() }, { merge: true });
        if (cloudData) cloudData[key] = value;
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
