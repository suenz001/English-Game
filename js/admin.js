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
function getAllWords() { return [...getCustomWords().reverse(), ...WORD_CARDS]; }
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
    const turns = parseInt(f.debuffTurns || 2);
    if (f.type==='attack') { if(f.extra==='poison') extra.poison=turns; if(f.extra==='burn') extra.burn=turns; if(f.extra==='hits2') extra.hits=2; if(f.extra==='vulnerable') extra.vulnerable=turns; if(f.extra==='weak') extra.weak=turns; }
    else if (f.type==='defend') { if(f.extra==='draw1') extra.draw=1; if(f.extra==='vulnerable') extra.vulnerable=turns; if(f.extra==='weak') extra.weak=turns; }
    else if (f.type==='skill') { if(f.extra==='heal') extra.heal=true; if(f.extra==='draw') extra.draw=true; if(f.extra==='energy') extra.energy=true; }
    else if (f.type==='power') { if(f.extra==='permAtk') extra.permAtk=true; if(f.extra==='regen') extra.regen=true; if(f.extra==='thorns') extra.thorns=true; }
    
    const tpl = { attack:'攻擊，造成 {v} 點傷害', defend:'防禦，獲得 {v} 點護甲', skill:'效果 {v}', power:'能力 {v}' };
    let baseDesc = `${f.emoji||'⭐'} ${tpl[f.type]}`;
    
    // 加上額外效果的說明文字（含回合數）
    if (f.extra) {
        if (f.extra === 'poison') baseDesc += `，並給予 ${turns} 毒`;
        if (f.extra === 'burn') baseDesc += `，並燒毀 ${turns} 回合`;
        if (f.extra === 'hits2') baseDesc += ` (攻擊兩次)`;
        if (f.extra === 'vulnerable') baseDesc += `，並給予 ${turns} 回合易傷`;
        if (f.extra === 'weak') baseDesc += `，並給予 ${turns} 回合虛弱`;
        if (f.extra === 'draw1') baseDesc += `，並抽 1 張牌`;
        if (f.extra === 'heal') baseDesc = `${f.emoji||'⭐'} 回復 {v} 血量`;
        if (f.extra === 'draw') baseDesc = `${f.emoji||'⭐'} 抽 {v} 張牌`;
        if (f.extra === 'energy') baseDesc = `${f.emoji||'⭐'} 獲得 {v} 能量`;
        if (f.extra === 'permAtk') baseDesc = `${f.emoji||'⭐'} 戰鬥中攻擊力 +{v}`;
        if (f.extra === 'regen') baseDesc = `${f.emoji||'⭐'} 戰鬥中每回合回復 ${Math.max(1, Math.floor(f.value/2))} 血量`;
        if (f.extra === 'thorns') baseDesc = `${f.emoji||'⭐'} 戰鬥中反彈 {v} 傷害`;
    }

    return { id: f.en.toLowerCase().trim(), en: f.en.toLowerCase().trim(), zh: f.zh.trim(), difficulty: 1, rarity: f.rarity || 'common',
        type: f.type, cost: parseInt(f.cost), value: parseInt(f.value), emoji: f.emoji || '⭐',
        desc: baseDesc, extra: Object.keys(extra).length ? extra : undefined };
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
        if (['poison', 'burn', 'weak', 'vulnerable'].includes(t)) {
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
            debuffTurns: document.getElementById('word-debuff-turns').value
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
        if (document.getElementById('emoji-picker')) document.getElementById('emoji-picker').classList.add('hidden');
        updateExtra(); renderWordList(); renderCardPool();
        alert(`✅「${card.en}」已新增！`);
    });

    // Emoji 選擇器
    setupEmojiPicker();

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
                <button onclick="editWord('${w.id}')">✏️</button>
                <button class="delete-btn" onclick="deleteWord('${w.id}')">🗑️</button>
            </div>
        </div>
    `}).join('');
}

window.editWord = function(id) {
    const w = getCustomWords().find(x => x.id === id); if (!w) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('word-en').value = w.en; document.getElementById('word-zh').value = w.zh;
    document.getElementById('word-rarity').value = w.rarity || 'common';
    document.getElementById('word-rarity').dispatchEvent(new Event('change'));
    document.getElementById('word-type').value = w.type;
    document.getElementById('word-type').dispatchEvent(new Event('change'));
    document.getElementById('word-cost').value = w.cost; 
    document.getElementById('word-value').value = w.value;
    document.getElementById('word-emoji').value = w.emoji;
    
    // 判斷原來的 extra
    if (w.extra) {
        if (w.extra.poison) { document.getElementById('word-extra').value = 'poison'; document.getElementById('word-debuff-turns').value = w.extra.poison; }
        else if (w.extra.burn) { document.getElementById('word-extra').value = 'burn'; document.getElementById('word-debuff-turns').value = w.extra.burn; }
        else if (w.extra.hits) document.getElementById('word-extra').value = 'hits2';
        else if (w.extra.vulnerable) { document.getElementById('word-extra').value = 'vulnerable'; document.getElementById('word-debuff-turns').value = w.extra.vulnerable; }
        else if (w.extra.weak) { document.getElementById('word-extra').value = 'weak'; document.getElementById('word-debuff-turns').value = w.extra.weak; }
        else if (w.extra.draw) {
            if (w.type === 'skill') document.getElementById('word-extra').value = 'draw';
            else document.getElementById('word-extra').value = 'draw1'; // for defend
        }
        else if (w.extra.energy) document.getElementById('word-extra').value = 'energy';
        else if (w.extra.heal) document.getElementById('word-extra').value = 'heal';
        else if (w.extra.permAtk) document.getElementById('word-extra').value = 'permAtk';
        else if (w.extra.regen) document.getElementById('word-extra').value = 'regen';
        else if (w.extra.thorns) document.getElementById('word-extra').value = 'thorns';
    } else {
        document.getElementById('word-extra').value = '';
    }
    document.getElementById('word-extra').dispatchEvent(new Event('change'));
    
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
