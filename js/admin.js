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
function getAllWords() { 
    const custom = getCustomWords();
    const customIds = new Set(custom.map(c => c.id));
    const baseCards = WORD_CARDS.filter(c => !customIds.has(c.id));
    return [...custom.reverse(), ...baseCards];
}
function getActiveIds() { try { const r = JSON.parse(localStorage.getItem(ACTIVE_KEY)); return r ? new Set(r) : null; } catch { return null; } }
function saveActiveIds(s) { localStorage.setItem(ACTIVE_KEY, JSON.stringify([...s])); }
function getCardImages() { try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}'); } catch { return {}; } }
function saveCardImages(m) { localStorage.setItem(IMAGES_KEY, JSON.stringify(m)); }

let currentPoolFilter = 'all';

// ===== EXTRA OPTIONS =====
const EXTRA_OPTIONS = {
    attack: [{ value: '', label: '無' },{ value: 'poison', label: '🧪 中毒' },{ value: 'hits2', label: '⚔️ 隨機二連擊' },{ value: 'aoe', label: '💥 全體攻擊' },{ value: 'vulnerable', label: '⚠️ 易傷(受傷1.5倍)' },{ value: 'weak', label: '😵‍💫 虛弱(傷害0.5倍)' }],
    defend: [{ value: '', label: '無' },{ value: 'draw1', label: '🃏 抽1張牌' },{ value: 'draw2', label: '🃏 抽2張牌' },{ value: 'energy1', label: '⚡ 獲得1點能量' },{ value: 'energy2', label: '⚡ 獲得2點能量' },{ value: 'reflect', label: '🔄 反彈傷害' }],
    skill: [{ value: 'draw', label: '🃏 抽牌' },{ value: 'energy', label: '⚡ 能量' },{ value: 'energyDraw1', label: '⚡🃏 獲得能量並抽1牌' },{ value: 'energyDraw2', label: '⚡🃏 獲得能量並抽2牌' }],
    power: [{ value: 'permAtk', label: '💪 力量（攻擊+）' },{ value: 'thorns', label: '🌹 荊棘（反傷）' },{ value: 'blockRegen', label: '🛡️ 護甲再生' },{ value: 'doubleAtk', label: '🏆 攻擊翻倍' }],
};

function generateSimilarWords(word) {
    return generateConfusingWords(word, 8);
}

function buildCardData(f) {
    const extra = {};
    const turns = parseInt(f.debuffTurns || 2);
    if (f.type==='attack') { if(f.extra==='poison') extra.poison=turns; if(f.extra==='hits2') extra.hits=2; if(f.extra==='aoe') extra.aoe=true; if(f.extra==='vulnerable') extra.vulnerable=turns; if(f.extra==='weak') extra.weak=turns; }
    else if (f.type==='defend') { if(f.extra==='draw1') extra.draw=1; if(f.extra==='draw2') extra.draw=2; if(f.extra==='energy1') extra.energy=1; if(f.extra==='energy2') extra.energy=2; if(f.extra==='reflect') extra.reflect=parseInt(f.value)||5; }
    else if (f.type==='skill') { if(f.extra==='heal') extra.heal=true; if(f.extra==='draw') extra.draw=true; if(f.extra==='energy') extra.energy=true; if(f.extra==='energyDraw1') { extra.energy=true; extra.bonusDraw=1; } if(f.extra==='energyDraw2') { extra.energy=true; extra.bonusDraw=2; } }
    else if (f.type==='power') { if(f.extra==='permAtk') extra.permAtk=true; if(f.extra==='thorns') extra.thorns=true; if(f.extra==='blockRegen') extra.blockRegen=true; if(f.extra==='doubleAtk') extra.doubleAtk=true; }

    const flavor = (f.flavor || '').trim();
    const em = f.emoji || '⭐';
    const fl = (suffix) => flavor ? `${flavor}，${suffix}` : suffix;
    let baseDesc;

    if (f.type === 'attack') {
        baseDesc = `${em} ${flavor || '攻擊'}，造成 {v} 點傷害`;
        if (f.extra === 'poison')     baseDesc += `，並給予 ${turns} 層毒`;
        if (f.extra === 'hits2')      baseDesc += `，隨機攻擊兩次`;
        if (f.extra === 'aoe')        baseDesc += `（全體攻擊）`;
        if (f.extra === 'vulnerable') baseDesc += `，並給予 ${turns} 回合易傷`;
        if (f.extra === 'weak')       baseDesc += `，並給予 ${turns} 回合虛弱`;
    } else if (f.type === 'defend') {
        baseDesc = `${em} ${flavor || '防禦'}，獲得 {v} 點護甲`;
        if (f.extra === 'draw1')   baseDesc += `，並抽 1 張牌`;
        if (f.extra === 'draw2')   baseDesc += `，並抽 2 張牌`;
        if (f.extra === 'energy1') baseDesc += `，並獲得 1 點能量`;
        if (f.extra === 'energy2') baseDesc += `，並獲得 2 點能量`;
        if (f.extra === 'reflect') baseDesc += `，並反彈 {v} 點傷害`;
    } else if (f.type === 'skill') {
        if (f.extra === 'draw')        baseDesc = `${em} ${fl('抽 {v} 張牌')}`;
        else if (f.extra === 'energy') baseDesc = `${em} ${fl('獲得 {v} 點能量')}`;
        else if (f.extra === 'energyDraw1') baseDesc = `${em} ${fl('獲得 {v} 點能量並抽 1 張牌')}`;
        else if (f.extra === 'energyDraw2') baseDesc = `${em} ${fl('獲得 {v} 點能量並抽 2 張牌')}`;
        else baseDesc = `${em} ${fl('效果 {v}')}`;
    } else if (f.type === 'power') {
        if (f.extra === 'permAtk')      baseDesc = `${em} ${fl('本場攻擊力 +{v}')}`;
        else if (f.extra === 'thorns')     baseDesc = `${em} ${fl('戰鬥中反彈 {v} 傷害')}`;
        else if (f.extra === 'blockRegen') baseDesc = `${em} ${fl('每回合獲得 {v} 點護甲')}`;
        else if (f.extra === 'doubleAtk')  baseDesc = `${em} ${fl('本場攻擊傷害翻倍')}`;
        else baseDesc = `${em} ${fl('能力 {v}')}`;
    } else {
        baseDesc = `${em} 效果 {v}`;
    }

    return { id: f.en.toLowerCase().trim(), en: f.en.toLowerCase().trim(), zh: f.zh.trim(), difficulty: 1, rarity: f.rarity || 'common',
        type: f.type, cost: parseInt(f.cost), value: parseInt(f.value), emoji: f.emoji || '⭐',
        desc: baseDesc, extra: Object.keys(extra).length ? extra : undefined,
        ...(flavor ? { flavor } : {}) };
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
    const raritySelect = document.getElementById('word-rarity');
    typeSelect.addEventListener('change', updateExtra);
    extraSelect.addEventListener('change', updateDebuffTurns);
    raritySelect.addEventListener('change', updateRarityGuide);
    updateExtra();
    updateRarityGuide();

    function updateExtra() {
        const opts = EXTRA_OPTIONS[typeSelect.value] || [];
        extraSelect.innerHTML = opts.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        updateDebuffTurns();
    }
    
    function updateDebuffTurns() {
        const t = extraSelect.value;
        const group = document.getElementById('debuff-duration-group');
        if (['poison', 'weak', 'vulnerable'].includes(t)) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    }

    function updateRarityGuide() {
        const r = raritySelect.value;
        const config = RARITY_CONFIG[r];
        if (!config || !config.guide) {
            document.getElementById('rarity-guide').style.display = 'none';
            return;
        }
        document.getElementById('rarity-guide').style.display = 'block';
        document.getElementById('rarity-guide').innerHTML = `
            <div class="rarity-guide-title">📊 ${config.label}卡 建議數值範圍</div>
            <div style="color: #bbb">${config.guide.desc}</div>
            <div class="guide-stats">
                <span class="guide-stat">⚔️ 攻擊: <strong>${config.guide.attack}</strong></span>
                <span class="guide-stat">🛡️ 防禦: <strong>${config.guide.defend}</strong></span>
                <span class="guide-stat">✨ 技能: <strong>${config.guide.skill}</strong></span>
                <span class="guide-stat">⌛ 狀態: <strong>${config.guide.debuff}</strong></span>
            </div>
        `;
    }

    document.getElementById('word-form').addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const card = buildCardData({
            en: document.getElementById('word-en').value, zh: document.getElementById('word-zh').value,
            rarity: document.getElementById('word-rarity').value, type: typeSelect.value,
            cost: document.getElementById('word-cost').value, value: document.getElementById('word-value').value,
            emoji: document.getElementById('word-emoji').value, extra: extraSelect.value,
            debuffTurns: document.getElementById('word-debuff-turns').value,
            flavor: document.getElementById('word-flavor').value,
        });
        const similarInput = document.getElementById('word-similar').value.trim();
        const similar = similarInput ? similarInput.split(',').map(s => s.trim()).filter(Boolean) : generateSimilarWords(card.en);
        let words = getCustomWords();
        // 允許覆寫：直接移除舊的（無論是本來就在編輯的，還是新的 ID 剛好撞到舊的自訂字）
        words = words.filter(w => w.id !== card.id && w.id !== editId);
        
        words.push(card);
        saveCustomWords(words);
        const s = getCustomSimilar(); s[card.id] = similar; saveCustomSimilar(s);
        // Auto-activate new card
        let active = getActiveIds(); if (active) { active.add(card.id); saveActiveIds(active); }
        document.getElementById('word-form').reset();
        document.getElementById('word-emoji').value = '⭐'; document.getElementById('word-value').value = '6';
        document.getElementById('word-flavor').value = '';
        document.getElementById('edit-id').value = ''; document.getElementById('form-title').textContent = '➕ 新增單字卡';
        document.getElementById('submit-btn').textContent = '✅ 新增卡牌';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
        if (document.getElementById('emoji-picker')) document.getElementById('emoji-picker').classList.add('hidden');
        updateExtra(); renderWordList(); renderCardPool();
        alert(`✅「${card.en}」已新增！`);
    });

    // Emoji 選擇器
    setupEmojiPicker();

    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('word-form').reset(); document.getElementById('edit-id').value = '';
        document.getElementById('word-flavor').value = '';
        document.getElementById('form-title').textContent = '➕ 新增單字卡';
        document.getElementById('submit-btn').textContent = '✅ 新增卡牌';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    });

    // 監聽英文輸入，自動帶出現有屬性
    document.getElementById('word-en').addEventListener('blur', (e) => {
        const text = e.target.value.toLowerCase().trim();
        if (!text) return;
        
        // 若已經在編輯這個字，就不再重複觸發
        if (document.getElementById('edit-id').value === text) return;

        const existing = getAllWords().find(w => w.id === text);
        if (existing) {
            if (confirm(`發現已存在的卡牌「${existing.en} (${existing.zh})」，是否載入其設定進行編輯或覆寫？`)) {
                window.editWord(existing.id);
            }
        }
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
                    <span class="pool-en">${card.en} <button class="admin-info-btn" data-id="${card.id}" style="border:none;background:none;cursor:pointer;font-size:16px;" title="檢視卡片資訊">🔍</button></span><span class="pool-zh">${card.zh}</span>
                    <div class="pool-meta">${typeLabel[card.type]||''} ${card.desc.replace('{v}',card.value)} | ⚡${card.cost} | <span style="color:${rarityConf.color}">${rarityLabel}</span></div>
                </div>
                <div class="pool-img-actions">
                    ${hasImage ? '<span class="img-indicator">📷</span>' : ''}
                    <label class="upload-label">📷<input type="file" accept="image/png,image/jpeg,image/webp" data-id="${card.id}"></label>
                    ${hasImage ? `<button class="clear-img" data-id="${card.id}">✕</button>` : ''}
                </div>
            </div>`;
    }).join('');

    // Info click events
    container.querySelectorAll('.admin-info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.showCardDetail) window.showCardDetail(btn.dataset.id);
        });
    });

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

    // 最新的放最上面
    const reversed = [...words].reverse();
    container.innerHTML = reversed.map(w => {
        const rarity = w.rarity || 'common';
        const rc = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
        return `
        <div class="word-item" style="border-left:3px solid ${rc.color}">
            <span class="word-emoji">${w.emoji}</span>
            <div class="word-info">
                <span class="word-en">${w.en}</span> <span class="word-zh">${w.zh}</span>
                <div class="word-meta">${typeLabel[w.type]||w.type} | ⚡${w.cost} | 數值${w.value} | <span style="color:${rc.color}">${rc.label}</span></div>
            </div>
            <div class="word-actions">
                <button onclick="window.showCardDetail('${w.id}')">🔍</button>
                <button onclick="editWord('${w.id}')">✏️</button>
                <button class="delete-btn" onclick="deleteWord('${w.id}')">🗑️</button>
            </div>
        </div>
    `}).join('');
}

window.editWord = function(id) {
    const w = getAllWords().find(x => x.id === id); if (!w) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('word-en').value = w.en; document.getElementById('word-zh').value = w.zh;
    document.getElementById('word-rarity').value = w.rarity || 'common';
    document.getElementById('word-rarity').dispatchEvent(new Event('change'));
    document.getElementById('word-type').value = w.type;
    document.getElementById('word-type').dispatchEvent(new Event('change'));
    document.getElementById('word-cost').value = w.cost; 
    document.getElementById('word-value').value = w.value;
    document.getElementById('word-emoji').value = w.emoji;
    
    // 還原描述前綴
    document.getElementById('word-flavor').value = w.flavor || '';

    // 判斷原來的 extra
    const extraEl = document.getElementById('word-extra');
    const debuffEl = document.getElementById('word-debuff-turns');
    extraEl.value = '';
    if (w.extra) {
        if (w.extra.poison)      { extraEl.value = 'poison';      debuffEl.value = w.extra.poison; }
        else if (w.extra.hits)   { extraEl.value = 'hits2'; }
        else if (w.extra.aoe)    { extraEl.value = 'aoe'; }
        else if (w.extra.vulnerable) { extraEl.value = 'vulnerable'; debuffEl.value = w.extra.vulnerable; }
        else if (w.extra.weak)   { extraEl.value = 'weak';         debuffEl.value = w.extra.weak; }
        else if (w.extra.reflect){ extraEl.value = 'reflect'; }
        else if (w.type === 'defend' && w.extra.draw === 2)   { extraEl.value = 'draw2'; }
        else if (w.type === 'defend' && w.extra.draw === 1)   { extraEl.value = 'draw1'; }
        else if (w.type === 'defend' && w.extra.energy === 2) { extraEl.value = 'energy2'; }
        else if (w.type === 'defend' && w.extra.energy === 1) { extraEl.value = 'energy1'; }
        else if (w.extra.energy && w.extra.bonusDraw === 2)   { extraEl.value = 'energyDraw2'; }
        else if (w.extra.energy && w.extra.bonusDraw === 1)   { extraEl.value = 'energyDraw1'; }
        else if (w.extra.draw)       { extraEl.value = 'draw'; }
        else if (w.extra.energy)     { extraEl.value = 'energy'; }
        else if (w.extra.heal)       { extraEl.value = 'heal'; }
        else if (w.extra.permAtk)    { extraEl.value = 'permAtk'; }
        else if (w.extra.thorns)     { extraEl.value = 'thorns'; }
        else if (w.extra.blockRegen) { extraEl.value = 'blockRegen'; }
        else if (w.extra.doubleAtk)  { extraEl.value = 'doubleAtk'; }
    }
    extraEl.dispatchEvent(new Event('change'));
    
    const similar = getCustomSimilar(); 
    document.getElementById('word-similar').value = (similar[id]||[]).join(', ');
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

window.showCardDetail = function(cardId) {
    const card = getAllWords().find(c => c.id === cardId);
    if (!card) return;
    const rc = RARITY_CONFIG[card.rarity || 'common'] || RARITY_CONFIG.common;
    const typeLabel = { attack: '⚔️ 攻擊', defend: '🛡️ 防禦', skill: '✨ 技能', power: '💜 能力' }[card.type] || card.type;
    const artHtml = getCardArt(card.id);

    let overlay = document.getElementById('admin-card-detail-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'admin-card-detail-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
    }
    overlay.innerHTML = `
        <div style="background:linear-gradient(135deg,#2d1b4e,#1a0a2e);border:3px solid ${rc.color};border-radius:20px;padding:25px 20px;max-width:280px;width:88%;text-align:center;color:#fff;box-shadow:0 10px 40px ${rc.color}55;">
            <div style="font-size:1.8em;font-weight:900;color:${rc.color};letter-spacing:1px;">${card.en}</div>
            <div style="font-size:1.1em;color:#f1c40f;margin:4px 0 10px;">${card.zh}</div>
            <div style="width:110px;height:75px;margin:0 auto 10px;">${artHtml}</div>
            <div style="color:#a78bba;font-size:0.85em;margin-bottom:10px;">${typeLabel} | ⚡${card.cost} | <span style="color:${rc.color}">${rc.label}</span></div>
            <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:10px;font-size:0.9em;line-height:1.6;">${card.desc.replace('{v}', `<b>${card.value}</b>`)}</div>
            <button onclick="document.getElementById('admin-card-detail-overlay').style.display='none'" style="margin-top:15px;padding:8px 28px;border:2px solid rgba(255,255,255,0.25);border-radius:15px;background:transparent;color:#fff;cursor:pointer;font-size:0.9em;">關閉</button>
        </div>`;
    overlay.style.display = 'flex';
};

window.deleteWord = function(id) {
    if (!confirm(`確定刪除「${id}」？`)) return;
    saveCustomWords(getCustomWords().filter(w => w.id !== id));
    const s = getCustomSimilar(); delete s[id]; saveCustomSimilar(s);
    const imgs = getCardImages(); delete imgs[id]; saveCardImages(imgs);
    renderWordList(); renderCardPool();
};

// ===== Emoji 選擇器 =====
function setupEmojiPicker() {
    const EMOJIS = {
        '動物': ['🐱','🐶','🐦','🐟','🦁','🐻','🐝','🐍','🐯','🦈','🦅','🐴','🐺','🐉','🕷️','🐸','🐧','🦊','🐰','🐮','🐷','🐵','🦋','🐢','🐘','🦒','🦓','🐬','🦀','🐙','🦜','🦉','🐿️','🦇'],
        '食物': ['🍎','🍌','🍇','🍕','🍔','🍰','🎂','🍬','🍩','🍪','🥛','🧁','🍓','🥚','🍒','🌽','🥕','🍜','🍣','🍦','🧀','🥝','🍉','🍋','🥑','🍑','🍫','☕'],
        '自然': ['☀️','🌙','⭐','🌧️','🔥','🧊','🌳','🌊','⛰️','🌋','🌈','🌸','🌹','🌺','💧','☁️','🌪️','❄️','🍀','🌻','🍄','🌴','🏝️','💎','🪨','🌲'],
        '武器': ['⚔️','🗡️','🏹','🔪','🔨','🛡️','💥','💣','🪓','🔱','⛑️','🦺','☂️'],
        '魔法': ['✨','🔮','💡','🕯️','👑','🏆','💰','📖','🧪','👼','🔥','⚡','💫','🌟','🎭','🎪','🪄'],
        '表情': ['😊','😡','💪','👊','🦶','👁️','🏃','😎','🤩','😱','🥳','😈','👻','💀','👹','🤖','👽','🧙'],
        '物品': ['🎩','🥤','📦','🛏️','🎒','🚪','🎮','🎵','💭','🎯','🗝️','📷','💌','🎁','🏠','🏰','🌉','🚀','🎸','📱','⏰','🔔','🧲','🪞'],
    };

    const emojiInput = document.getElementById('word-emoji');
    // 建立選擇器 DOM
    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.className = 'emoji-picker hidden';
    let html = '';
    for (const [cat, emojis] of Object.entries(EMOJIS)) {
        html += `<div class="emoji-cat-label">${cat}</div><div class="emoji-grid">`;
        html += emojis.map(e => `<span class="emoji-option" data-emoji="${e}">${e}</span>`).join('');
        html += '</div>';
    }
    picker.innerHTML = html;
    emojiInput.parentElement.appendChild(picker);

    // 點擊 input 顯示/隱藏
    emojiInput.addEventListener('click', (e) => {
        e.preventDefault();
        picker.classList.toggle('hidden');
    });

    // 選擇 emoji
    picker.addEventListener('click', (e) => {
        const opt = e.target.closest('.emoji-option');
        if (opt) {
            emojiInput.value = opt.dataset.emoji;
            picker.classList.add('hidden');
        }
    });

    // 點外面關閉
    document.addEventListener('click', (e) => {
        if (!emojiInput.contains(e.target) && !picker.contains(e.target)) {
            picker.classList.add('hidden');
        }
    });
}
