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
                return `<div class="deck-card rarity-${rarityKey}" style="border-color:${rarity.color}">
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
    if (tempDeck.length < 8) { Toast.fire({ icon: 'warning', title: '牌組至少需要8張卡！' }); return; }
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
        if (collection.length === 0) {
            collection = d.STARTER_DECK.filter(id => activeCards.some(c => c.id === id));
            d.savePlayerCollection(collection);
        }
        if (deckConfig.length === 0) {
            deckConfig = [...collection];
            d.savePlayerDeckConfig(deckConfig);
        }

        // Ensure collection only contains active cards
        const activeIds = new Set(activeCards.map(c => c.id));
        collection = collection.filter(id => activeIds.has(id));
        deckConfig = deckConfig.filter(id => activeIds.has(id) && collection.includes(id));

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
                tempDeck.push(el.dataset.id);
                renderDeckEditor();
            });
        });
    });
}

// ===== 說明 =====
document.getElementById('help-btn').addEventListener('click', () => {
    Swal.fire({
        title: '📖 遊戲說明', html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">
            <p><b>🎯 目標</b>：從第1層打到第10層！</p>
            <p><b>🃏 編輯牌組</b>：在開始前可以編輯你的牌組！</p>
            <p><b>📝 答題</b>：出牌需通過英文問答（聽音選拼字+選中文意思）</p>
            <p><b>⚡ 防禦答題</b>：敵人攻擊時答對可減傷！</p>
            <p><b>⚔️ 攻擊</b>：紅色牌造成傷害 | <b>🛡️ 防禦</b>：藍色牌獲得護甲</p>
            <p><b>✨ 技能</b>：綠色牌特殊效果 | <b>💜 能力</b>：紫色牌永久增益</p>
            <p><b>🏕️ 休息</b>：回復HP | <b>🎁 獎勵</b>：勝利後選擇新卡牌</p>
        </div>`,
        background: '#2d1b4e', color: '#fff', confirmButtonText: '知道了！', confirmButtonColor: '#9b59b6',
    });
});
