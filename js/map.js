import { FLOOR_CONFIG, GAME_CONSTANTS, STARTER_DECK, ENEMIES, WORD_CARDS, getAllWordCards, getActiveWordCards, getPlayerCollection, savePlayerCollection, getPlayerDeckConfig, savePlayerDeckConfig, getCardRarity, RARITY_CONFIG } from './data.js';
import { initBattle, showCardReward } from './battle.js';
import { getCardArt } from './cardart.js';
import { cloudGet, cloudSet } from './cloud-save.js';

let gameState = null;
let onGameOver = null;
let mapData = null; // 分岔地圖資料

// ===== 節點類型 =====
const NODE_TYPES = {
    BATTLE: 'battle',
    REST: 'rest',
    MYSTERY: 'mystery', // 顯示為 ❓
    BOSS: 'boss',
};

// 未知事件類型
const MYSTERY_EVENTS = ['card_reward', 'card_remove', 'merchant', 'blessing'];

// ===== 產生分岔地圖 =====
function generateMap(totalFloors) {
    const map = [];

    // 第1層固定1個戰鬥
    map.push([{ id: '0-0', type: NODE_TYPES.BATTLE, col: 1, connections: [] }]);

    // 中間層：2-4 節點，分分合合
    for (let floor = 1; floor < totalFloors - 1; floor++) {
        const numNodes = floor === totalFloors - 2 ? 2 : Math.min(2 + Math.floor(Math.random() * 3), 4); // 2-4
        const row = [];
        for (let col = 0; col < numNodes; col++) {
            let type;
            // 每3層左右安排休息，BOSS前一層安排休息
            if (floor === totalFloors - 2) {
                type = col === 0 ? NODE_TYPES.REST : NODE_TYPES.MYSTERY;
            } else if (floor % 3 === 2 && col === 0) {
                type = NODE_TYPES.REST;
            } else if (Math.random() < 0.35) {
                type = NODE_TYPES.MYSTERY;
            } else {
                type = NODE_TYPES.BATTLE;
            }
            row.push({ id: `${floor}-${col}`, type, col, connections: [] });
        }
        map.push(row);
    }

    // 最後一層：BOSS
    map.push([{ id: `${totalFloors - 1}-0`, type: NODE_TYPES.BOSS, col: 1, connections: [] }]);

    // 建立連線（每個節點連到下一層的 1-2 個節點）
    for (let floor = 0; floor < map.length - 1; floor++) {
        const currentRow = map[floor];
        const nextRow = map[floor + 1];

        // 確保每個當前節點至少有一個連線
        currentRow.forEach((node, ci) => {
            // 計算最近的下一層節點
            const ratio = nextRow.length === 1 ? 0 : ci / Math.max(currentRow.length - 1, 1);
            const targetIdx = Math.round(ratio * (nextRow.length - 1));
            node.connections.push(nextRow[targetIdx].id);

            // 有機率連到相鄰節點（分岔）
            if (targetIdx > 0 && Math.random() < 0.4) {
                node.connections.push(nextRow[targetIdx - 1].id);
            }
            if (targetIdx < nextRow.length - 1 && Math.random() < 0.4) {
                node.connections.push(nextRow[targetIdx + 1].id);
            }

            // 去重
            node.connections = [...new Set(node.connections)];
        });

        // 確保下一層每個節點至少被一個連到
        nextRow.forEach(nextNode => {
            const hasIncoming = currentRow.some(n => n.connections.includes(nextNode.id));
            if (!hasIncoming) {
                // 找最近的上層節點連過來
                const closestIdx = currentRow.reduce((best, n, i) =>
                    Math.abs(n.col - nextNode.col) < Math.abs(currentRow[best].col - nextNode.col) ? i : best, 0);
                currentRow[closestIdx].connections.push(nextNode.id);
            }
        });
    }

    return map;
}

// ===== 準備新遊戲 =====
export function prepareNewRun(callback) {
    onGameOver = callback;

    let deckConfig = getPlayerDeckConfig();
    const activeCards = getActiveWordCards();
    const activeIds = new Set(activeCards.map(c => c.id));

    // 1. 基底 10 張隨機卡
    const baseDeck = generateRandomBalancedDeck(activeIds);
    
    // 2. 玩家自備的攜帶卡 (最多 5 張，且必須有啟用的)
    let equippedCards = deckConfig.filter(id => activeIds.has(id));
    if (equippedCards.length > 5) equippedCards = equippedCards.slice(0, 5);
    
    return { baseDeck, equippedCards };
}

// ===== 確認英雄並開始產生地圖 =====
export function confirmHeroAndStartMap(heroEmoji, baseDeck, equippedCards) {
    const startingDeck = [...baseDeck, ...equippedCards];
    mapData = generateMap(FLOOR_CONFIG.length);

    gameState = {
        currentFloor: -1,
        currentNodeId: null,
        visitedNodes: new Set(),
        maxFloor: FLOOR_CONFIG.length,
        playerHp: GAME_CONSTANTS.STARTING_HP,
        playerMaxHp: GAME_CONSTANTS.MAX_HP,
        playerGold: 30,
        playerDeck: startingDeck,
        playerBuffs: { strength: 0, regen: 0, thorns: 0, blockRegen: 0 },
        newCardIds: [],
        inBattle: false,
        playerEmoji: heroEmoji,
    };
    saveRunState();
    document.querySelector('.player-sprite').textContent = gameState.playerEmoji;
    showMap();
}

export function saveRunState() {
    if (!gameState || !mapData) return;
    const saveObj = {
        gameState: { ...gameState, visitedNodes: Array.from(gameState.visitedNodes) },
        mapData: mapData
    };
    cloudSet('vocabSpire_savedRun', 'savedRun', saveObj);
}

export function loadSavedRun(battleEndCallback) {
    onGameOver = battleEndCallback;
    const save = cloudGet('vocabSpire_savedRun', 'savedRun');
    if (!save) return;
    
    gameState = save.gameState;
    gameState.visitedNodes = new Set(gameState.visitedNodes);
    mapData = save.mapData;
    
    // 如果舊存檔沒有 emoji，給預設
    if (!gameState.playerEmoji) gameState.playerEmoji = '🦸‍♂️';
    
    document.getElementById('title-screen').classList.add('hidden');
    document.querySelector('.player-sprite').textContent = gameState.playerEmoji;
    
    if (gameState.inBattle) {
        if (save.battleState) {
            document.getElementById('map-screen').classList.add('hidden');
            document.getElementById('battle-screen').classList.remove('hidden');
            import('./battle.js').then(b => {
                b.restoreBattle(save.battleState, onGameOver);
            });
        } else {
            // 如果在戰鬥中退出但沒存到狀態（舊版存檔），強制重新進入該場戰鬥
            enterBattle(gameState.currentFloor + 1);
        }
    } else {
        showMap();
    }
}

// ===== 產生隨機起手牌組 (家長未設定時) =====
function generateRandomBalancedDeck(activeIds) {
    const all = getAllWordCards().filter(c => activeIds.has(c.id));
    const attacks = shuffleArray(all.filter(c => c.type === 'attack'));
    const defends = shuffleArray(all.filter(c => c.type === 'defend'));
    const skills = shuffleArray(all.filter(c => c.type === 'skill'));
    const powers = shuffleArray(all.filter(c => c.type === 'power'));

    // 如果單卡池不足，回退回硬生生的 STARTER_DECK
    if (attacks.length < 2 || defends.length < 2) return STARTER_DECK.slice(0, 10);

    const deck = [];

    // 試著抽 4攻, 4防, 1技能, 1能力 (如果數量不夠就盡可能拿滿)
    const attackCount = Math.min(attacks.length, 4);
    const defendCount = Math.min(defends.length, 4);
    const skillCount = Math.min(skills.length, 1);
    const powerCount = Math.min(powers.length, 1);

    for(let i=0; i<attackCount; i++) deck.push(attacks[i].id);
    for(let i=0; i<defendCount; i++) deck.push(defends[i].id);
    for(let i=0; i<skillCount; i++) deck.push(skills[i].id);
    for(let i=0; i<powerCount; i++) deck.push(powers[i].id);
    
    // 如果因為某些類型卡不足 10 張，補不重複的卡進去湊滿 10 張
    const missing = 10 - deck.length;
    if (missing > 0) {
        const remaining = shuffleArray(all.filter(c => !deck.includes(c.id)));
        for(let i=0; i<Math.min(missing, remaining.length); i++) deck.push(remaining[i].id);
    }
    
    return deck;
}

// ===== 取得可點擊的下一層節點 =====
function getAvailableNodes() {
    if (gameState.currentFloor === -1) {
        return mapData[0]; // 第一層
    }
    const currentRow = mapData[gameState.currentFloor];
    const currentNode = currentRow.find(n => n.id === gameState.currentNodeId);
    if (!currentNode) return [];
    const nextFloor = gameState.currentFloor + 1;
    if (nextFloor >= mapData.length) return [];
    return mapData[nextFloor].filter(n => currentNode.connections.includes(n.id));
}

// ===== 地圖畫面 =====
export function showMap() {
    const s = gameState;
    const mapScreen = document.getElementById('map-screen');
    const battleScreen = document.getElementById('battle-screen');
    battleScreen.classList.add('hidden');
    mapScreen.classList.remove('hidden');

    document.getElementById('map-hp').textContent = `❤️ ${s.playerHp}/${s.playerMaxHp}`;
    document.getElementById('map-gold').textContent = `💰 ${s.playerGold}`;
    const newSize = gameState.playerDeck.length;
    document.getElementById('map-deck-count').textContent = `📚 ${newSize} 張牌`;

    const nodesEl = document.getElementById('map-nodes');
    nodesEl.innerHTML = '';

    const availableIds = new Set(getAvailableNodes().map(n => n.id));

    // 從最後一層往上畫（底部是第1層）
    for (let floor = mapData.length - 1; floor >= 0; floor--) {
        const row = mapData[floor];
        const rowEl = document.createElement('div');
        rowEl.className = 'map-row';

        // 連線 SVG
        if (floor < mapData.length - 1) {
            const connEl = document.createElement('div');
            connEl.className = 'map-connectors';
            const nextRow = mapData[floor + 1];
            row.forEach(node => {
                node.connections.forEach(targetId => {
                    const target = nextRow.find(n => n.id === targetId);
                    if (!target) return;
                    const line = document.createElement('div');
                    line.className = 'map-line';
                    const fromPct = (node.col + 0.5) / Math.max(row.length, 1) * 100;
                    const toPct = (target.col + 0.5) / Math.max(nextRow.length, 1) * 100;
                    line.style.cssText = `left:${Math.min(fromPct,toPct)}%;width:${Math.abs(toPct-fromPct) || 2}%;`;
                    if (s.visitedNodes.has(node.id) && s.visitedNodes.has(targetId)) line.classList.add('visited');
                    connEl.appendChild(line);
                });
            });
            nodesEl.appendChild(connEl);
        }

        row.forEach(node => {
            const isVisited = s.visitedNodes.has(node.id);
            const isAvailable = availableIds.has(node.id);
            const isCurrent = node.id === s.currentNodeId;

            let emoji, label;
            switch (node.type) {
                case NODE_TYPES.BOSS:
                    emoji = '🐉'; label = 'BOSS'; break;
                case NODE_TYPES.REST:
                    emoji = '🏕️'; label = '休息'; break;
                case NODE_TYPES.MYSTERY:
                    emoji = '❓'; label = '未知'; break;
                default: {
                    const config = FLOOR_CONFIG[Math.min(floor, FLOOR_CONFIG.length - 1)];
                    const enemyKey = config.enemies[Math.floor(Math.random() * config.enemies.length)];
                    emoji = ENEMIES[enemyKey]?.emoji || '⚔️';
                    label = '戰鬥';
                }
            }

            const nodeEl = document.createElement('div');
            nodeEl.className = `map-node${isVisited ? ' completed' : ''}${isAvailable ? ' current' : ''}${isCurrent ? ' active' : ''}${node.type === 'boss' ? ' boss' : ''}`;
            nodeEl.innerHTML = `
                <div class="node-emoji">${isVisited ? '✅' : emoji}</div>
                <div class="node-type">F${floor + 1} ${label}</div>
            `;

            if (isAvailable && !isVisited) {
                nodeEl.addEventListener('click', () => selectNode(node, floor));
            }

            rowEl.appendChild(nodeEl);
        });

        nodesEl.appendChild(rowEl);
    }
}

// ===== 選擇節點 =====
function selectNode(node, floor) {
    gameState.currentFloor = floor;
    gameState.currentNodeId = node.id;
    gameState.visitedNodes.add(node.id);
    saveRunState();

    switch (node.type) {
        case NODE_TYPES.BATTLE:
        case NODE_TYPES.BOSS:
            enterBattle(floor + 1);
            break;
        case NODE_TYPES.REST:
            showRestScreen(floor + 1);
            break;
        case NODE_TYPES.MYSTERY:
            triggerMysteryEvent(floor + 1);
            break;
    }
}

// ===== 未知事件 =====
function triggerMysteryEvent(floor) {
    const event = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
    switch (event) {
        case 'card_reward': showMysteryCardReward(floor); break;
        case 'card_remove': showCardRemoveEvent(); break;
        case 'merchant': showMerchantEvent(floor); break;
        case 'blessing': showBlessingEvent(); break;
    }
}

// --- 卡牌獎勵事件 ---
function showMysteryCardReward(floor) {
    const vocabDiff = FLOOR_CONFIG[Math.min(floor - 1, FLOOR_CONFIG.length - 1)].vocabDifficulty;
    showEventModal('🃏 卡牌寶箱', '你發現了一個寶箱！選一張新卡加入牌組。', () => {
        showCardReward(gameState.playerDeck, vocabDiff, (cardId) => {
            if (cardId) {
                gameState.playerDeck.push(cardId);
                gameState.newCardIds.push(cardId);
                const coll = getPlayerCollection(); coll.push(cardId); savePlayerCollection(coll);
                cloudSet('vocabSpire_playerCollection', 'playerCollection', coll);
                saveRunState();
            }
            showMap();
        });
    });
}

// --- 刪除卡牌事件 ---
function showCardRemoveEvent() {
    const modal = document.getElementById('event-modal');
    const allCards = getAllWordCards();
    modal.querySelector('.event-title').textContent = '🗑️ 淨化祭壇';
    modal.querySelector('.event-desc').textContent = '點擊卡牌查看詳情，點「移除」才會從牌組中永久刪除。';
    const bodyEl = modal.querySelector('.event-body');

    const counts = {};
    gameState.playerDeck.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

    bodyEl.innerHTML = '<div class="event-cards-grid">' + Object.entries(counts).map(([id, count]) => {
        const card = allCards.find(c => c.id === id);
        if (!card) return '';
        const rarityKey = getCardRarity(card);
        const rarity = RARITY_CONFIG[rarityKey];
        const art = getCardArt(id);
        return `<div class="de-card rarity-${rarityKey} event-selectable-card" data-id="${id}" style="border-color:${rarity.color}; cursor:pointer">
            <div class="de-card-top" style="background:${rarity.color}">
                <div class="de-card-cost">${card.cost}</div>
                <div class="de-card-name">${card.en}</div>
            </div>
            <div class="de-card-art">${art}</div>
            <div class="de-card-desc"><span class="de-card-zh">${card.zh}</span><br>${card.desc.replace('{v}', card.value || 0)}</div>
            <div class="de-card-footer">x${count}</div>
            <button class="event-remove-confirm-btn" data-id="${id}">🗑️ 移除</button>
        </div>`;
    }).join('') + '</div>';

    bodyEl.innerHTML += '<button class="event-skip-btn" style="margin-top:12px">⏭️ 跳過不刪</button>';
    modal.classList.remove('hidden');

    // 點卡牌本體 → 查看詳情
    bodyEl.querySelectorAll('.event-selectable-card').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.event-remove-confirm-btn')) return;
            if (window.showCardDetail) window.showCardDetail(el.dataset.id);
        });
    });

    // 只有點「移除」按鈕才刪除
    bodyEl.querySelectorAll('.event-remove-confirm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = gameState.playerDeck.indexOf(btn.dataset.id);
            if (idx >= 0) { gameState.playerDeck.splice(idx, 1); saveRunState(); }
            modal.classList.add('hidden');
            showMap();
        });
    });

    bodyEl.querySelector('.event-skip-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
        showMap();
    });
}

// --- 商人事件 ---
function showMerchantEvent(floor) {
    const modal = document.getElementById('event-modal');
    const descEl = modal.querySelector('.event-desc');
    modal.querySelector('.event-title').textContent = '🏪 神秘商人';
    descEl.textContent = `💰 你的金幣：${gameState.playerGold}`;
    const bodyEl = modal.querySelector('.event-body');

    const vocabDiff = FLOOR_CONFIG[Math.min(floor - 1, FLOOR_CONFIG.length - 1)].vocabDifficulty;
    const activeCards = getActiveWordCards();
    const shopCards = shuffleArray(activeCards.filter(c => c.difficulty <= vocabDiff)).slice(0, 3);

    function renderMerchant() {
        let html = '<div class="event-cards-grid">';

        shopCards.forEach(card => {
            const price = 15 + card.difficulty * 10;
            const rarityKey = getCardRarity(card);
            const rarity = RARITY_CONFIG[rarityKey];
            const art = getCardArt(card.id);
            const canAfford = gameState.playerGold >= price;
            html += `<div class="de-card rarity-${rarityKey} event-selectable-card${canAfford ? '' : ' merchant-cant-afford'}"
                data-id="${card.id}" data-price="${price}" style="border-color:${rarity.color}; cursor:pointer; position:relative">
                <div class="de-card-top" style="background:${rarity.color}">
                    <div class="de-card-cost">${card.cost}</div>
                    <div class="de-card-name">${card.en}</div>
                </div>
                <div class="de-card-art">${art}</div>
                <div class="de-card-desc"><span class="de-card-zh">${card.zh}</span><br>${card.desc.replace('{v}', card.value || 0)}</div>
                <button class="merchant-buy-btn" data-id="${card.id}" data-price="${price}" ${canAfford ? '' : 'disabled'}>💰 ${price}</button>
            </div>`;
        });

        html += '</div>';
        html += `<div class="merchant-services">
            <button class="merchant-service-btn heal-item" data-price="20" ${gameState.playerGold >= 20 ? '' : 'disabled'}>❤️ 回復 15 HP &nbsp; 💰20</button>
            <button class="merchant-service-btn remove-item" data-price="30" ${gameState.playerGold >= 30 ? '' : 'disabled'}>🗑️ 刪除一張卡 &nbsp; 💰30</button>
        </div>`;
        html += '<button class="event-skip-btn" style="margin-top:12px">👋 離開商店</button>';
        bodyEl.innerHTML = html;

        // 點卡牌本體 → 查看詳情
        bodyEl.querySelectorAll('.event-selectable-card').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.merchant-buy-btn')) return;
                if (window.showCardDetail) window.showCardDetail(el.dataset.id);
            });
        });

        // 購買卡牌
        bodyEl.querySelectorAll('.merchant-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const price = parseInt(btn.dataset.price);
                if (gameState.playerGold < price) return;
                gameState.playerGold -= price;
                gameState.playerDeck.push(btn.dataset.id);
                const coll = getPlayerCollection(); coll.push(btn.dataset.id); savePlayerCollection(coll);
                cloudSet('vocabSpire_playerCollection', 'playerCollection', coll);
                saveRunState();
                // 從商品清單移除
                const idx = shopCards.findIndex(c => c.id === btn.dataset.id);
                if (idx >= 0) shopCards.splice(idx, 1);
                descEl.textContent = `💰 你的金幣：${gameState.playerGold}`;
                renderMerchant();
            });
        });

        bodyEl.querySelector('.heal-item')?.addEventListener('click', function() {
            if (gameState.playerGold < 20) return;
            gameState.playerGold -= 20;
            gameState.playerHp = Math.min(gameState.playerMaxHp, gameState.playerHp + 15);
            saveRunState();
            descEl.textContent = `💰 你的金幣：${gameState.playerGold}`;
            renderMerchant();
        });

        bodyEl.querySelector('.remove-item')?.addEventListener('click', function() {
            if (gameState.playerGold < 30) return;
            gameState.playerGold -= 30;
            saveRunState();
            modal.classList.add('hidden');
            showCardRemoveEvent();
        });

        bodyEl.querySelector('.event-skip-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            showMap();
        });
    }

    renderMerchant();
    modal.classList.remove('hidden');
}

// --- 祝福事件 ---
function showBlessingEvent() {
    const blessings = [
        { text: '💪 力量祝福：本場攻擊力 +1', apply: () => { gameState.playerBuffs.strength += 1; saveRunState(); } },
        { text: '❤️ 生命祝福：最大HP +5 並回滿', apply: () => { gameState.playerMaxHp += 5; gameState.playerHp = gameState.playerMaxHp; saveRunState(); } },
        { text: '🌿 再生祝福：每回合回復 1 HP', apply: () => { gameState.playerBuffs.regen += 1; saveRunState(); } },
        { text: '🌹 荊棘祝福：受擊反彈 2 傷害', apply: () => { gameState.playerBuffs.thorns += 2; saveRunState(); } },
        { text: '💰 財富祝福：獲得 30 金幣', apply: () => { gameState.playerGold += 30; saveRunState(); } },
    ];
    const blessing = blessings[Math.floor(Math.random() * blessings.length)];

    showEventModal('⭐ 神秘祝福', blessing.text, () => {
        blessing.apply();
        showMap();
    });
}

// --- 通用事件 Modal ---
function showEventModal(title, desc, onConfirm) {
    const modal = document.getElementById('event-modal');
    modal.querySelector('.event-title').textContent = title;
    modal.querySelector('.event-desc').textContent = desc;
    modal.querySelector('.event-body').innerHTML = '<button class="event-confirm-btn">✅ 確認</button>';
    modal.classList.remove('hidden');

    modal.querySelector('.event-confirm-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
        onConfirm();
    });
}

// ===== 休息 =====
function showRestScreen(floor) {
    const s = gameState;
    const modal = document.getElementById('rest-modal');
    modal.classList.remove('hidden');

    const healAmount = GAME_CONSTANTS.REST_HEAL_AMOUNT;
    modal.querySelector('.rest-info').textContent =
        `回復 ${healAmount} HP (${s.playerHp}→${Math.min(s.playerMaxHp, s.playerHp + healAmount)})`;

    const restBtn = modal.querySelector('.rest-btn');
    const skipBtn = modal.querySelector('.skip-rest-btn');
    const newRest = restBtn.cloneNode(true);
    restBtn.parentNode.replaceChild(newRest, restBtn);
    const newSkip = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newRest.addEventListener('click', () => {
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + healAmount);
        saveRunState();
        modal.classList.add('hidden');
        showMap();
    });
    newSkip.addEventListener('click', () => {
        modal.classList.add('hidden');
        showMap();
    });
}

// ===== 戰鬥 =====
function enterBattle(floor) {
    gameState.inBattle = true;
    saveRunState();
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');

    initBattle(
        floor, gameState.playerDeck, gameState.playerHp, gameState.playerMaxHp,
        gameState.playerGold, gameState.playerBuffs, gameState.newCardIds,
        (result) => handleBattleResult(result, floor)
    );
}

function handleBattleResult(result, floor) {
    if (result.victory) {
        gameState.playerHp = result.playerHp;
        gameState.playerGold += result.goldEarned;
        gameState.playerDeck = result.deck;
        gameState.playerBuffs = result.buffs;
        
        gameState.inBattle = false;
        saveRunState();

        if (floor >= gameState.maxFloor) { showGameComplete(); return; }

        const resultModal = document.getElementById('battle-result-modal');
        const continueBtn = resultModal.querySelector('.continue-btn');
        const newBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newBtn, continueBtn);

        newBtn.addEventListener('click', () => {
            resultModal.classList.add('hidden');
            showCardReward(gameState.playerDeck, FLOOR_CONFIG[Math.min(floor - 1, FLOOR_CONFIG.length - 1)].vocabDifficulty, (cardId) => {
                if (cardId) {
                    gameState.playerDeck.push(cardId);
                    gameState.newCardIds.push(cardId);
                    const coll = getPlayerCollection(); coll.push(cardId); savePlayerCollection(coll);
                    cloudSet('vocabSpire_playerCollection', 'playerCollection', coll);
                }
                showMap();
            });
        });
    } else {
        const resultModal = document.getElementById('battle-result-modal');
        const continueBtn = resultModal.querySelector('.continue-btn');
        const newBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newBtn, continueBtn);
        newBtn.addEventListener('click', () => {
            resultModal.classList.add('hidden');
            if (onGameOver) onGameOver({ floor, victory: false });
        });
    }
}

function showGameComplete() {
    const resultModal = document.getElementById('battle-result-modal');
    resultModal.querySelector('.result-title').textContent = '🏆 通關！';
    resultModal.querySelector('.result-title').className = 'result-title victory';
    resultModal.querySelector('.result-details').innerHTML = `
        <p>🎉 恭喜你擊敗了龍王！</p>
        <p>❤️ 剩餘HP: ${gameState.playerHp}</p>
        <p>💰 金幣: ${gameState.playerGold}</p>
        <p>📚 學會了 ${gameState.playerDeck.length} 個單字</p>
    `;
    resultModal.classList.remove('hidden');

    const continueBtn = resultModal.querySelector('.continue-btn');
    const newBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newBtn, continueBtn);
    newBtn.textContent = '🔄 再來一局';
    newBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        if (onGameOver) onGameOver({ victory: true });
    });
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function getGameState() {
    return gameState;
}
