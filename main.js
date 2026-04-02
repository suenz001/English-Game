import { prepareNewRun, confirmHeroAndStartMap, showMap, loadSavedRun } from './js/map.js';
import { initAuthUI } from './js/auth.js';
import { onUserChange, cloudGet, cloudSet, getUser } from './js/cloud-save.js';
import { sfxUI, sfxDraw, setSfxVolume, getSfxVolume } from './js/sound.js';
import { setVoiceVolume, getVoiceVolume } from './js/speech.js';
import { auth, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from './js/firebase-config.js';

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#2d1b4e', color: '#fff' });

// 初始化帳號系統
initAuthUI();

const titleScreen = document.getElementById('title-screen');
const mapScreen = document.getElementById('map-screen');
const battleScreen = document.getElementById('battle-screen');
const continueBtn = document.getElementById('continue-btn');

function updateContinueButton() {
    const savedData = cloudGet('vocabSpire_savedRun', 'savedRun');
    if (savedData) continueBtn.classList.remove('hidden');
    else continueBtn.classList.add('hidden');
}

onUserChange(updateContinueButton);

let newRunBaseDeck = [];
let newRunEquippedCards = [];
let chosenHero = '🦸‍♂️';

// ===== 開始遊戲 =====
document.getElementById('start-btn').addEventListener('click', () => {
    sfxUI();
    cloudSet('vocabSpire_savedRun', 'savedRun', null); // 新的一局先清除存檔
    updateContinueButton();
    titleScreen.classList.add('hidden');
    
    const runData = prepareNewRun((result) => {
        battleScreen.classList.add('hidden');
        mapScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        if (result.victory) Toast.fire({ icon: 'success', title: '🏆 恭喜通關！' });
        else Toast.fire({ icon: 'info', title: `到達第 ${result.floor} 層，再試一次吧！` });
        updateContinueButton();
    });
    
    if (!runData) {
        titleScreen.classList.remove('hidden');
        return;
    }
    
    newRunBaseDeck = runData.baseDeck;
    newRunEquippedCards = runData.equippedCards;
    
    showHeroSelectionScreen(newRunBaseDeck, newRunEquippedCards);
});

async function showHeroSelectionScreen(baseDeck, carryDeck) {
    const heroScreen = document.getElementById('hero-selection-screen');
    const deckContainer = document.getElementById('deck-reveal-container');
    const carryContainer = document.getElementById('carry-reveal-container');
    const carryTitle = document.getElementById('carry-reveal-title');
    const goBtn = document.getElementById('hero-go-btn');
    
    deckContainer.innerHTML = '';
    carryContainer.innerHTML = '';
    goBtn.classList.add('hidden');
    heroScreen.classList.remove('hidden');
    
    const [{ getAllWordCards, getCardRarity, RARITY_CONFIG }, { getCardArt }] = await Promise.all([
        import('./js/data.js'), import('./js/cardart.js')
    ]);
    const allCards = getAllWordCards();
    
    // 發牌動畫
    for (let i = 0; i < baseDeck.length; i++) {
        const c = allCards.find(card => card.id === baseDeck[i]);
        if (!c) continue;
        const rarityKey = getCardRarity(c);
        const art = getCardArt(c.id);
        
        const cardEl = document.createElement('div');
        cardEl.className = `de-card rarity-${rarityKey} deal-anim`;
        cardEl.innerHTML = `
            <div class="de-card-top" style="background:${RARITY_CONFIG[rarityKey].color}">
                <div class="de-card-cost">${c.cost !== undefined ? c.cost : '*'}</div>
                <div class="de-card-name">${c.en}</div>
            </div>
            <div class="de-card-art">${art}</div>
            <div class="de-card-desc"><span class="de-card-zh">${c.zh}</span><br>${c.desc.replace('{v}', c.value || 0)}</div>
        `;
        deckContainer.appendChild(cardEl);
        
        sfxDraw();
        
        await new Promise(r => setTimeout(r, 100));
    }
    
    if (carryDeck.length > 0) {
        carryTitle.classList.remove('hidden');
        carryDeck.forEach((id, i) => {
            const c = allCards.find(card => card.id === id);
            if (!c) return;
            const rarityKey = getCardRarity(c);
            const art = getCardArt(c.id);
            const cardEl = document.createElement('div');
            cardEl.className = `de-card rarity-${rarityKey} deal-anim`;
            cardEl.style.animationDelay = `${i * 0.1}s`;
            cardEl.innerHTML = `
                <div class="de-card-top" style="background:${RARITY_CONFIG[rarityKey].color}">
                    <div class="de-card-cost">${c.cost !== undefined ? c.cost : '*'}</div>
                    <div class="de-card-name">${c.en}</div>
                </div>
                <div class="de-card-art">${art}</div>
                <div class="de-card-desc"><span class="de-card-zh">${c.zh}</span><br>${c.desc.replace('{v}', c.value || 0)}</div>
            `;
            carryContainer.appendChild(cardEl);
        });
    } else {
        carryTitle.classList.add('hidden');
    }
    
    setTimeout(() => { goBtn.classList.remove('hidden'); }, 400);
}

document.querySelectorAll('.hero-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        sfxUI();
        document.querySelectorAll('.hero-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chosenHero = btn.dataset.hero;
    });
});

document.getElementById('hero-go-btn').addEventListener('click', () => {
    sfxUI();
    document.getElementById('hero-selection-screen').classList.add('hidden');
    confirmHeroAndStartMap(chosenHero, newRunBaseDeck, newRunEquippedCards);
});

document.getElementById('continue-btn').addEventListener('click', () => {
    sfxUI();
    titleScreen.classList.add('hidden');
    loadSavedRun((result) => {
        battleScreen.classList.add('hidden');
        mapScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        if (result.victory) Toast.fire({ icon: 'success', title: '🏆 恭喜通關！' });
        else Toast.fire({ icon: 'info', title: `到達第 ${result.floor} 層，再試一次吧！` });
        updateContinueButton();
    });
});

// ===== 地圖返回主畫面 =====
document.getElementById('map-home-btn').addEventListener('click', () => {
    sfxUI();
    mapScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
    Toast.fire({ icon: 'info', title: '進度已自動儲存' });
    updateContinueButton();
});

// ===== 結束回合 =====
document.getElementById('end-turn-btn').addEventListener('click', () => {
    import('./js/battle.js').then(({ endTurn }) => endTurn());
});

// ===== 離開戰鬥 =====
document.getElementById('quit-battle-btn').addEventListener('click', () => {
    sfxUI();
    Swal.fire({
        title: '確定要返回主畫面嗎？',
        text: '戰鬥進度將被保留，下次載入時會從「本場戰鬥一開始」重新開始！',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '確定返回',
        cancelButtonText: '繼續戰鬥',
        background: '#2d1b4e',
        color: '#fff',
        confirmButtonColor: '#3498db',
        cancelButtonColor: '#9b59b6',
    }).then(r => {
        if (r.isConfirmed) {
            // 隱藏所有可能開啟的 modal
            document.querySelectorAll('#quiz-modal, #battle-result-modal, #reward-modal, #rest-modal, #event-modal').forEach(m => m.classList.add('hidden'));
            battleScreen.classList.add('hidden');
            mapScreen.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            Toast.fire({ icon: 'info', title: '已儲存進度並保留至主畫面' });
            updateContinueButton();
        }
    });
});

// ===== 查看牌組（地圖上）=====
document.getElementById('view-deck-btn').addEventListener('click', () => {
    sfxUI();
    import('./js/map.js').then(({ getGameState }) => {
        const state = getGameState(); if (!state) return;
        Promise.all([import('./js/data.js'), import('./js/cardart.js')]).then(([d, a]) => {
            const allCards = d.getAllWordCards();
            const deckModal = document.getElementById('deck-modal');
            const container = deckModal.querySelector('.deck-cards');
            const counts = {};
            state.playerDeck.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
            container.innerHTML = Object.entries(counts).map(([id, count]) => {
                const card = allCards.find(c => c.id === id); if (!card) return '';
                const rarityKey = d.getCardRarity(card);
                const rarity = d.RARITY_CONFIG[rarityKey];
                return `<div class="de-card rarity-${rarityKey}" style="border-color:${rarity.color}; cursor:pointer" onclick="if(window.showCardDetail) window.showCardDetail('${card.id}')">
                    <div class="de-card-top" style="background:${rarity.color}">
                        <div class="de-card-cost">${card.cost}</div>
                        <div class="de-card-name">${card.en}</div>
                    </div>
                    <div class="de-card-art">${a.getCardArt(id)}</div>
                    <div class="de-card-desc">
                        <span class="de-card-zh">${card.zh}</span><br>
                        ${card.desc.replace('{v}', card.value)}
                    </div>
                    <div class="de-card-footer">x${count}</div>
                </div>`;
            }).join('');
            deckModal.classList.remove('hidden');
        });
    });
});
document.getElementById('close-deck-btn').addEventListener('click', () => { sfxUI(); document.getElementById('deck-modal').classList.add('hidden'); });

// ===== 家長設定 =====
document.getElementById('admin-btn').addEventListener('click', () => { sfxUI(); window.location.href = 'admin.html'; });

// ===== 重製進度與卡片 =====
document.getElementById('reset-btn').addEventListener('click', () => {
    sfxUI();
    Swal.fire({
        title: '⚠️ 確定要重製嗎？',
        html: `
            <div style="text-align:left;font-size:14px;line-height:2;color:#ddd">
                以下資料將<strong style="color:#e74c3c">永久清除</strong>，無法復原：<br>
                🗂️ 所有獲得的卡片（卡冊）<br>
                🎒 攜帶卡組設定<br>
                🗺️ 目前的關卡進度<br>
                <br>
                <span style="color:#a78bba;font-size:0.9em">
                ✅ 家長新增的自訂卡片、圖片與啟用設定<strong style="color:#2ecc71">不受影響</strong>
                </span>
            </div>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '🗑️ 確定清除',
        cancelButtonText: '取消',
        background: '#2d1b4e',
        color: '#fff',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#9b59b6',
    }).then(async r => {
        if (!r.isConfirmed) return;
        // 清除玩家資料（保留家長設定）
        cloudSet('vocabSpire_playerCollection', 'playerCollection', []);
        cloudSet('vocabSpire_playerDeckConfig', 'playerDeckConfig', []);
        cloudSet('vocabSpire_savedRun',         'savedRun',         null);
        updateContinueButton();
        Toast.fire({ icon: 'success', title: '✅ 已重製！可以重新開始冒險' });
    });
});

// ===== 編輯牌組（牌庫+牌組）=====
let tempDeck = [];
let tempCollection = [];

document.getElementById('deck-editor-btn').addEventListener('click', () => { sfxUI(); openDeckEditor(); });
document.getElementById('de-close-btn').addEventListener('click', () => { sfxUI(); document.getElementById('deck-editor-modal').classList.add('hidden'); });

document.getElementById('de-save-btn').addEventListener('click', () => {
    sfxUI();
    if (tempDeck.length === 0) { Toast.fire({ icon: 'warning', title: '牌組不能為空！' }); return; }
    import('./js/data.js').then(d => {
        d.savePlayerDeckConfig(tempDeck);
        cloudSet('vocabSpire_playerDeckConfig', 'playerDeckConfig', tempDeck);
        document.getElementById('deck-editor-modal').classList.add('hidden');
        Toast.fire({ icon: 'success', title: `💾 牌組已儲存！共 ${tempDeck.length} 張` });
    });
});


function openDeckEditor() {
    Promise.all([import('./js/data.js'), import('./js/cardart.js')]).then(([d, a]) => {
        const activeCards = d.getActiveWordCards();
        let collection = d.getPlayerCollection();
        let deckConfig = d.getPlayerDeckConfig();

        // First time: initialize collection + deck from STARTER_DECK (filtered to active)
        // 完全空的出戰設定，直接給空陣列
        if (deckConfig.length === 0) {
            deckConfig = [];
            d.savePlayerDeckConfig(deckConfig);
            cloudSet('vocabSpire_playerDeckConfig', 'playerDeckConfig', deckConfig);
        }

        // Ensure collection only contains active cards
        const activeIds = new Set(activeCards.map(c => c.id));
        collection = collection.filter(id => activeIds.has(id));
        deckConfig = deckConfig.filter(id => activeIds.has(id) && collection.includes(id));
        
        // 如果舊存檔帶入了超過 5 張卡，直接裁斷並修正存檔
        if (deckConfig.length > 5) {
            deckConfig = deckConfig.slice(0, 5);
            d.savePlayerDeckConfig(deckConfig);
            cloudSet('vocabSpire_playerDeckConfig', 'playerDeckConfig', deckConfig);
        }

        tempCollection = [...collection];
        tempDeck = [...deckConfig];

        renderDeckEditor();
        document.getElementById('deck-editor-modal').classList.remove('hidden');
    });
}

function renderDeckEditor() {
    Promise.all([import('./js/data.js'), import('./js/cardart.js')]).then(([d, a]) => {
        const allCards = d.getAllWordCards();
        const typeLabel = { attack: '⚔️', defend: '🛡️', skill: '✨', power: '💜' };

        // Deck cards (with counts)
        const deckCounts = {};
        tempDeck.forEach(id => { deckCounts[id] = (deckCounts[id] || 0) + 1; });

        const deckContainer = document.getElementById('de-deck-cards');
        const deckEntries = Object.entries(deckCounts);
        document.getElementById('de-deck-count').textContent = tempDeck.length;
        document.getElementById('de-deck-empty').classList.toggle('hidden', deckEntries.length > 0);

        deckContainer.innerHTML = deckEntries.map(([id, count]) => {
            const card = allCards.find(c => c.id === id); if (!card) return '';
            const rarityKey = d.getCardRarity(card);
            const rarity = d.RARITY_CONFIG[rarityKey];
            return `<div class="de-card rarity-${rarityKey}" data-id="${id}" data-action="remove" style="border-color:${rarity.color}">
                <div class="de-card-top" style="background:${rarity.color}">
                    <div class="de-card-cost">${card.cost}</div>
                    <div class="de-card-name">${card.en}</div>
                </div>
                <div class="de-card-art">${a.getCardArt(id)}</div>
                <div class="de-card-desc">
                    <span class="de-card-zh">${card.zh}</span><br>
                    ${card.desc.replace('{v}', card.value)}
                </div>
                <div class="de-card-footer">${typeLabel[card.type]} x${count} · 點擊移除</div>
                <button class="card-info-btn" data-id="${id}">🔍</button>
            </div>`;
        }).join('');

        // Collection cards (exclude those fully in deck)
        const collCounts = {};
        tempCollection.forEach(id => { collCounts[id] = (collCounts[id] || 0) + 1; });

        const collContainer = document.getElementById('de-coll-cards');
        const collEntries = Object.entries(collCounts);
        const notInDeckEntries = collEntries.map(([id, total]) => {
            const inDeck = deckCounts[id] || 0;
            return [id, total, total - inDeck]; // id, total in collection, available to add
        });
        document.getElementById('de-coll-count').textContent = tempCollection.length;

        const availableEntries = notInDeckEntries.filter(([, , avail]) => avail > 0);
        document.getElementById('de-coll-empty').classList.toggle('hidden', availableEntries.length > 0);

        collContainer.innerHTML = notInDeckEntries.map(([id, total, avail]) => {
            const card = allCards.find(c => c.id === id); if (!card) return '';
            const rarityKey = d.getCardRarity(card);
            const rarity = d.RARITY_CONFIG[rarityKey];
            const inDeckClass = avail <= 0 ? 'in-deck' : '';
            return `<div class="de-card ${inDeckClass} rarity-${rarityKey}" data-id="${id}" data-action="add" style="border-color:${rarity.color}">
                <div class="de-card-top" style="background:${rarity.color}">
                    <div class="de-card-cost">${card.cost}</div>
                    <div class="de-card-name">${card.en}</div>
                </div>
                <div class="de-card-art">${a.getCardArt(id)}</div>
                <div class="de-card-desc">
                    <span class="de-card-zh">${card.zh}</span><br>
                    ${card.desc.replace('{v}', card.value)}
                </div>
                <div class="de-card-footer">${typeLabel[card.type]} ${avail < total ? `${avail}/${total}` : `x${total}`}</div>
                <button class="card-info-btn" data-id="${id}">🔍</button>
            </div>`;
        }).join('');

        // Click handlers
        deckContainer.querySelectorAll('.de-card[data-action="remove"]').forEach(el => {
            el.addEventListener('click', () => {
                sfxUI();
                const idx = tempDeck.indexOf(el.dataset.id);
                if (idx >= 0) { tempDeck.splice(idx, 1); renderDeckEditor(); }
            });
        });
        collContainer.querySelectorAll('.de-card[data-action="add"]').forEach(el => {
            el.addEventListener('click', () => {
                sfxUI();
                if (tempDeck.length >= 5) {
                    alert('最多只能攜帶 5 張卡片出戰！');
                    return;
                }
                tempDeck.push(el.dataset.id);
                renderDeckEditor();
            });
        });

        // Info button handlers
        document.querySelectorAll('.card-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止氣泡事件避免直接裝備/卸下
                window.showCardDetail(btn.dataset.id);
            });
        });
    });
}

// ===== 顯示卡冊 =====
document.getElementById('album-btn').addEventListener('click', () => {
    sfxUI();
    Promise.all([import('./js/data.js'), import('./js/cardart.js')]).then(([d, a]) => {
        const modal = document.getElementById('deck-modal');
        const container = modal.querySelector('.deck-cards');
        const title = modal.querySelector('.deck-title');
        const collection = d.getPlayerCollection();
        
        title.innerHTML = `📖 我的卡冊收藏 (${collection.length}張)`;
        
        if (collection.length === 0) {
            container.innerHTML = '<div style="text-align:center;width:100%;padding:40px;color:#888;">收集冊空空如也...<br>請進入冒險地圖打敗怪物來獲得卡片！</div>';
        } else {
            // Count cards to show stacks
            const collCounts = {};
            collection.forEach(id => { collCounts[id] = (collCounts[id] || 0) + 1; });
            const allCards = d.getAllWordCards();
            
            container.innerHTML = Object.entries(collCounts).map(([cardId, count]) => {
                const card = allCards.find(c => c.id === cardId);
                if (!card) return '';
                const rarityKey = d.getCardRarity(card);
                const rarity = d.RARITY_CONFIG[rarityKey];
                const art = a.getCardArt(card.id);
                // 使用 de-card 樣式
                return `
                    <div class="de-card rarity-${rarityKey}" style="border-color:${rarity.color}">
                        <div class="de-card-top" style="background:${rarity.color}">
                            <div class="de-card-cost">${card.cost !== undefined ? card.cost : '*'}</div>
                            <div class="de-card-name">${card.en}</div>
                        </div>
                        <div class="de-card-art">${art}</div>
                        <div class="de-card-desc">
                            <span class="de-card-zh">${card.zh}</span><br>
                            ${card.desc.replace('{v}', card.value || 0)}
                        </div>
                        <div class="de-card-footer">收藏 x${count}</div>
                        <button class="card-info-btn" data-id="${card.id}">🔍</button>
                    </div>`;
            }).join('');
            
            // 綁定卡冊內的 🔍 按鈕事件
            setTimeout(() => {
                container.querySelectorAll('.card-info-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.showCardDetail(btn.dataset.id);
                    });
                });
            }, 0);
        }
        
        modal.classList.remove('hidden');
    });
});

// ===== 說明 =====
document.getElementById('help-btn').addEventListener('click', () => {
    sfxUI();
    Swal.fire({
        title: '📖 遊戲說明', html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">
            <p><b>🎯 遊戲目標</b>：挑戰單字問答，從第 1 層打通到第 10 層！</p>
            <p><b>🃏 戰鬥卡牌</b>：每場冒險的起始牌組為「<b>10張隨機分配點數牌</b>」加上您的「<b>攜帶卡片</b>」。</p>
            <p><b>🎒 攜帶卡片</b>：戰鬥勝利後可獲得新卡片收藏，開局前最多可挑選 <b>5張</b> 珍藏卡牌裝備出戰！</p>
            <p><b>📖 我的卡冊</b>：可以在首頁隨時檢視您努力打倒怪物所收集到的所有單字卡戰利品。</p>
            <p><b>📝 戰鬥答題</b>：出牌需通過英文問答（聽音選拼字 + 選中文意思），防禦牌可疊加護甲抵禦怪物攻擊！</p>
            <p><b>⚔️ 攻擊(紅)</b>：造成傷害 | <b>🛡️ 防禦(藍)</b>：獲得護甲</p>
            <p><b>✨ 技能(綠)</b>：特殊效果 | <b>💜 能力(紫)</b>：本場增益</p>
        </div>`,
        background: '#2d1b4e', color: '#fff', confirmButtonText: '準備出發！', confirmButtonColor: '#9b59b6',
    });
});

// ===== 全域卡牌檢視器與發音功能 =====
let currentDetailTTS = null;
window.showCardDetail = function(cardId) {
    Promise.all([
        import('./js/data.js'), 
        import('./js/cardart.js'),
        import('./js/speech.js')
    ]).then(([d, a, s]) => {
        const card = d.getAllWordCards().find(c => c.id === cardId);
        if (!card) return;

        const rarityKey = d.getCardRarity(card);
        const rarity = d.RARITY_CONFIG[rarityKey];
        const typeLabel = { attack: '⚔️ 攻擊', defend: '🛡️ 防禦', skill: '✨ 技能', power: '💜 能力' }[card.type];

        // 綁定資料
        document.getElementById('card-detail-en').textContent = card.en;
        document.getElementById('card-detail-zh').textContent = card.zh;
        document.getElementById('card-detail-art').innerHTML = a.getCardArt(card.id);
        document.getElementById('card-detail-type').textContent = typeLabel;
        document.getElementById('card-detail-cost').textContent = `⚡ ${card.cost}`;
        document.getElementById('card-detail-rarity').textContent = rarity.label;
        document.getElementById('card-detail-rarity').style.color = rarity.color;
        document.getElementById('card-detail-desc').innerHTML = card.desc.replace('{v}', `<b>${card.value}</b>`);

        // 外框顏色設定
        document.getElementById('card-detail-container').style.borderColor = rarity.color;
        document.getElementById('card-detail-container').style.boxShadow = `0 10px 40px ${rarity.color}44`; // 帶有顏色的光暈

        // 發音按鈕邏輯
        const ttsBtn = document.getElementById('card-detail-tts-btn');
        const newTtsBtn = ttsBtn.cloneNode(true);
        ttsBtn.parentNode.replaceChild(newTtsBtn, ttsBtn); // 移除舊的 event listener
        
        newTtsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            s.speakWord(card.en);
        });

        // 打開視窗
        document.getElementById('card-detail-modal').classList.remove('hidden');
    });
};

// 關閉檢視器邏輯
const detailModal = document.getElementById('card-detail-modal');
const closeDetailBtn = document.getElementById('card-detail-close-btn');

function closeDetail() {
    detailModal.classList.add('hidden');
}

closeDetailBtn.addEventListener('click', () => { sfxUI(); closeDetail(); });
detailModal.addEventListener('click', (e) => {
    // 若點擊在背景黑底而非內容區，則關閉
    if (e.target === detailModal) closeDetail();
});

// ===== 設定 Modal =====
function openSettings() {
    sfxUI();
    // 讀取目前音量值並更新滑桿
    const sfxVal = Math.round(getSfxVolume() * 100);
    const voiceVal = Math.round(getVoiceVolume() * 100);
    const sfxSlider = document.getElementById('sfx-volume-slider');
    const voiceSlider = document.getElementById('voice-volume-slider');
    sfxSlider.value = sfxVal;
    voiceSlider.value = voiceVal;
    document.getElementById('sfx-volume-display').textContent = sfxVal + '%';
    document.getElementById('voice-volume-display').textContent = voiceVal + '%';
    updateSliderTrack(sfxSlider);
    updateSliderTrack(voiceSlider);

    // 顯示/隱藏帳號區塊
    const user = getUser();
    document.getElementById('settings-account-section').classList.toggle('hidden', !user);

    document.getElementById('settings-modal').classList.remove('hidden');
}

function updateSliderTrack(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #9b59b6 ${pct}%, #4a235a ${pct}%)`;
}

document.getElementById('settings-btn').addEventListener('click', openSettings);

document.getElementById('settings-close-btn').addEventListener('click', () => {
    sfxUI();
    document.getElementById('settings-modal').classList.add('hidden');
});

document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-modal')) {
        sfxUI();
        document.getElementById('settings-modal').classList.add('hidden');
    }
});

// 音效音量滑桿
document.getElementById('sfx-volume-slider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value) / 100;
    setSfxVolume(val);
    document.getElementById('sfx-volume-display').textContent = e.target.value + '%';
    updateSliderTrack(e.target);
    sfxUI(); // 試聽
});

// 語音音量滑桿
document.getElementById('voice-volume-slider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value) / 100;
    setVoiceVolume(val);
    document.getElementById('voice-volume-display').textContent = e.target.value + '%';
    updateSliderTrack(e.target);
});

// 設定內的重製進度按鈕（重用已有邏輯）
document.getElementById('settings-reset-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('reset-btn').click();
});

// 變更密碼（寄送重設信）
document.getElementById('settings-change-pw-btn').addEventListener('click', async () => {
    sfxUI();
    const user = getUser();
    if (!user) return;
    Swal.fire({
        title: '🔑 變更密碼',
        html: `<div style="font-size:14px;color:#ddd;line-height:1.8">
            將寄送密碼重設信到：<br>
            <strong style="color:#f1c40f">${user.email}</strong><br>
            <span style="color:#888;font-size:0.9em">請至信箱點擊連結完成重設</span>
        </div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '📧 寄送重設信',
        cancelButtonText: '取消',
        background: '#2d1b4e', color: '#fff',
        confirmButtonColor: '#9b59b6', cancelButtonColor: '#555',
    }).then(async r => {
        if (!r.isConfirmed) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            Toast.fire({ icon: 'success', title: '✅ 重設信已寄出！請查看信箱' });
        } catch {
            Toast.fire({ icon: 'error', title: '寄送失敗，請稍後再試' });
        }
    });
});

// 刪除帳號
document.getElementById('settings-delete-account-btn').addEventListener('click', async () => {
    sfxUI();
    const user = getUser();
    if (!user) return;

    const { value: password } = await Swal.fire({
        title: '❌ 刪除帳號',
        html: `<div style="font-size:14px;color:#ddd;line-height:1.8;margin-bottom:12px">
            此操作將<strong style="color:#e74c3c">永久刪除</strong>您的帳號及所有雲端資料，<br>且<strong style="color:#e74c3c">無法復原</strong>。<br>
            <span style="color:#888;font-size:0.9em">請輸入密碼確認身分</span>
        </div>
        <input id="swal-del-pw" type="password" class="swal2-input" placeholder="輸入您的密碼"
            style="background:#1a0a2e;color:#fff;border:1px solid #e74c3c">`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確認刪除',
        cancelButtonText: '取消',
        background: '#2d1b4e', color: '#fff',
        confirmButtonColor: '#e74c3c', cancelButtonColor: '#555',
        preConfirm: () => {
            const pw = document.getElementById('swal-del-pw').value;
            if (!pw) { Swal.showValidationMessage('請輸入密碼'); return false; }
            return pw;
        }
    });

    if (!password) return;

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        Toast.fire({ icon: 'success', title: '帳號已刪除' });
        document.getElementById('settings-modal').classList.add('hidden');
    } catch (err) {
        const msg = {
            'auth/wrong-password': '密碼錯誤，請重新輸入',
            'auth/invalid-credential': '密碼錯誤，請重新輸入',
            'auth/too-many-requests': '嘗試次數過多，請稍後再試',
        }[err.code] || '操作失敗，請稍後再試';
        Toast.fire({ icon: 'error', title: msg });
    }
});
