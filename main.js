import { startNewRun, showMap } from './js/map.js';
import { initAuthUI } from './js/auth.js';

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#2d1b4e', color: '#fff' });

// 初始化帳號系統
initAuthUI();

const titleScreen = document.getElementById('title-screen');
const mapScreen = document.getElementById('map-screen');
const battleScreen = document.getElementById('battle-screen');

// ===== 開始遊戲 =====
document.getElementById('start-btn').addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    startNewRun((result) => {
        battleScreen.classList.add('hidden');
        mapScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        if (result.victory) Toast.fire({ icon: 'success', title: '🏆 恭喜通關！' });
        else Toast.fire({ icon: 'info', title: `到達第 ${result.floor} 層，再試一次吧！` });
    });
});

// ===== 結束回合 =====
document.getElementById('end-turn-btn').addEventListener('click', () => {
    import('./js/battle.js').then(({ endTurn }) => endTurn());
});

// ===== 離開戰鬥 =====
document.getElementById('quit-battle-btn').addEventListener('click', () => {
    Swal.fire({
        title: '確定要離開嗎？',
        text: '本次冒險進度將會失去！',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定離開',
        cancelButtonText: '繼續戰鬥',
        background: '#2d1b4e',
        color: '#fff',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#9b59b6',
    }).then(r => {
        if (r.isConfirmed) {
            // 隱藏所有可能開啟的 modal
            document.querySelectorAll('#quiz-modal, #battle-result-modal, #reward-modal, #rest-modal, #event-modal').forEach(m => m.classList.add('hidden'));
            battleScreen.classList.add('hidden');
            mapScreen.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            Toast.fire({ icon: 'info', title: '已離開冒險' });
        }
    });
});

// ===== 查看牌組（地圖上）=====
document.getElementById('view-deck-btn').addEventListener('click', () => {
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
                return `<div class="deck-card rarity-${rarityKey}" style="border-color:${rarity.color}" onclick="if(window.showCardDetail) window.showCardDetail('${card.id}')">
                    <div class="card-art" style="width:40px;height:28px">${a.getCardArt(id)}</div>
                    <span class="card-name">${card.en} (${card.zh})</span><span class="card-count">x${count}</span></div>`;
            }).join('');
            deckModal.classList.remove('hidden');
        });
    });
});
document.getElementById('close-deck-btn').addEventListener('click', () => { document.getElementById('deck-modal').classList.add('hidden'); });

// ===== 家長設定 =====
document.getElementById('admin-btn').addEventListener('click', () => { window.location.href = 'admin.html'; });

// ===== 編輯牌組（牌庫+牌組）=====
let tempDeck = [];
let tempCollection = [];

document.getElementById('deck-editor-btn').addEventListener('click', openDeckEditor);
document.getElementById('de-close-btn').addEventListener('click', () => { document.getElementById('deck-editor-modal').classList.add('hidden'); });

document.getElementById('de-save-btn').addEventListener('click', () => {
    if (tempDeck.length === 0) { Toast.fire({ icon: 'warning', title: '牌組不能為空！' }); return; }
    import('./js/data.js').then(d => {
        d.savePlayerDeckConfig(tempDeck);
        document.getElementById('deck-editor-modal').classList.add('hidden');
        Toast.fire({ icon: 'success', title: `💾 牌組已儲存！共 ${tempDeck.length} 張` });
    });
});

document.getElementById('de-reset-btn').addEventListener('click', () => {
    tempDeck = [...tempCollection];
    renderDeckEditor();
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
        }

        // Ensure collection only contains active cards
        const activeIds = new Set(activeCards.map(c => c.id));
        collection = collection.filter(id => activeIds.has(id));
        deckConfig = deckConfig.filter(id => activeIds.has(id) && collection.includes(id));
        
        // 如果舊存檔帶入了超過 5 張卡，直接裁斷並修正存檔
        if (deckConfig.length > 5) {
            deckConfig = deckConfig.slice(0, 5);
            d.savePlayerDeckConfig(deckConfig);
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
                <button class="card-info-btn" data-id="${id}">🔍</button>
                <div class="de-art">${a.getCardArt(id)}</div>
                <div class="de-name">${typeLabel[card.type]} x${count}</div>
                <div class="de-desc">${card.desc.replace('{v}', card.value)}</div>
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
                <button class="card-info-btn" data-id="${id}">🔍</button>
                <div class="de-art">${a.getCardArt(id)}</div>
                <div class="de-name">${typeLabel[card.type]} ${avail < total ? `(${avail}/${total})` : `x${total}`}</div>
                <div class="de-desc">${card.desc.replace('{v}', card.value)}</div>
            </div>`;
        }).join('');

        // Click handlers
        deckContainer.querySelectorAll('.de-card[data-action="remove"]').forEach(el => {
            el.addEventListener('click', () => {
                const idx = tempDeck.indexOf(el.dataset.id);
                if (idx >= 0) { tempDeck.splice(idx, 1); renderDeckEditor(); }
            });
        });
        collContainer.querySelectorAll('.de-card[data-action="add"]').forEach(el => {
            el.addEventListener('click', () => {
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
                return `<div class="deck-card rarity-${rarityKey}" style="border-color:${rarity.color}" onclick="window.showCardDetail('${card.id}')">
                            <div class="card-art" style="width:40px;height:28px">${art}</div>
                            <span class="card-name">${card.en} (${card.zh}) x${count}</span>
                        </div>`;
            }).join('');
        }
        
        modal.classList.remove('hidden');
    });
});

// ===== 說明 =====
document.getElementById('help-btn').addEventListener('click', () => {
    Swal.fire({
        title: '📖 遊戲說明', html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">
            <p><b>🎯 遊戲目標</b>：挑戰單字問答，從第 1 層打通到第 10 層！</p>
            <p><b>🃏 戰鬥卡牌</b>：每場冒險的起始牌組為「<b>10張隨機分配點數牌</b>」加上您的「<b>攜帶卡片</b>」。</p>
            <p><b>🎒 攜帶卡片</b>：戰鬥勝利後可獲得新卡片收藏，開局前最多可挑選 <b>5張</b> 珍藏卡牌裝備出戰！</p>
            <p><b>📖 我的卡冊</b>：可以在首頁隨時檢視您努力打倒怪物所收集到的所有單字卡戰利品。</p>
            <p><b>📝 戰鬥答題</b>：出牌需通過英文問答（聽音選拼字 + 選中文意思），防禦牌可疊加護甲抵禦怪物攻擊！</p>
            <p><b>⚔️ 攻擊(紅)</b>：造成傷害 | <b>🛡️ 防禦(藍)</b>：獲得護甲</p>
            <p><b>✨ 技能(綠)</b>：特殊效果 | <b>💜 能力(紫)</b>：整場永久增益</p>
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

closeDetailBtn.addEventListener('click', closeDetail);
detailModal.addEventListener('click', (e) => {
    // 若點擊在背景黑底而非內容區，則關閉
    if (e.target === detailModal) closeDetail();
});
