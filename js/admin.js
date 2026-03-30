// ===== 家長管理系統 =====
import { WORD_CARDS, STARTER_DECK, RARITY_CONFIG } from './data.js';
import { getCardArt } from './cardart.js';
import { generateConfusingWords } from './phonetics.js';

const PWD_KEY = 'vocabSpire_adminPwd';
const WORDS_KEY = 'vocabSpire_customWords';
const SIMILAR_KEY = 'vocabSpire_customSimilar';
const ACTIVE_KEY = 'vocabSpire_activeCardIds';
const IMAGES_KEY = 'vocabSpire_cardImages';

function getPassword() { return localStorage.getItem(PWD_KEY) || '1234'; }
function setPassword(p) { localStorage.setItem(PWD_KEY, p); }
function getCustomWords() { try { return JSON.parse(localStorage.getItem(WORDS_KEY) || '[]'); } catch { return []; } }
function saveCustomWords(w) { localStorage.setItem(WORDS_KEY, JSON.stringify(w)); }
function getCustomSimilar() { try { return JSON.parse(localStorage.getItem(SIMILAR_KEY) || '{}'); } catch { return {}; } }
function saveCustomSimilar(s) { localStorage.setItem(SIMILAR_KEY, JSON.stringify(s)); }
function getAllWords() { return [...WORD_CARDS, ...getCustomWords()]; }
function getActiveIds() { try { const r = JSON.parse(localStorage.getItem(ACTIVE_KEY)); return r ? new Set(r) : null; } catch { return null; } }
function saveActiveIds(s) { localStorage.setItem(ACTIVE_KEY, JSON.stringify([...s])); }
function getCardImages() { try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}'); } catch { return {}; } }
function saveCardImages(m) { localStorage.setItem(IMAGES_KEY, JSON.stringify(m)); }

let currentPoolFilter = 'all';

// ===== EXTRA OPTIONS =====
const EXTRA_OPTIONS = {
    attack: [{ value: '', label: '無' },{ value: 'poison', label: '🧪 中毒' },{ value: 'burn', label: '🔥 灼燒' },{ value: 'hits2', label: '⚔️ 二連擊' },{ value: 'vulnerable', label: '⚠️ 易傷(受傷1.5倍)' },{ value: 'weak', label: '😵‍💫 虛弱(傷害0.5倍)' }],
    defend: [{ value: '', label: '無' },{ value: 'draw1', label: '🃏 抽1牌' },{ value: 'vulnerable', label: '⚠️ 易傷(受傷1.5倍)' },{ value: 'weak', label: '😵‍💫 虛弱(傷害0.5倍)' }],
    skill: [{ value: 'heal', label: '💚 回血' },{ value: 'draw', label: '🃏 抽牌' },{ value: 'energy', label: '⚡ 能量' }],
    power: [{ value: 'permAtk', label: '💪 攻擊+' },{ value: 'regen', label: '🌿 回血' },{ value: 'thorns', label: '🌹 反傷' }],
};

function generateSimilarWords(word) {
    return generateConfusingWords(word, 8);
}

function buildCardData(f) {
    const extra = {};
    if (f.type==='attack') { if(f.extra==='poison') extra.poison=2; if(f.extra==='burn') extra.burn=2; if(f.extra==='hits2') extra.hits=2; if(f.extra==='vulnerable') extra.vulnerable=2; if(f.extra==='weak') extra.weak=2; }
    else if (f.type==='defend') { if(f.extra==='draw1') extra.draw=1; if(f.extra==='vulnerable') extra.vulnerable=2; if(f.extra==='weak') extra.weak=2; }
    else if (f.type==='skill') { if(f.extra==='heal') extra.heal=true; if(f.extra==='draw') extra.draw=true; if(f.extra==='energy') extra.energy=true; }
    else if (f.type==='power') { if(f.extra==='permAtk') extra.permAtk=true; if(f.extra==='regen') extra.regen=true; if(f.extra==='thorns') extra.thorns=true; }
    const tpl = { attack:'攻擊，造成 {v} 點傷害', defend:'防禦，獲得 {v} 點護甲', skill:'效果 {v}', power:'能力 {v}' };
    return { id: f.en.toLowerCase().trim(), en: f.en.toLowerCase().trim(), zh: f.zh.trim(), difficulty: 1, rarity: f.rarity || 'common',
        type: f.type, cost: parseInt(f.cost), value: parseInt(f.value), emoji: f.emoji || '⭐',
        desc: `${f.emoji||'⭐'} ${tpl[f.type]}`, extra: Object.keys(extra).length ? extra : undefined };
}

// ===== 圖片壓縮 =====
function compressImage(file, maxW = 200, maxH = 140) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('img-canvas');
                let w = img.width, h = img.height;
                if (w > maxW) { h = h * maxW / w; w = maxW; }
                if (h > maxH) { w = w * maxH / h; h = maxH; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ===== DOM =====
document.addEventListener('DOMContentLoaded', () => {
    const pwdScreen = document.getElementById('password-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const pwdInput = document.getElementById('password-input');
    const pwdError = document.getElementById('password-error');

    // 解鎖
    document.getElementById('unlock-btn').addEventListener('click', () => {
        if (pwdInput.value === getPassword()) { pwdScreen.classList.add('hidden'); dashboard.classList.remove('hidden'); renderCardPool(); renderWordList(); }
        else { pwdError.classList.remove('hidden'); pwdInput.value = ''; setTimeout(() => pwdError.classList.add('hidden'), 2000); }
    });
    pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('unlock-btn').click(); });

    document.getElementById('logout-btn').addEventListener('click', () => { dashboard.classList.add('hidden'); pwdScreen.classList.remove('hidden'); pwdInput.value = ''; });
    document.getElementById('change-pwd-btn').addEventListener('click', () => {
        const p = prompt('請輸入新密碼（4-10位）：');
        if (p && p.length >= 4) { setPassword(p); alert('✅ 密碼已更新！'); } else if (p) alert('密碼至少4位！');
    });

    // Tab 切換
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
        });
    });

    // Pool 篩選
    document.querySelectorAll('.pool-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pool-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPoolFilter = btn.dataset.diff;
            renderCardPool();
        });
    });

    // 全選/全不選
    document.getElementById('select-all-btn').addEventListener('click', () => {
        const all = getAllWords().map(c => c.id);
        saveActiveIds(new Set(all));
        renderCardPool();
    });
    document.getElementById('deselect-all-btn').addEventListener('click', () => {
        saveActiveIds(new Set());
        renderCardPool();
    });

    // ===== Custom word form =====
    const typeSelect = document.getElementById('word-type');
    const extraSelect = document.getElementById('word-extra');
    typeSelect.addEventListener('change', updateExtra);
    updateExtra();

    function updateExtra() {
        const opts = EXTRA_OPTIONS[typeSelect.value] || [];
        extraSelect.innerHTML = opts.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    }

    document.getElementById('word-form').addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const card = buildCardData({
            en: document.getElementById('word-en').value, zh: document.getElementById('word-zh').value,
            rarity: document.getElementById('word-rarity').value, type: typeSelect.value,
            cost: document.getElementById('word-cost').value, value: document.getElementById('word-value').value,
            emoji: document.getElementById('word-emoji').value, extra: extraSelect.value,
        });
        const similarInput = document.getElementById('word-similar').value.trim();
        const similar = similarInput ? similarInput.split(',').map(s => s.trim()).filter(Boolean) : generateSimilarWords(card.en);
        let words = getCustomWords();
        if (editId) words = words.filter(w => w.id !== editId);
        if (words.find(w => w.id === card.id) || WORD_CARDS.find(w => w.id === card.id)) { alert(`「${card.en}」已存在！`); return; }
        words.push(card);
        saveCustomWords(words);
        const s = getCustomSimilar(); s[card.id] = similar; saveCustomSimilar(s);
        // Auto-activate new card
        let active = getActiveIds(); if (active) { active.add(card.id); saveActiveIds(active); }
        document.getElementById('word-form').reset();
        document.getElementById('word-emoji').value = '⭐'; document.getElementById('word-value').value = '6';
        document.getElementById('edit-id').value = ''; document.getElementById('form-title').textContent = '➕ 新增單字卡';
        document.getElementById('submit-btn').textContent = '✅ 新增卡牌';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
        updateExtra(); renderWordList(); renderCardPool();
        alert(`✅「${card.en}」已新增！`);
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('word-form').reset(); document.getElementById('edit-id').value = '';
        document.getElementById('form-title').textContent = '➕ 新增單字卡';
        document.getElementById('submit-btn').textContent = '✅ 新增卡牌';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    });
});

// ===== Render Card Pool =====
function renderCardPool() {
    const all = getAllWords();
    const active = getActiveIds();
    const images = getCardImages();
    const filtered = currentPoolFilter === 'all' ? all : all.filter(c => (c.rarity || 'common') === currentPoolFilter);
    const typeLabel = { attack:'⚔️', defend:'🛡️', skill:'✨', power:'💜' };
    const container = document.getElementById('card-pool-list');

    const activeCount = active ? filtered.filter(c => active.has(c.id)).length : filtered.length;
    document.getElementById('active-count').textContent = active ? all.filter(c => active.has(c.id)).length : all.length;
    document.getElementById('total-count').textContent = all.length;

    container.innerHTML = filtered.map(card => {
        const isActive = active ? active.has(card.id) : true;
        const hasImage = !!images[card.id];
        const artHtml = getCardArt(card.id);
        const rarity = card.rarity || 'common';
        const rarityConf = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
        const rarityLabel = rarityConf.label;
        return `
            <div class="pool-card ${isActive ? '' : 'inactive'}" style="border-left: 3px solid ${rarityConf.color}">
                <div class="pool-toggle"><input type="checkbox" ${isActive ? 'checked' : ''} data-id="${card.id}"></div>
                <div class="pool-preview">${artHtml}</div>
                <div class="pool-info">
                    <span class="pool-en">${card.en}</span><span class="pool-zh">${card.zh}</span>
                    <div class="pool-meta">${typeLabel[card.type]||''} ${card.desc.replace('{v}',card.value)} | ⚡${card.cost} | <span style="color:${rarityConf.color}">${rarityLabel}</span></div>
                </div>
                <div class="pool-img-actions">
                    ${hasImage ? '<span class="img-indicator">📷</span>' : ''}
                    <label class="upload-label">📷<input type="file" accept="image/png,image/jpeg,image/webp" data-id="${card.id}"></label>
                    ${hasImage ? `<button class="clear-img" data-id="${card.id}">✕</button>` : ''}
                </div>
            </div>`;
    }).join('');

    // Toggle events
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            let ids = getActiveIds() || new Set(all.map(c => c.id));
            if (cb.checked) ids.add(cb.dataset.id); else ids.delete(cb.dataset.id);
            saveActiveIds(ids);
            renderCardPool();
        });
    });

    // Upload events
    container.querySelectorAll('input[type="file"]').forEach(inp => {
        inp.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const dataUrl = await compressImage(file);
            const imgs = getCardImages();
            imgs[inp.dataset.id] = dataUrl;
            saveCardImages(imgs);
            renderCardPool();
        });
    });

    // Clear image events
    container.querySelectorAll('.clear-img').forEach(btn => {
        btn.addEventListener('click', () => {
            const imgs = getCardImages();
            delete imgs[btn.dataset.id];
            saveCardImages(imgs);
            renderCardPool();
        });
    });
}

// ===== Render Word List =====
function renderWordList() {
    const words = getCustomWords();
    const container = document.getElementById('custom-words-list');
    const emptyState = document.getElementById('empty-state');
    const typeLabel = { attack:'⚔️攻擊', defend:'🛡️防禦', skill:'✨技能', power:'💜能力' };

    if (words.length === 0) { container.innerHTML = ''; emptyState.classList.remove('hidden'); return; }
    emptyState.classList.add('hidden');

    container.innerHTML = words.map(w => `
        <div class="word-item">
            <span class="word-emoji">${w.emoji}</span>
            <div class="word-info">
                <span class="word-en">${w.en}</span> <span class="word-zh">${w.zh}</span>
                <div class="word-meta">${typeLabel[w.type]||w.type} | ⚡${w.cost} | 數值${w.value}</div>
            </div>
            <div class="word-actions">
                <button onclick="editWord('${w.id}')">✏️</button>
                <button class="delete-btn" onclick="deleteWord('${w.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.editWord = function(id) {
    const w = getCustomWords().find(x => x.id === id); if (!w) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('word-en').value = w.en; document.getElementById('word-zh').value = w.zh;
    document.getElementById('word-difficulty').value = w.difficulty; document.getElementById('word-type').value = w.type;
    document.getElementById('word-type').dispatchEvent(new Event('change'));
    document.getElementById('word-cost').value = w.cost; document.getElementById('word-value').value = w.value;
    document.getElementById('word-emoji').value = w.emoji;
    const similar = getCustomSimilar(); document.getElementById('word-similar').value = (similar[id]||[]).join(', ');
    document.getElementById('form-title').textContent = '✏️ 編輯單字卡';
    document.getElementById('submit-btn').textContent = '💾 儲存';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    // Switch to custom tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelector('[data-tab="custom"]').classList.add('active');
    document.getElementById('tab-custom').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteWord = function(id) {
    if (!confirm(`確定刪除「${id}」？`)) return;
    saveCustomWords(getCustomWords().filter(w => w.id !== id));
    const s = getCustomSimilar(); delete s[id]; saveCustomSimilar(s);
    const imgs = getCardImages(); delete imgs[id]; saveCardImages(imgs);
    renderWordList(); renderCardPool();
};
