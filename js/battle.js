import { WORD_CARDS, SIMILAR_WORDS, ENEMIES, FLOOR_CONFIG, GAME_CONSTANTS, RARITY_BY_DIFFICULTY, RARITY_CONFIG, getCardRarity, getCardRarityConfig, getAllWordCards, getAllSimilarWords, getActiveWordCards } from './data.js';
import { getCardArt } from './cardart.js';
import { speakWord, speakWordSlowly, preloadWords } from './speech.js';
import { sfxAttack, sfxHit, sfxShield, sfxHeal, sfxCardPlay, sfxCorrect, sfxWrong, sfxVictory, sfxDefeat, sfxEnemyAttack, sfxDefenseQuiz, sfxDraw, sfxShuffle, sfxTurnStart, sfxEndTurn, sfxPoison, sfxPoisonTick, sfxRegenTick, sfxDebuff, sfxEnemyBuff, sfxEnemyDeath, sfxThorns } from './sound.js';
import { generateQuizOptions } from './phonetics.js';

let battleState = null;
let quizTimer = null;
let onBattleEnd = null;
let animating = false;
let targetEnemyIdx = 0; // 目前選擇的敵人索引

// ===== Buff 說明表 =====
const BUFF_INFO = {
    strength:  { emoji: '💪', name: '力量',    color: '#e74c3c', desc: v => `攻擊力增強，本場每次攻擊額外造成 +${v} 傷害` },
    regen:     { emoji: '🌿', name: '再生',    color: '#2ecc71', desc: v => `每回合自動回復 ${v} 點血量` },
    thorns:    { emoji: '🌹', name: '荊棘',    color: '#e74c3c', desc: v => `受到攻擊時自動反彈 ${v} 點傷害給攻擊者` },
    blockRegen:{ emoji: '🛡️', name: '護甲再生', color: '#3498db', desc: v => `每回合自動獲得 ${v} 點護甲` },
    vulnerable:{ emoji: '⚠️', name: '易傷',    color: '#e67e22', desc: v => `易傷中！受到的傷害增加 50%，剩餘 ${v} 回合` },
    weak:      { emoji: '😵‍💫', name: '虛弱',   color: '#9b59b6', desc: v => `虛弱中！攻擊傷害減半，剩餘 ${v} 回合` },
    poison:    { emoji: '🧪', name: '中毒',    color: '#27ae60', desc: v => `中毒中！每回合受到 ${v} 點傷害（數值逐漸減少）` },
};

function showBuffPopup(buffKey, value) {
    const info = BUFF_INFO[buffKey];
    if (!info) return;
    const existing = document.getElementById('buff-popup');
    if (existing) existing.remove();
    const popup = document.createElement('div');
    popup.id = 'buff-popup';
    popup.style.borderColor = info.color;
    popup.style.borderWidth = '2px';
    popup.style.borderStyle = 'solid';
    popup.innerHTML = `
        <div style="font-size:1.8em">${info.emoji}</div>
        <div style="color:${info.color};font-weight:700;font-size:1em;margin:4px 0">${info.name}</div>
        <div style="color:#ddd;font-size:0.85em;line-height:1.5">${info.desc(value)}</div>
        <div style="color:#777;font-size:0.7em;margin-top:8px">點擊關閉</div>
    `;
    document.body.appendChild(popup);
    const timer = setTimeout(() => { if (popup.parentNode) popup.remove(); }, 3000);
    popup.addEventListener('click', () => { clearTimeout(timer); popup.remove(); });
}

// ===== 建立單隻敵人 =====
function createEnemy(enemyKey, config) {
    const tmpl = ENEMIES[enemyKey];
    const hp = Math.floor(tmpl.hp * config.enemyHpMult);
    return {
        name: tmpl.name, emoji: tmpl.emoji,
        hp, maxHp: hp, block: 0,
        attacks: tmpl.attacks.map(a => ({ ...a, damage: Math.floor(a.damage * config.enemyAtkMult) })),
        isBoss: tmpl.isBoss || false,
        intent: null,
        buffs: { strength: 0, poison: 0, vulnerable: 0, weak: 0 },
    };
}

// ===== 初始化戰鬥 =====
export function initBattle(floor, playerDeck, playerHp, playerMaxHp, playerGold, playerBuffs, newCardIds, endCallback) {
    onBattleEnd = endCallback;
    const config = FLOOR_CONFIG[floor - 1];

    // 產生敵人陣列
    const [minE, maxE] = config.enemyCount || [1, 1];
    const numEnemies = minE + Math.floor(Math.random() * (maxE - minE + 1));
    const enemies = [];
    for (let i = 0; i < numEnemies; i++) {
        const key = config.enemies[Math.floor(Math.random() * config.enemies.length)];
        enemies.push(createEnemy(key, config));
    }

    battleState = {
        floor, config,
        player: {
            hp: playerHp, maxHp: playerMaxHp, block: 0,
            energy: GAME_CONSTANTS.ENERGY_PER_TURN, maxEnergy: GAME_CONSTANTS.ENERGY_PER_TURN,
            gold: playerGold,
            deck: shuffleArray([...playerDeck]), hand: [], discard: [],
            buffs: { strength: 0, regen: 0, thorns: 0, blockRegen: 0, tempStrength: 0, vulnerable: 0, weak: 0, poison: 0, ...playerBuffs },
        },
        enemies,
        turn: 0,
        vocabDifficulty: config.vocabDifficulty,
        newCardIds: newCardIds || [],
        battleLog: [],
    };

    targetEnemyIdx = 0;
    rollAllIntents();
    renderBattle();
    startPlayerTurn();

    const allWords = getAllWordCards().map(c => c.en);
    preloadWords(allWords);
}

// ===== 回合系統 =====
async function startPlayerTurn() {
    animating = true;
    const s = battleState;
    s.turn++;
    sfxTurnStart();
    s.player.energy = s.player.maxEnergy;
    s.player.block = 0;
    s.player.buffs.tempStrength = 0;
    
    // 能量增加特效
    const energyEl = document.getElementById('player-energy');
    if (energyEl) {
        energyEl.classList.remove('energy-gain');
        void energyEl.offsetWidth; // trigger reflow
        energyEl.classList.add('energy-gain');
    }

    if (s.player.buffs.blockRegen > 0) {
        s.player.block += s.player.buffs.blockRegen;
        addLog(`🛡️ 鳳凰羽翼提供了 ${s.player.buffs.blockRegen} 點護甲`);
        showFx('🛡️', 'fx-shield');
    }

    if (s.player.buffs.regen > 0) {
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + s.player.buffs.regen);
        sfxRegenTick();
        addLog(`🌿 再生恢復了 ${s.player.buffs.regen} HP`);
    }
    // 玩家中毒 DoT
    if (s.player.buffs.poison > 0) {
        sfxPoisonTick();
        s.player.hp -= s.player.buffs.poison;
        addLog(`🧪 毒素對你造成 ${s.player.buffs.poison} 點傷害`);
        s.player.buffs.poison = Math.max(0, s.player.buffs.poison - 1);
    }
    // 遍歷所有敵人 DoT
    for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        if (e.hp <= 0) continue;
        if (e.buffs.poison > 0) {
            sfxPoisonTick();
            e.hp -= e.buffs.poison;
            addLog(`🧪 毒素對 ${e.emoji}${e.name} 造成 ${e.buffs.poison} 點傷害`);
            e.buffs.poison = Math.max(0, e.buffs.poison - 1);
        }
        if (e.hp <= 0) addLog(`💥 ${e.emoji}${e.name} 被擊敗了！`);
    }
    // 檢查是否全滅
    if (s.enemies.every(e => e.hp <= 0)) { handleVictory(); return; }
    // 確保 target 指向活的敵人
    if (s.enemies[targetEnemyIdx]?.hp <= 0) {
        targetEnemyIdx = s.enemies.findIndex(e => e.hp > 0);
    }
    // 玩家弱化
    if (s.player.buffs.vulnerable > 0) { s.player.buffs.vulnerable--; addLog(`⚠️ 易傷剩餘 ${s.player.buffs.vulnerable} 回合`); }
    if (s.player.buffs.weak > 0) { s.player.buffs.weak--; addLog(`😵‍💫 虛弱剩餘 ${s.player.buffs.weak} 回合`); }

    await drawCards(GAME_CONSTANTS.HAND_SIZE);
    
    renderBattle();
    animating = false;
}

async function drawCards(count) {
    const s = battleState;
    for (let i = 0; i < count; i++) {
        if (s.player.deck.length === 0) {
            if (s.player.discard.length === 0) break;
            s.player.deck = shuffleArray([...s.player.discard]);
            s.player.discard = [];
            sfxShuffle();
            
            // 洗牌動畫
            const dcEl = document.getElementById('deck-count');
            if (dcEl) {
                dcEl.classList.add('shuffle-active');
                await delay(500);
                dcEl.classList.remove('shuffle-active');
            }
            renderDeckDiscards();
        }
        
        const drawnCardId = s.player.deck.pop();
        if (!drawnCardId) break;
        s.player.hand.push(drawnCardId);
        
        // 渲染剛抽上來的那張牌有動畫
        renderHandAnim();
        renderDeckDiscards();
        
        sfxDraw();
        
        await delay(300);
    }
}

function renderHandAnim() {
    const s = battleState;
    const handEl = document.getElementById('hand-cards');

    // 重新渲染手牌區
    handEl.innerHTML = s.player.hand.map((cardId, i) => {
        const card = getAllWordCards().find(c => c.id === cardId);
        if (!card) return '';
        const rarityKey = getCardRarity(card);
        const rarity = RARITY_CONFIG[rarityKey];
        const playable = card.cost <= s.player.energy;
        const typeLabel = { attack: '攻擊', defend: '防禦', skill: '技能', power: '能力' }[card.type];
        const artSvg = getCardArt(card.id);
        return `
            <div class="card ${card.type} ${playable ? 'playable' : 'unplayable'} rarity-${rarityKey}"
                 data-index="${i}" data-card-type="${card.type}" data-id="${card.id}">
                <div class="card-cost">${card.cost}</div>
                <div class="card-art">${artSvg}</div>
                <div class="card-type-label">${typeLabel}</div>
                <div class="card-desc">${card.desc.replace('{v}', card.value)}</div>
                <div class="card-rarity" style="color: ${rarity.color}">${rarity.label}</div>
            </div>
        `;
    }).join('');

    // 讓最後一張牌掛上 draw-anim 類別
    if (handEl.lastElementChild) {
        handEl.lastElementChild.classList.add('draw-anim');
    }

    setupCardDrag();
}

// ===== 出牌 =====
export function playCard(handIndex) {
    if (animating) return;
    const s = battleState;
    const cardId = s.player.hand[handIndex];
    const card = getAllWordCards().find(c => c.id === cardId);
    if (!card || card.cost > s.player.energy) return;

    showQuiz(card, handIndex);
}

// ===== 兩階段問答系統 =====
// 第一階段：聽發音 → 6選1 選正確拼字
// 第二階段：選正確中文意思（4選1）

async function showQuiz(card, handIndex) {
    animating = true;
    const quizEl = document.getElementById('quiz-modal');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const timerEl = document.getElementById('quiz-timer');
    const feedbackEl = document.getElementById('quiz-feedback');
    const phaseEl = document.getElementById('quiz-phase');
    const speakBtn = document.getElementById('quiz-speak-btn');

    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    quizEl.classList.remove('hidden');

    // ===== 第一階段：聽音選拼字 =====
    phaseEl.textContent = '📢 第一關：聽發音，選出正確的拼字！';
    phaseEl.className = 'quiz-phase phase1';

    // 產生 6 個拼字選項（1正確 + 5語音混淆）
    const spellingOptions = generateQuizOptions(card.en, 6);

    questionEl.innerHTML = `<span class="quiz-listen-icon">🔊</span><br>仔細聽，選出正確的單字！`;
    optionsEl.innerHTML = spellingOptions.map((opt, i) =>
        `<button class="quiz-option spelling-opt" data-value="${opt}">${opt}</button>`
    ).join('');
    optionsEl.className = 'quiz-options-grid six-options';

    // 播放語音
    speakBtn.classList.remove('hidden');
    speakBtn.onclick = () => speakWord(card.en);
    await speakWord(card.en);

    // 計時
    let timeLeft = GAME_CONSTANTS.QUIZ_TIME_LIMIT;
    timerEl.textContent = `⏱️ ${timeLeft}`;
    clearInterval(quizTimer);
    quizTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱️ ${timeLeft}`;
        if (timeLeft <= 5) timerEl.classList.add('timer-urgent');
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            timerEl.classList.remove('timer-urgent');
            handleSpellingResult(false, card, handIndex, quizEl);
        }
    }, 1000);

    // 選項點擊
    const spellingPromise = new Promise((resolve) => {
        optionsEl.querySelectorAll('.spelling-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(quizTimer);
                timerEl.classList.remove('timer-urgent');
                const picked = btn.dataset.value;
                const correct = picked === card.en;

                // 高亮答案
                optionsEl.querySelectorAll('.spelling-opt').forEach(b => {
                    if (b.dataset.value === card.en) b.classList.add('correct');
                    else if (b === btn && !correct) b.classList.add('wrong');
                    b.disabled = true;
                });

                resolve(correct);
            });
        });
    });

    const spellingCorrect = await spellingPromise;
    handleSpellingResult(spellingCorrect, card, handIndex, quizEl);
}

async function handleSpellingResult(correct, card, handIndex, quizEl) {
    const feedbackEl = document.getElementById('quiz-feedback');
    const speakBtn = document.getElementById('quiz-speak-btn');

    if (!correct) {
        feedbackEl.textContent = `❌ 正確拼字是：${card.en}`;
        feedbackEl.className = 'quiz-feedback wrong';
        // 再念一次讓小朋友記住
        await speakWordSlowly(card.en);
        await delay(1000);
        quizEl.classList.add('hidden');
        speakBtn.classList.add('hidden');
        animating = false;
        executeCard(card, handIndex, false);
        return;
    }

    feedbackEl.textContent = `✅ 拼字正確！${card.en}`;
    feedbackEl.className = 'quiz-feedback correct';
    await delay(800);

    // ===== 第二階段：選中文意思 =====
    showMeaningQuiz(card, handIndex, quizEl);
}

async function showMeaningQuiz(card, handIndex, quizEl) {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const timerEl = document.getElementById('quiz-timer');
    const feedbackEl = document.getElementById('quiz-feedback');
    const phaseEl = document.getElementById('quiz-phase');
    const speakBtn = document.getElementById('quiz-speak-btn');

    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    phaseEl.textContent = '📝 第二關：選出正確的中文意思！';
    phaseEl.className = 'quiz-phase phase2';
    speakBtn.classList.add('hidden');

    // 產生 4 個中文選項（1正確 + 3錯誤）
    const allCards = getAllWordCards().filter(w => w.id !== card.id);
    const wrongMeanings = shuffleArray(allCards).slice(0, 3).map(w => w.zh);
    const meaningOptions = shuffleArray([card.zh, ...wrongMeanings]);

    questionEl.innerHTML = `<span class="quiz-word">${card.en}</span> ${card.emoji}<br>這個單字是什麼意思？`;
    optionsEl.innerHTML = meaningOptions.map((opt, i) =>
        `<button class="quiz-option meaning-opt" data-value="${opt}">${opt}</button>`
    ).join('');
    optionsEl.className = 'quiz-options-grid four-options';

    // 計時
    let timeLeft = GAME_CONSTANTS.QUIZ_TIME_LIMIT;
    timerEl.textContent = `⏱️ ${timeLeft}`;
    clearInterval(quizTimer);
    quizTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱️ ${timeLeft}`;
        if (timeLeft <= 5) timerEl.classList.add('timer-urgent');
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            timerEl.classList.remove('timer-urgent');
            finishQuiz(false, card, handIndex, quizEl);
        }
    }, 1000);

    optionsEl.querySelectorAll('.meaning-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            clearInterval(quizTimer);
            timerEl.classList.remove('timer-urgent');
            const picked = btn.dataset.value;
            const correct = picked === card.zh;

            optionsEl.querySelectorAll('.meaning-opt').forEach(b => {
                if (b.dataset.value === card.zh) b.classList.add('correct');
                else if (b === btn && !correct) b.classList.add('wrong');
                b.disabled = true;
            });

            finishQuiz(correct, card, handIndex, quizEl);
        });
    });
}

async function finishQuiz(correct, card, handIndex, quizEl) {
    const feedbackEl = document.getElementById('quiz-feedback');

    if (correct) {
        sfxCorrect();
        feedbackEl.textContent = `✅ 完全正確！${card.en} = ${card.zh}`;
        feedbackEl.className = 'quiz-feedback correct';
    } else {
        sfxWrong();
        feedbackEl.textContent = `❌ 正確答案：${card.en} = ${card.zh}`;
        feedbackEl.className = 'quiz-feedback wrong';
        await speakWord(card.en);
    }

    await delay(1200);
    quizEl.classList.add('hidden');
    document.getElementById('quiz-speak-btn').classList.add('hidden');
    animating = false;
    executeCard(card, handIndex, correct);
}

// ===== 執行卡牌效果 =====
async function executeCard(card, handIndex, correct) {
    const s = battleState;

    s.player.energy -= card.cost;
    s.player.hand.splice(handIndex, 1);
    s.player.discard.push(card.id);

    if (!correct) {
        addLog(`❌ 答錯了！${card.emoji} ${card.en} 發動失敗！`);
        shakeElement('.player-area');
        renderBattle();
        return;
    }

    addLog(`✅ 答對！使用 ${card.emoji} ${card.en}（${card.zh}）`);
    sfxCardPlay();
    renderBattle(); // 先更新畫面（顯示卡牌消耗）
    
    // ★ 延遲 1.2 秒讓玩家看到特效動畫
    await delay(1200);

    const strength = s.player.buffs.strength + s.player.buffs.tempStrength;
    const extra = card.extra || {};
    const target = s.enemies[targetEnemyIdx]; // 攻擊目標

    const weakMult = s.player.buffs.weak > 0 ? 0.5 : 1;
    const vulnMult = target && target.buffs.vulnerable > 0 ? 1.5 : 1;
    switch (card.type) {
        case 'attack': {
            const aliveEnemies = () => s.enemies.filter(e => e.hp > 0);
            if (aliveEnemies().length === 0) break;

            const playerEl = document.querySelector('.player-sprite');
            sfxAttack();

            if (extra.aoe) {
                // 全體攻擊：對所有存活敵人各自計算傷害
                const firstAliveIdx = s.enemies.findIndex(e => e.hp > 0);
                const firstEl = document.querySelector(`.enemy-unit[data-enemy-idx="${firstAliveIdx}"]`);
                await animateProjectile(playerEl, firstEl, card.emoji);
                let totalDmg = 0;
                for (const enemy of aliveEnemies()) {
                    const eVulnMult = enemy.buffs.vulnerable > 0 ? 1.5 : 1;
                    let dmg = Math.floor((card.value + strength) * weakMult * eVulnMult);
                    if (enemy.block > 0) { const blocked = Math.min(enemy.block, dmg); enemy.block -= blocked; dmg -= blocked; }
                    enemy.hp -= dmg;
                    totalDmg += dmg;
                    addLog(`  💥 對 ${enemy.emoji}${enemy.name} 造成 ${dmg} 點傷害`);
                    if (enemy.hp <= 0) { sfxEnemyDeath(); addLog(`  💀 ${enemy.emoji}${enemy.name} 被擊敗了！`); }
                }
                playAttackFx();
                showFloatingNumber(totalDmg, 'enemy');
            } else {
                if (!target || target.hp <= 0) break;
                const targetEl = document.querySelector(`.enemy-unit[data-enemy-idx="${targetEnemyIdx}"]`);
                await animateProjectile(playerEl, targetEl, card.emoji);

                const hits = extra.hits || 1;
                let totalDmg = 0;
                for (let i = 0; i < hits; i++) {
                    // 隨機二連擊：每次隨機選擇一個存活的敵人
                    const alive = aliveEnemies();
                    const hitTarget = hits > 1 && alive.length > 0
                        ? alive[Math.floor(Math.random() * alive.length)]
                        : target;
                    const eVulnMult = hitTarget.buffs.vulnerable > 0 ? 1.5 : 1;
                    let dmg = Math.floor((card.value + strength) * weakMult * eVulnMult);
                    if (hitTarget.block > 0) { const blocked = Math.min(hitTarget.block, dmg); hitTarget.block -= blocked; dmg -= blocked; }
                    hitTarget.hp -= dmg;
                    totalDmg += dmg;
                    addLog(`  💥 對 ${hitTarget.emoji}${hitTarget.name} 造成 ${dmg} 點傷害`);
                    if (hitTarget.hp <= 0) { sfxEnemyDeath(); addLog(`  💀 ${hitTarget.emoji}${hitTarget.name} 被擊敗了！`); }
                }
                if (extra.poison) { target.buffs.poison += extra.poison; sfxPoison(); addLog(`  🧪 施加 ${extra.poison} 層毒`); }
                if (extra.vulnerable) { target.buffs.vulnerable += extra.vulnerable; sfxDebuff(); addLog(`  ⚠️ 敵人易傷 ${extra.vulnerable} 回合`); }
                if (extra.weak) { target.buffs.weak += extra.weak; sfxDebuff(); addLog(`  😵‍💫 敵人虛弱 ${extra.weak} 回合`); }
                playAttackFx();
                showFloatingNumber(totalDmg, 'enemy');
            }
            break;
        }
        case 'defend': {
            sfxShield();
            s.player.block += card.value;
            addLog(`  🛡️ 獲得 ${card.value} 點護甲`);
            showFx('🛡️', 'fx-shield');
            if (extra.draw) await drawCards(typeof extra.draw === 'number' ? extra.draw : 1);
            if (extra.energy) { s.player.energy += extra.energy; addLog(`  ⚡ 獲得 ${extra.energy} 點能量`); }
            if (extra.vulnerable) { s.enemies.filter(e => e.hp > 0).forEach(e => { e.buffs.vulnerable += extra.vulnerable; }); sfxDebuff(); addLog(`  ⚠️ 所有敵人易傷 ${extra.vulnerable} 回合`); }
            if (extra.weak) { s.enemies.filter(e => e.hp > 0).forEach(e => { e.buffs.weak += extra.weak; }); sfxDebuff(); addLog(`  😵‍💫 所有敵人虛弱 ${extra.weak} 回合`); }
            if (extra.reflect) { if (target) { target.hp -= extra.reflect; addLog(`  🔄 反彈 ${extra.reflect} 傷害`); } }
            if (extra.healBonus) { s.player.hp = Math.min(s.player.maxHp, s.player.hp + extra.healBonus); addLog(`  💚 回復 ${extra.healBonus} HP`); }
            break;
        }
        case 'skill': {
            if (extra.heal) {
                sfxHeal();
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + card.value);
                addLog(`  💚 回復 ${card.value} HP`);
                showFx('💚', 'fx-heal');
                showFloatingNumber(card.value, 'player', 'heal');
            }
            if (extra.draw) { await drawCards(card.value); addLog(`  🃏 抽了 ${card.value} 張牌`); }
            if (extra.energy) { 
                s.player.energy += card.value; 
                addLog(`  🔋 獲得 ${card.value} 點能量`); 
                const energyEl = document.getElementById('player-energy');
                if (energyEl) {
                    energyEl.classList.remove('energy-gain');
                    void energyEl.offsetWidth;
                    energyEl.classList.add('energy-gain');
                }
            }
            if (extra.bonusDraw) await drawCards(extra.bonusDraw);
            break;
        }
        case 'power': {
            sfxShield();
            if (extra.permAtk) { s.player.buffs.strength += card.value; addLog(`  💪 本場攻擊力 +${card.value}`); }
            if (extra.regen) { s.player.buffs.regen += card.value; addLog(`  🌿 每回合回復 ${card.value} HP`); }
            if (extra.blockRegen) { s.player.buffs.blockRegen += card.value; addLog(`  🛡️ 每回合獲得 ${card.value} 點護甲`); }
            if (extra.thorns) { s.player.buffs.thorns += card.value; addLog(`  🌹 受擊反彈 ${card.value} 傷害`); }
            showFx('✨', 'fx-heal');
            break;
        }
    }

    // 確保 target 指向活的敵人
    if (s.enemies[targetEnemyIdx]?.hp <= 0) {
        targetEnemyIdx = s.enemies.findIndex(e => e.hp > 0);
    }
    if (s.enemies.every(e => e.hp <= 0)) { handleVictory(); return; }
    renderBattle();
}

// ===== 結束回合 =====
export function endTurn() {
    if (animating) return;
    sfxEndTurn();
    const s = battleState;
    s.player.discard.push(...s.player.hand);
    s.player.hand = [];
    enemyTurn();
}

async function enemyTurn() {
    const s = battleState;
    animating = true;

    // 每隻活的敵人依序行動
    for (let ei = 0; ei < s.enemies.length; ei++) {
        const enemy = s.enemies[ei];
        if (enemy.hp <= 0) continue;

        const attack = enemy.intent;
        enemy.block = 0;

        const enemyEl = document.querySelector(`.enemy-unit[data-enemy-idx="${ei}"]`);
        const playerEl = document.querySelector('.player-sprite');

        // 攻擊動畫 (如果有傷害值)
        if (attack.damage > 0) {
            await animateProjectile(enemyEl, playerEl, attack.emoji);
        }

        // 自我增益動畫：力量提升
        if (attack.buffSelf) {
            sfxEnemyBuff();
            glowElement(enemyEl, 'enemy-buff-glow');
            showStatusFx(enemyEl, '💪', `力量+${attack.buffSelf}`, '#f39c12');
            await delay(500);
        }

        // 自我防禦動畫：獲得護甲
        if (attack.block) {
            sfxEnemyBuff();
            glowElement(enemyEl, 'enemy-block-glow');
            showStatusFx(enemyEl, '🛡️', `護甲+${attack.block}`, '#4dabf7');
            await delay(400);
        }

        // 自我回血動畫
        if (attack.heal) {
            sfxRegenTick();
            glowElement(enemyEl, 'enemy-heal-glow');
            showStatusFx(enemyEl, '💚', `回復${attack.heal}`, '#2ecc71');
            await delay(400);
        }

        // 施加易傷動畫 → 目標是玩家
        if (attack.applyVuln) {
            sfxDebuff();
            glowElement(playerEl, 'player-debuff-flash');
            showStatusFx(playerEl, '⚠️', `易傷${attack.applyVuln}回合`, '#e67e22');
            await delay(500);
        }

        // 施加虛弱動畫 → 目標是玩家
        if (attack.applyWeak) {
            sfxDebuff();
            glowElement(playerEl, 'player-debuff-flash');
            showStatusFx(playerEl, '😵‍💫', `虛弱${attack.applyWeak}回合`, '#be4bdb');
            await delay(500);
        }

        // 毒素動畫
        if (attack.poison) {
            sfxPoison();
            glowElement(playerEl, 'player-debuff-flash');
            showStatusFx(playerEl, '🧪', `中毒+${attack.poison}層`, '#27ae60');
            await delay(400);
        }

        // 純攻擊音效（有傷害時才播）
        if (attack.damage > 0) {
            sfxEnemyAttack();
        }
        await delay(300);

        applyEnemyAttack(enemy, attack, 0);

        if (s.player.hp <= 0) { handleDefeat(); return; }
        renderBattle();
        await delay(400);
    }

    // 所有敵人行動完畢
    animating = false;
    if (s.enemies.every(e => e.hp <= 0)) { handleVictory(); return; }
    rollAllIntents();
    startPlayerTurn();
}

// ===== 敵人攻擊結算 =====
function applyEnemyAttack(enemy, attack, damageReduction) {
    const s = battleState;
    const enemyWeakMult = enemy.buffs.weak > 0 ? 0.5 : 1;
    const playerVulnMult = s.player.buffs.vulnerable > 0 ? 1.5 : 1;
    let dmg = Math.floor((attack.damage + enemy.buffs.strength) * enemyWeakMult * playerVulnMult);
    dmg = Math.max(0, dmg);

    if (damageReduction > 0 && dmg > 0) {
        const reduced = Math.floor(dmg * damageReduction);
        dmg -= reduced;
        addLog(`🛡️ 答題防禦！傷害減少 ${reduced} 點`);
    }

    if (attack.block) {
        enemy.block += attack.block;
        addLog(`${enemy.emoji} ${enemy.name} 獲得 ${attack.block} 護甲`);
    }
    if (dmg > 0) {
        if (s.player.block > 0) {
            const blocked = Math.min(s.player.block, dmg);
            s.player.block -= blocked;
            dmg -= blocked;
            if (blocked > 0) addLog(`  🛡️ 護甲擋住了 ${blocked} 點傷害`);
        }
        s.player.hp -= dmg;
        addLog(`${enemy.emoji} ${enemy.name} 使用 ${attack.name}，造成 ${dmg} 點傷害`);
        sfxHit();
        showFloatingNumber(dmg, 'player');
        // 玩家受擊閃爍
        const pSprite = document.querySelector('.player-sprite');
        if (pSprite) { pSprite.classList.remove('anim-hit'); void pSprite.offsetWidth; pSprite.classList.add('anim-hit'); setTimeout(() => pSprite.classList.remove('anim-hit'), 550); }
        if (s.player.buffs.thorns > 0) {
            sfxThorns();
            enemy.hp -= s.player.buffs.thorns;
            addLog(`  🌹 荊棘反彈 ${s.player.buffs.thorns} 點傷害`);
        }
    }
    if (attack.heal) { enemy.hp = Math.min(enemy.maxHp, enemy.hp + attack.heal); addLog(`  💚 ${enemy.name} 回復 ${attack.heal} HP`); }
    if (attack.poison) { s.player.buffs.poison += attack.poison; addLog(`  🧪 你被施加 ${attack.poison} 層毒素`); }
    if (attack.buffSelf) { enemy.buffs.strength += attack.buffSelf; addLog(`  💪 ${enemy.name} 攻擊力增加！`); }
    if (attack.applyVuln) { s.player.buffs.vulnerable += attack.applyVuln; addLog(`  ⚠️ 你被施加易傷 ${attack.applyVuln} 回合`); }
    if (attack.applyWeak) { s.player.buffs.weak += attack.applyWeak; addLog(`  😵‍💫 你被施加虛弱 ${attack.applyWeak} 回合`); }
    if (enemy.buffs.vulnerable > 0) enemy.buffs.vulnerable--;
    if (enemy.buffs.weak > 0) enemy.buffs.weak--;
}

// ===== 防禦答題（敵人攻擊前）=====
function showDefenseQuiz() {
    return new Promise(async (resolve) => {
        const word = pickWeightedWord();
        if (!word) { resolve(0); return; }

        const quizEl = document.getElementById('quiz-modal');
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');
        const timerEl = document.getElementById('quiz-timer');
        const feedbackEl = document.getElementById('quiz-feedback');
        const phaseEl = document.getElementById('quiz-phase');
        const speakBtn = document.getElementById('quiz-speak-btn');

        feedbackEl.textContent = '';
        feedbackEl.className = 'quiz-feedback';
        quizEl.classList.remove('hidden');
        quizEl.classList.add('defense-quiz');
        sfxDefenseQuiz();

        phaseEl.textContent = '⚡ 緊急防禦！答對傷害減半！';
        phaseEl.className = 'quiz-phase defense-phase';

        questionEl.innerHTML = `<span class="quiz-word">${word.en}</span><br>這個單字是什麼意思？`;
        speakBtn.classList.remove('hidden');
        speakBtn.onclick = () => speakWord(word.en);
        speakWord(word.en);

        const allCards = getAllWordCards().filter(w => w.id !== word.id && w.zh !== word.zh);
        const wrongMeanings = shuffleArray(allCards).slice(0, 3).map(w => w.zh);
        const options = shuffleArray([word.zh, ...wrongMeanings]);

        optionsEl.innerHTML = options.map(opt =>
            `<button class="quiz-option defense-opt" data-value="${opt}">${opt}</button>`
        ).join('');
        optionsEl.className = 'quiz-options-grid four-options';

        let timeLeft = 10;
        timerEl.textContent = `⏱️ ${timeLeft}`;
        clearInterval(quizTimer);
        let resolved = false;
        quizTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `⏱️ ${timeLeft}`;
            if (timeLeft <= 3) timerEl.classList.add('timer-urgent');
            if (timeLeft <= 0) {
                clearInterval(quizTimer);
                timerEl.classList.remove('timer-urgent');
                if (!resolved) { resolved = true; finishDefenseQuiz(false, word, quizEl, speakBtn, resolve); }
            }
        }, 1000);

        optionsEl.querySelectorAll('.defense-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                clearInterval(quizTimer);
                timerEl.classList.remove('timer-urgent');
                const correct = btn.dataset.value === word.zh;
                optionsEl.querySelectorAll('.defense-opt').forEach(b => {
                    if (b.dataset.value === word.zh) b.classList.add('correct');
                    else if (b === btn && !correct) b.classList.add('wrong');
                    b.disabled = true;
                });
                finishDefenseQuiz(correct, word, quizEl, speakBtn, resolve);
            });
        });
    });
}

async function finishDefenseQuiz(correct, word, quizEl, speakBtn, resolve) {
    const feedbackEl = document.getElementById('quiz-feedback');
    if (correct) {
        sfxCorrect();
        feedbackEl.textContent = `✅ 防禦成功！${word.en} = ${word.zh}，傷害減半！`;
        feedbackEl.className = 'quiz-feedback correct';
    } else {
        sfxWrong();
        feedbackEl.textContent = `❌ ${word.en} = ${word.zh}`;
        feedbackEl.className = 'quiz-feedback wrong';
        await speakWord(word.en);
    }
    await delay(1200);
    quizEl.classList.add('hidden');
    quizEl.classList.remove('defense-quiz');
    speakBtn.classList.add('hidden');
    resolve(correct ? 0.5 : 0);
}

// ===== 加權選詞（新單字機率×3）=====
function pickWeightedWord() {
    const s = battleState;
    const allWords = getAllWordCards();
    const deckIds = [...new Set([...s.player.deck, ...s.player.hand, ...s.player.discard])];
    const pool = [];
    deckIds.forEach(id => {
        const word = allWords.find(w => w.id === id);
        if (word) {
            const weight = (s.newCardIds && s.newCardIds.includes(id)) ? 3 : 1;
            for (let i = 0; i < weight; i++) pool.push(word);
        }
    });
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function rollAllIntents() {
    battleState.enemies.forEach(e => {
        if (e.hp > 0) e.intent = e.attacks[Math.floor(Math.random() * e.attacks.length)];
    });
}

// ===== 戰鬥結束 =====
function handleVictory() {
    const s = battleState;
    s.enemies.forEach(e => { e.hp = Math.min(e.hp, 0); });
    renderBattle();
    sfxVictory();
    const goldEarned = GAME_CONSTANTS.GOLD_PER_BATTLE + (s.floor * 5);
    const names = s.enemies.map(e => `${e.emoji}${e.name}`).join('、');

    setTimeout(() => {
        const modal = document.getElementById('battle-result-modal');
        modal.querySelector('.result-title').textContent = '🎉 勝利！';
        modal.querySelector('.result-title').className = 'result-title victory';
        modal.querySelector('.result-details').innerHTML = `
            <p>擊敗了 ${names}！</p>
            <p>💰 獲得 ${goldEarned} 金幣</p>
        `;
        modal.classList.remove('hidden');
        if (onBattleEnd) {
            onBattleEnd({
                victory: true, floor: s.floor,
                playerHp: s.player.hp, playerMaxHp: s.player.maxHp,
                goldEarned,
                deck: [...s.player.deck, ...s.player.hand, ...s.player.discard],
                buffs: { strength: s.player.buffs.strength, regen: s.player.buffs.regen, thorns: s.player.buffs.thorns, blockRegen: s.player.buffs.blockRegen },
            });
        }
    }, 600);
}

function handleDefeat() {
    const s = battleState;
    s.player.hp = 0;
    renderBattle();
    sfxDefeat();
    setTimeout(() => {
        const modal = document.getElementById('battle-result-modal');
        modal.querySelector('.result-title').textContent = '💀 戰敗...';
        modal.querySelector('.result-title').className = 'result-title defeat';
        modal.querySelector('.result-details').innerHTML = `
            <p>你在第 ${s.floor} 層戰敗了</p>
        `;
        modal.classList.remove('hidden');
        if (onBattleEnd) onBattleEnd({ victory: false, floor: s.floor });
    }, 600);
}

// ===== 渲染 =====
export function renderBattle() {
    if (!battleState) return;
    const s = battleState;

    document.getElementById('floor-info').textContent = `第 ${s.floor} 層`;

    // Player
    document.getElementById('player-hp-text').textContent = `${Math.max(0, s.player.hp)}/${s.player.maxHp}`;
    document.getElementById('player-hp-fill').style.width = `${(Math.max(0, s.player.hp) / s.player.maxHp) * 100}%`;
    document.getElementById('player-block').textContent = s.player.block > 0 ? `🛡️${s.player.block}` : '';
    document.getElementById('player-energy').textContent = `⚡ ${s.player.energy}/${s.player.maxEnergy}`;

    const buffParts = [];
    if (s.player.buffs.strength > 0) buffParts.push(['strength', s.player.buffs.strength]);
    if (s.player.buffs.regen > 0) buffParts.push(['regen', s.player.buffs.regen]);
    if (s.player.buffs.thorns > 0) buffParts.push(['thorns', s.player.buffs.thorns]);
    if (s.player.buffs.blockRegen > 0) buffParts.push(['blockRegen', s.player.buffs.blockRegen]);
    if (s.player.buffs.vulnerable > 0) buffParts.push(['vulnerable', s.player.buffs.vulnerable]);
    if (s.player.buffs.weak > 0) buffParts.push(['weak', s.player.buffs.weak]);
    if (s.player.buffs.poison > 0) buffParts.push(['poison', s.player.buffs.poison]);
    const buffsEl = document.getElementById('player-buffs');
    buffsEl.innerHTML = buffParts.map(([key, val]) => {
        const info = BUFF_INFO[key];
        return `<span class="buff-tag" data-buff="${key}" data-val="${val}" style="color:${info.color}">${info.emoji}${val}</span>`;
    }).join('');
    buffsEl.querySelectorAll('.buff-tag').forEach(span => {
        span.addEventListener('click', () => showBuffPopup(span.dataset.buff, parseInt(span.dataset.val)));
    });

    // Enemies - 動態產生多敵人
    const enemyArea = document.querySelector('.enemy-area');
    // 保留結構但重新生成內容
    enemyArea.innerHTML = '<div class="enemies-row">' + s.enemies.map((e, i) => {
        const alive = e.hp > 0;
        const isTarget = i === targetEnemyIdx;
        const hpPct = Math.max(0, e.hp) / e.maxHp * 100;

        let eBuff = '';
        if (e.buffs.poison > 0) eBuff += `🧪${e.buffs.poison} `;

        if (e.buffs.strength > 0) eBuff += `💪${e.buffs.strength} `;
        if (e.buffs.vulnerable > 0) eBuff += `⚠️${e.buffs.vulnerable} `;
        if (e.buffs.weak > 0) eBuff += `😵‍💫${e.buffs.weak} `;

        let intentHtml = '';
        if (alive && e.intent) {
            const it = e.intent;
            let t = it.emoji + ' ';
            let detail = ''; // Tooltip 自訂文字
            
            const realDmg = Math.floor((it.damage + e.buffs.strength) * (e.buffs.weak > 0 ? 0.5 : 1));
            
            if (it.damage > 0) {
                t += realDmg;
                detail += `造成 ${realDmg} 點傷害<br>`;
            }
            if (it.block) {
                t += `🛡️${it.block}`;
                detail += `獲得 ${it.block} 點護甲<br>`;
            }
            if (it.heal) {
                t += `💚${it.heal}`;
                detail += `回復 ${it.heal} 點血量<br>`;
            }
            if (it.applyVuln) {
                t += ` ⚠️`;
                detail += `施加 ${it.applyVuln} 回合易傷<br>`;
            }
            if (it.applyWeak) {
                t += ` 😵‍💫`;
                detail += `施加 ${it.applyWeak} 回合虛弱<br>`;
            }
            if (it.buffSelf) {
                t += ` 💪+${it.buffSelf}`;
                detail += `增加 ${it.buffSelf} 點力量<br>`;
            }
            
            intentHtml = `
            <div class="enemy-intent-mini">
                ${t}
                <div class="tooltip-text">${detail || '準備行動'}</div>
            </div>`;
        }

        return `<div class="enemy-unit ${alive ? '' : 'defeated'} ${isTarget ? 'targeted' : ''}" data-enemy-idx="${i}">
            ${intentHtml}
            <div class="enemy-sprite-mini">${alive ? e.emoji : '💀'}</div>
            <div class="enemy-name-mini">${e.name}</div>
            <div class="enemy-hp-bar-mini">
                <div class="enemy-hp-fill-mini" style="width:${hpPct}%"></div>
                <span class="enemy-hp-text-mini">${Math.max(0, e.hp)}/${e.maxHp}</span>
            </div>
            ${e.block > 0 ? `<div class="enemy-block-mini">🛡️${e.block}</div>` : ''}
            <div class="enemy-buffs-mini">${eBuff}</div>
        </div>`;
    }).join('') + '</div>';

    // 敵人點擊選擇目標
    enemyArea.querySelectorAll('.enemy-unit:not(.defeated)').forEach(el => {
        el.addEventListener('click', () => {
            targetEnemyIdx = parseInt(el.dataset.enemyIdx);
            renderBattle();
        });
    });

    // Hand - 顯示單字卡牌（支援拖曳）
    const handEl = document.getElementById('hand-cards');
    handEl.innerHTML = s.player.hand.map((cardId, i) => {
        const card = getAllWordCards().find(c => c.id === cardId);
        if (!card) return '';
        const rarityKey = getCardRarity(card);
        const rarity = RARITY_CONFIG[rarityKey];
        const playable = card.cost <= s.player.energy;
        const typeLabel = { attack: '攻擊', defend: '防禦', skill: '技能', power: '能力' }[card.type];
        const artSvg = getCardArt(card.id);
        return `
            <div class="card ${card.type} ${playable ? 'playable' : 'unplayable'} rarity-${rarityKey}"
                 data-index="${i}" data-card-type="${card.type}" data-id="${card.id}">
                <button class="card-info-btn" data-id="${card.id}">🔍</button>
                <div class="card-cost">${card.cost}</div>
                <div class="card-art">${artSvg}</div>
                <div class="card-type-label">${typeLabel}</div>
                <div class="card-desc">${card.desc.replace('{v}', card.value)}</div>
                <div class="card-rarity" style="color: ${rarity.color}">${rarity.label}</div>
            </div>
        `;
    }).join('');

    setupCardDrag();

    // 手牌資訊按鈕
    handEl.querySelectorAll('.card-info-btn').forEach(btn => {
        const handler = (e) => {
            e.stopPropagation(); e.preventDefault();
            if (window.showCardDetail) window.showCardDetail(btn.dataset.id);
        };
        btn.addEventListener('mousedown', handler);
        btn.addEventListener('touchstart', handler);
        btn.addEventListener('click', handler);
    });

    document.getElementById('deck-count').textContent = `📚 ${s.player.deck.length}`;
    document.getElementById('discard-count').textContent = `🗑️ ${s.player.discard.length}`;

    const logEl = document.getElementById('battle-log');
    logEl.innerHTML = s.battleLog.slice(-6).map(l => `<div class="log-entry">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
}

// ===== 卡牌拖曳系統 =====
function setupCardDrag() {
    const cards = document.querySelectorAll('#hand-cards .card.playable');
    cards.forEach(card => {
        let ghost = null;
        let startX, startY;
        const onStart = (e) => {
            if (animating) return;
            e.preventDefault();
            const pt = e.touches ? e.touches[0] : e;
            startX = pt.clientX; startY = pt.clientY;
            ghost = card.cloneNode(true);
            ghost.className = 'card-ghost';
            ghost.style.cssText = `position:fixed;left:${startX - 40}px;top:${startY - 50}px;width:80px;pointer-events:none;z-index:999;opacity:0.85;transform:scale(0.8);`;
            document.body.appendChild(ghost);
            card.classList.add('dragging');
            // 高亮放置區
            const type = card.dataset.cardType;
            if (type === 'attack') {
                document.querySelectorAll('.enemy-unit:not(.defeated)').forEach(e => e.classList.add('drop-target'));
            } else {
                document.querySelector('.player-area')?.classList.add('drop-target');
            }
            
            // 動態綁定全域拖曳監聽，避免記憶體與效能問題
            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchend', onEnd);
        };
        const onMove = (e) => {
            if (!ghost) return;
            e.preventDefault();
            const pt = e.touches ? e.touches[0] : e;
            ghost.style.left = `${pt.clientX - 40}px`;
            ghost.style.top = `${pt.clientY - 50}px`;
        };
        const onEnd = (e) => {
            if (!ghost) return;
            const pt = e.changedTouches ? e.changedTouches[0] : e;
            ghost.remove(); ghost = null;
            card.classList.remove('dragging');
            document.querySelectorAll('.drop-target').forEach(e => e.classList.remove('drop-target'));

            // 拖曳結束後移除全域監聽
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);

            // 檢查放置目標
            const dropEl = document.elementFromPoint(pt.clientX, pt.clientY);
            const type = card.dataset.cardType;
            const idx = parseInt(card.dataset.index);

            if (type === 'attack') {
                const enemyUnit = dropEl?.closest('.enemy-unit:not(.defeated)');
                if (enemyUnit) {
                    targetEnemyIdx = parseInt(enemyUnit.dataset.enemyIdx);
                    playCard(idx);
                }
            } else {
                const playerArea = dropEl?.closest('.player-area');
                if (playerArea) playCard(idx);
            }
        };

        card.addEventListener('mousedown', onStart);
        card.addEventListener('touchstart', onStart, { passive: false });

        // 點擊仍然可以出牌（向下相容）
        card.addEventListener('click', (e) => {
            if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
                playCard(parseInt(card.dataset.index));
            }
        });
    });
}

// ===== 卡牌獎勵 =====
export function showCardReward(currentDeck, vocabDifficulty, callback) {
    // 從家長啟用的卡片中挑選獎勵
    const owned = new Set(currentDeck);
    const activeCards = getActiveWordCards();
    const available = activeCards.filter(c => c.difficulty <= vocabDifficulty && !owned.has(c.id));
    const pool = available.length >= 3 ? available : activeCards.filter(c => c.difficulty <= vocabDifficulty);

    const choices = shuffleArray([...pool]).slice(0, GAME_CONSTANTS.REWARD_CARD_CHOICES);

    const modal = document.getElementById('reward-modal');
    const container = modal.querySelector('.reward-cards');
    const typeLabels = { attack: '⚔️攻擊', defend: '🛡️防禦', skill: '✨技能', power: '💜能力' };
    container.innerHTML = choices.map(card => {
        const rarityKey = getCardRarity(card);
        const rarity = RARITY_CONFIG[rarityKey];
        const artSvg = getCardArt(card.id);
        return `
            <div class="de-card rarity-${rarityKey}" data-id="${card.id}" style="border-color:${rarity.color}">
                <div class="de-card-top" style="background:${rarity.color}">
                    <div class="de-card-cost">${card.cost}</div>
                    <div class="de-card-name">${card.en}</div>
                </div>
                <div class="de-card-art">${artSvg}</div>
                <div class="de-card-desc">
                    <span class="de-card-zh">${card.zh}</span><br>
                    ${card.desc.replace('{v}', card.value)}
                </div>
                <div class="de-card-footer">${typeLabels[card.type]} · ${rarity.label}</div>
                <button class="card-info-btn" data-id="${card.id}">🔍</button>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');

    let picked = false;
    container.querySelectorAll('.de-card').forEach(el => {
        const infoBtn = el.querySelector('.card-info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.showCardDetail) window.showCardDetail(infoBtn.dataset.id);
            });
        }

        el.addEventListener('click', async () => {
            if (picked) return;
            picked = true;
            modal.classList.add('hidden');
            const cardId = el.dataset.id;
            const card = WORD_CARDS.find(c => c.id === cardId);
            if (card) await speakWord(card.en);
            callback(cardId);
        });
    });

    // 跳過按鈕 - 用 cloneNode 清除舊 listener
    const skipBtn = modal.querySelector('.skip-reward');
    const newSkip = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);
    newSkip.addEventListener('click', () => {
        modal.classList.add('hidden');
        callback(null);
    });
}

// ===== 工具函數 =====
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function addLog(msg) {
    if (battleState) battleState.battleLog.push(msg);
}

function hitAnimation(selector) {
    const el = document.querySelector(selector);
    if (el) { el.classList.add('anim-hit'); setTimeout(() => el.classList.remove('anim-hit'), 400); }
}

function renderDeckDiscards() {
    if (!battleState) return;
    const s = battleState;
    const deckEl = document.getElementById('deck-count');
    const discardEl = document.getElementById('discard-count');
    if (deckEl) deckEl.textContent = `📚 ${s.player.deck.length}`;
    if (discardEl) discardEl.textContent = `🗑️ ${s.player.discard.length}`;
}

function shakeElement(selector) {
    const el = document.querySelector(selector);
    if (el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); }
}

function screenShake() {
    const screen = document.getElementById('battle-screen');
    if (screen) { screen.classList.add('screen-shake'); setTimeout(() => screen.classList.remove('screen-shake'), 350); }
}

// 戰鬥特效
function showFx(emoji, cssClass) {
    const fxLayer = document.getElementById('battle-fx');
    if (!fxLayer) return;
    const el = document.createElement('div');
    el.className = cssClass;
    el.textContent = emoji;
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function playAttackFx() {
    const targetEl = document.querySelector('.enemy-unit.targeted');
    if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'fx-slash';
        el.textContent = '⚔️';
        el.style.position = 'fixed';
        el.style.left = (rect.left + rect.width / 2) + 'px';
        el.style.top = (rect.top + rect.height / 2) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 400);
    } else {
        showFx('⚔️', 'fx-slash');
    }
    const playerSprite = document.querySelector('.player-sprite');
    if (playerSprite) { playerSprite.classList.add('anim-attack'); setTimeout(() => playerSprite.classList.remove('anim-attack'), 400); }
}

function showFloatingNumber(value, target, type = 'damage') {
    const fxLayer = document.getElementById('battle-fx');
    if (!fxLayer) return;
    const el = document.createElement('div');
    el.className = target === 'enemy' ? 'fx-hit-enemy' : 'fx-hit-player';
    if (type === 'block') el.classList.add('fx-block-num');
    if (type === 'heal') el.classList.add('fx-heal-num');
    el.textContent = type === 'damage' ? `-${value}` : type === 'heal' ? `+${value}` : `🛡️${value}`;
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// ===== 狀態增減益浮動特效 =====
function showStatusFx(targetEl, emoji, label, color) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'status-fx';
    el.innerHTML = `${emoji}<span class="status-label" style="color:${color}">${label}</span>`;
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function glowElement(el, cssClass, duration = 600) {
    if (!el) return;
    el.classList.add(cssClass);
    setTimeout(() => el.classList.remove(cssClass), duration);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== 飛行道具動畫 =====
function animateProjectile(startEl, endEl, emojiName) {
    return new Promise(resolve => {
        if (!startEl || !endEl) return resolve();
        
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();
        
        const proj = document.createElement('div');
        proj.className = 'projectile';
        proj.textContent = emojiName;
        
        // 初始位置設定在發射者中心
        const startX = startRect.left + startRect.width / 2 - 20; // 減去寬度一半微調
        const startY = startRect.top + startRect.height / 2 - 20;
        
        proj.style.left = startX + 'px';
        proj.style.top = startY + 'px';
        proj.style.transform = `translate(0, 0)`;
        
        document.body.appendChild(proj);
        
        // 強制重繪確保初始位置正確
        proj.getBoundingClientRect();
        
        // 計算終點與旋轉角度
        const deltaX = endRect.left + endRect.width / 2 - 20 - startX;
        const deltaY = endRect.top + endRect.height / 2 - 20 - startY;
        
        // 加入旋轉增添動態感
        const rotate = deltaX > 0 ? 360 : -360; 
        
        proj.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`;
        
        // 等待動畫結束後移除並 Resolve
        setTimeout(() => {
            proj.remove();
            resolve();
        }, 400); // 與 CSS transition 400ms 對齊
    });
}

export function getBattleState() {
    return battleState;
}

// ===== 戰鬥中查看牌庫/棄牌堆 =====
export function showBattleDeckModal(type) {
    if (!battleState || animating) return;
    const s = battleState;
    const modal = document.getElementById('deck-modal');
    const container = modal.querySelector('.deck-cards');
    const title = modal.querySelector('.deck-title');
    
    let sourceArr = [];
    if (type === 'deck') {
        title.innerHTML = `📚 牌庫剩餘卡牌 (${s.player.deck.length}張)`;
        sourceArr = [...s.player.deck]; 
    } else {
        title.innerHTML = `🗑️ 棄牌堆 (${s.player.discard.length}張)`;
        sourceArr = [...s.player.discard]; 
    }
    
    // 反轉陣列讓最新/即將抽到的顯示在最上方
    container.innerHTML = sourceArr.reverse().map(cardId => {
        const card = getAllWordCards().find(c => c.id === cardId);
        if (!card) return '';
        const rarityKey = getCardRarity(card);
        const rarity = RARITY_CONFIG[rarityKey];
        const art = getCardArt(card.id);
        return `<div class="de-card rarity-${rarityKey}" style="border-color:${rarity.color}; cursor:pointer" onclick="if(window.showCardDetail) window.showCardDetail('${card.id}')">
            <div class="de-card-top" style="background:${rarity.color}">
                <div class="de-card-cost">${card.cost}</div>
                <div class="de-card-name">${card.en}</div>
            </div>
            <div class="de-card-art">${art}</div>
            <div class="de-card-desc">
                <span class="de-card-zh">${card.zh}</span><br>
                ${card.desc.replace('{v}', card.value)}
            </div>
        </div>`;
    }).join('');
    
    modal.classList.remove('hidden');
}

// 綁定點擊事件
document.getElementById('deck-count').addEventListener('click', () => showBattleDeckModal('deck'));
document.getElementById('discard-count').addEventListener('click', () => showBattleDeckModal('discard'));
