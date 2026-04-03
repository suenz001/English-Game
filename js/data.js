// ===== 卡牌效果類型 =====
export const CARD_TYPES = {
    ATTACK: 'attack',
    DEFEND: 'defend',
    SKILL: 'skill',
    POWER: 'power'
};

// ===== 每個英文單字 = 一張卡牌 =====
// type: attack/defend/skill/power
// cost: 能量消耗
// value: 效果數值（傷害/護甲/回復量）
// extra: 額外效果
export const WORD_CARDS = [
    // ============================
    //   難度 1 - 基礎單字 (Floor 1-3)
    // ============================

    // ============================
    //   特定考題單字 (放在最上層)
    // ============================
    { id: 'sleep', en: 'sleep', zh: '睡覺', difficulty: 1, rarity: 'common', type: 'skill', cost: 0, value: 1, emoji: '😴', desc: '安穩入睡，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'trying', en: 'trying', zh: '嘗試', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '💦', desc: '努力嘗試，抽 {v} 張牌', extra: { draw: true } },
    { id: 'quiet', en: 'quiet', zh: '安靜的', difficulty: 1, rarity: 'epic', type: 'power', cost: 1, value: 3, emoji: '🤫', desc: '保持安靜，受擊反彈 {v} 傷害', extra: { thorns: true } },
    { id: 'please', en: 'please', zh: '請', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🙏', desc: '禮貌請求，抽 {v} 張牌', extra: { draw: true } },
    { id: 'count', en: 'count', zh: '計算', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🔢', desc: '數數，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'sheep', en: 'sheep', zh: '綿羊', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '🐑', desc: '軟綿綿的羊毛，獲得 {v} 點護甲' },
    { id: 'jumping', en: 'jumping', zh: '跳躍', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '🦘', desc: '跳躍重壓，造成 {v} 點傷害' },
    { id: 'farm', en: 'farm', zh: '農場', difficulty: 1, rarity: 'rare', type: 'defend', cost: 2, value: 10, emoji: '🚜', desc: '廣大農場庇護，獲得 {v} 點護甲' },
    { id: 'cats', en: 'cats', zh: '貓咪們', difficulty: 1, rarity: 'rare', type: 'attack', cost: 2, value: 5, emoji: '🐈', desc: '群貓亂爪，每次造成 {v} 點傷害，共攻擊兩次', extra: { hits: 2 } },
    { id: 'catch', en: 'catch', zh: '抓', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '🧤', desc: '用力伸手抓取，造成 {v} 點傷害' },
    { id: 'mice', en: 'mice', zh: '老鼠們', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 3, emoji: '🐁', desc: '老鼠啃咬，造成 {v} 點傷害，並給予 1 回合虛弱', extra: { weak: 1 } },
    { id: 'milk', en: 'milk', zh: '牛奶', difficulty: 1, rarity: 'common', type: 'skill', cost: 0, value: 1, emoji: '🥛', desc: '營養補充，抽 {v} 張牌', extra: { draw: true } },
    { id: 'cows', en: 'cows', zh: '乳牛們', difficulty: 1, rarity: 'rare', type: 'defend', cost: 2, value: 10, emoji: '🐄', desc: '牛群擋路，獲得 {v} 點護甲' },
    { id: 'goodnight', en: 'goodnight', zh: '晚安', difficulty: 1, rarity: 'rare', type: 'defend', cost: 3, value: 11, emoji: '🌃', desc: '晚安曲，獲得 {v} 點護甲並抽 1 張牌', extra: { draw: 1 } },
    { id: 'town', en: 'town', zh: '城鎮', difficulty: 1, rarity: 'common', type: 'defend', cost: 2, value: 9, emoji: '🏘️', desc: '城鎮防禦牆，獲得 {v} 點護甲' },
    { id: 'city', en: 'city', zh: '城市', difficulty: 1, rarity: 'rare', type: 'defend', cost: 3, value: 14, emoji: '🏙️', desc: '堅固的城市建築，獲得 {v} 點護甲' },
    { id: 'park', en: 'park', zh: '公園', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🏞️', desc: '在公園放鬆，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'apartment', en: 'apartment', zh: '公寓', difficulty: 1, rarity: 'common', type: 'defend', cost: 2, value: 9, emoji: '🏢', desc: '躲進公寓，獲得 {v} 點護甲' },
    { id: 'store', en: 'store', zh: '商店', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🏪', desc: '去商店補貨，抽 {v} 張牌', extra: { draw: true } },
    { id: 'hospital', en: 'hospital', zh: '醫院', difficulty: 1, rarity: 'epic', type: 'power', cost: 2, value: 5, emoji: '🏥', desc: '醫院治療，每回合獲得 {v} 點護甲', extra: { blockRegen: true } },
    { id: 'cafe', en: 'cafe', zh: '咖啡廳', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '☕', desc: '喝杯咖啡，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'street', en: 'street', zh: '街道', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '🛣️', desc: '街頭衝突，造成 {v} 點傷害' },
    { id: 'food', en: 'food', zh: '食物', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🍔', desc: '品嚐美食，抽 {v} 張牌', extra: { draw: true } },
    { id: 'shoe', en: 'shoe', zh: '鞋子', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '👞', desc: '飛鞋攻擊，造成 {v} 點傷害' },
    { id: 'pet', en: 'pet', zh: '寵物', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '🐕', desc: '寵物護主，獲得 {v} 點護甲' },
    { id: 'flower', en: 'flower', zh: '花', difficulty: 1, rarity: 'common', type: 'skill', cost: 0, value: 1, emoji: '🌸', desc: '花之芬芳，抽 {v} 張牌', extra: { draw: true } },
    { id: 'clothes', en: 'clothes', zh: '衣服', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '👕', desc: '厚重衣服防禦，獲得 {v} 點護甲' },
    { id: 'toy', en: 'toy', zh: '玩具', difficulty: 1, rarity: 'common', type: 'skill', cost: 0, value: 1, emoji: '🧸', desc: '玩玩具，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'shop', en: 'shop', zh: '商店', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🛒', desc: '購物狂歡，抽 {v} 張牌', extra: { draw: true } },
    { id: 'under', en: 'under', zh: '在下面', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '⬇️', desc: '躲在下面，獲得 {v} 點護甲' },
    { id: 'on', en: 'on', zh: '在上面', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '🔛', desc: '居高臨下攻擊，造成 {v} 點傷害' },
    { id: 'in', en: 'in', zh: '在裡面', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '📥', desc: '躲藏在裡面，獲得 {v} 點護甲' },
    { id: 'next to', en: 'next to', zh: '在旁邊', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '↔️', desc: '旁敲側擊，抽 {v} 張牌', extra: { draw: true } },
    { id: 'in front of', en: 'in front of', zh: '在前面', difficulty: 1, rarity: 'rare', type: 'attack', cost: 2, value: 10, emoji: '🚏', desc: '正面重擊，造成 {v} 點傷害' },
    { id: 'behind', en: 'behind', zh: '在後面', difficulty: 1, rarity: 'rare', type: 'defend', cost: 2, value: 10, emoji: '🔙', desc: '躲在背後，獲得 {v} 點護甲' },
    { id: 'between', en: 'between', zh: '在中間', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '🥪', desc: '中庸之道，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'book', en: 'book', zh: '書', difficulty: 1, rarity: 'common', type: 'skill', cost: 1, value: 2, emoji: '📖', desc: '閱讀知識，抽 {v} 張牌', extra: { draw: true } },
    { id: 'armchair', en: 'armchair', zh: '扶手椅', difficulty: 1, rarity: 'common', type: 'defend', cost: 2, value: 9, emoji: '🛋️', desc: '舒服地坐著，獲得 {v} 點護甲' },
    { id: 'lamp', en: 'lamp', zh: '檯燈', difficulty: 1, rarity: 'common', type: 'skill', cost: 0, value: 1, emoji: '🪔', desc: '點亮檯燈，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'couch', en: 'couch', zh: '沙發', difficulty: 1, rarity: 'common', type: 'defend', cost: 2, value: 9, emoji: '🪑', desc: '躺在沙發上，獲得 {v} 點護甲' },
    { id: 'table', en: 'table', zh: '桌子', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '🪚', desc: '躲進桌下，獲得 {v} 點護甲' },
    { id: 'cupboard', en: 'cupboard', zh: '櫥櫃', difficulty: 1, rarity: 'common', type: 'defend', cost: 2, value: 9, emoji: '🗄️', desc: '躲進櫃子，獲得 {v} 點護甲' },
    { id: 'bag', en: 'bag', zh: '書包', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '🎒', desc: '書包擋住，獲得 {v} 點護甲' },
    { id: 'pencil', en: 'pencil', zh: '鉛筆', difficulty: 1, rarity: 'common', type: 'attack', cost: 1, value: 5, emoji: '✏️', desc: '飛流直下三千筆，造成 {v} 點傷害' },
    { id: 'chair', en: 'chair', zh: '椅子', difficulty: 1, rarity: 'common', type: 'defend', cost: 1, value: 5, emoji: '🪑', desc: '舉起椅子防禦，獲得 {v} 點護甲' },

    // --- 攻擊牌 ---
    { id: 'cat', en: 'cat', zh: '貓', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '🐱',
      desc: '貓爪攻擊，造成 {v} 點傷害' },
    { id: 'dog', en: 'dog', zh: '狗', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '🐶',
      desc: '狗咬攻擊，造成 {v} 點傷害' },
    { id: 'bird', en: 'bird', zh: '鳥', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '🐦',
      desc: '鳥啄攻擊，造成 {v} 點傷害' },
    { id: 'fish', en: 'fish', zh: '魚', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '🐟',
      desc: '魚尾拍擊，造成 {v} 點傷害' },
    { id: 'lion', en: 'lion', zh: '獅子', difficulty: 1, rarity: 'rare',
      type: 'attack', cost: 2, value: 10, emoji: '🦁',
      desc: '獅子猛擊，造成 {v} 點傷害' },
    { id: 'bear', en: 'bear', zh: '熊', difficulty: 1, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '🐻',
      desc: '熊掌拍擊，造成 {v} 點傷害' },
    { id: 'fire', en: 'fire', zh: '火', difficulty: 1, rarity: 'rare',
      type: 'attack', cost: 1, value: 4, emoji: '🔥',
      desc: '火焰攻擊，造成 {v} 點傷害，並給予 2 層毒', extra: { poison: 2 } },
    { id: 'kick', en: 'kick', zh: '踢', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 0, value: 2, emoji: '🦶',
      desc: '輕踢，造成 {v} 點傷害' },
    { id: 'hit', en: 'hit', zh: '打', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '👊',
      desc: '揮拳攻擊，造成 {v} 點傷害' },
    { id: 'bee', en: 'bee', zh: '蜜蜂', difficulty: 1, rarity: 'rare',
      type: 'attack', cost: 1, value: 4, emoji: '🐝',
      desc: '蜜蜂螫刺，造成 {v} 點傷害，並給予 2 層毒', extra: { poison: 2 } },
    { id: 'egg', en: 'egg', zh: '蛋', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 0, value: 2, emoji: '🥚',
      desc: '丟蛋！造成 {v} 點傷害' },
    { id: 'red', en: 'red', zh: '紅色', difficulty: 1, rarity: 'common',
      type: 'attack', cost: 1, value: 5, emoji: '🔴',
      desc: '紅色能量彈，造成 {v} 點傷害' },

    // --- 防禦牌 ---
    { id: 'hat', en: 'hat', zh: '帽子', difficulty: 1, rarity: 'common',
      type: 'defend', cost: 1, value: 5, emoji: '🎩',
      desc: '魔法帽防禦，獲得 {v} 點護甲' },
    { id: 'cup', en: 'cup', zh: '杯子', difficulty: 1, rarity: 'common',
      type: 'defend', cost: 1, value: 5, emoji: '🥤',
      desc: '杯子盾牌，獲得 {v} 點護甲' },
    { id: 'box', en: 'box', zh: '盒子', difficulty: 1, rarity: 'common',
      type: 'defend', cost: 1, value: 5, emoji: '📦',
      desc: '躲進箱子，獲得 {v} 點護甲' },
    { id: 'bed', en: 'bed', zh: '床', difficulty: 1, rarity: 'common',
      type: 'defend', cost: 1, value: 5, emoji: '🛏️',
      desc: '棉被防禦，獲得 {v} 點護甲' },

    { id: 'door', en: 'door', zh: '門', difficulty: 1, rarity: 'rare',
      type: 'defend', cost: 2, value: 10, emoji: '🚪',
      desc: '關門防禦，獲得 {v} 點護甲' },
    { id: 'ice', en: 'ice', zh: '冰', difficulty: 1, rarity: 'rare',
      type: 'defend', cost: 1, value: 4, emoji: '🧊',
      desc: '冰牆防禦，獲得 {v} 點護甲並抽 1 張牌', extra: { draw: 1 } },
    { id: 'tree', en: 'tree', zh: '樹', difficulty: 1, rarity: 'rare',
      type: 'defend', cost: 2, value: 10, emoji: '🌳',
      desc: '大樹守護，獲得 {v} 點護甲' },

    // --- 技能牌 ---
    { id: 'sun', en: 'sun', zh: '太陽', difficulty: 1, rarity: 'common',
      type: 'skill', cost: 1, value: 2, emoji: '☀️',
      desc: '太陽充能，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'moon', en: 'moon', zh: '月亮', difficulty: 1, rarity: 'rare',
      type: 'skill', cost: 1, value: 2, emoji: '🌙',
      desc: '月光指引，抽 {v} 張牌', extra: { draw: true } },
    { id: 'star', en: 'star', zh: '星星', difficulty: 1, rarity: 'rare',
      type: 'skill', cost: 0, value: 1, emoji: '⭐',
      desc: '星光充能，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'rain', en: 'rain', zh: '雨', difficulty: 1, rarity: 'common',
      type: 'skill', cost: 1, value: 2, emoji: '🌧️',
      desc: '雨水靈感，抽 {v} 張牌', extra: { draw: true } },
    { id: 'eye', en: 'eye', zh: '眼睛', difficulty: 1, rarity: 'common',
      type: 'skill', cost: 1, value: 2, emoji: '👁️',
      desc: '銳利之眼，抽 {v} 張牌', extra: { draw: true } },
    { id: 'run', en: 'run', zh: '跑', difficulty: 1, rarity: 'common',
      type: 'skill', cost: 0, value: 1, emoji: '🏃',
      desc: '加速衝刺，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'cake', en: 'cake', zh: '蛋糕', difficulty: 1, rarity: 'rare',
      type: 'skill', cost: 1, value: 2, emoji: '🎂',
      desc: '美味甜點，獲得 {v} 點能量', extra: { energy: true } },


    // ============================
    //   難度 2 - 進階單字 (Floor 4-6)
    // ============================

    // --- 攻擊牌 ---
    { id: 'sword', en: 'sword', zh: '劍', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '⚔️',
      desc: '揮劍斬擊，造成 {v} 點傷害' },
    { id: 'arrow', en: 'arrow', zh: '箭', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '🏹',
      desc: '射箭攻擊，造成 {v} 點傷害' },
    { id: 'snake', en: 'snake', zh: '蛇', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 1, value: 4, emoji: '🐍',
      desc: '毒蛇咬擊，造成 {v} 點傷害，並給予 3 層毒', extra: { poison: 3 } },
    { id: 'tiger', en: 'tiger', zh: '老虎', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 2, value: 12, emoji: '🐯',
      desc: '猛虎撲擊，造成 {v} 點傷害' },
    { id: 'shark', en: 'shark', zh: '鯊魚', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 2, value: 12, emoji: '🦈',
      desc: '鯊魚衝撞，造成 {v} 點傷害' },
    { id: 'eagle', en: 'eagle', zh: '老鷹', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '🦅',
      desc: '鷹爪攻擊，造成 {v} 點傷害' },
    { id: 'flame', en: 'flame', zh: '火焰', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 2, value: 9, emoji: '🔥',
      desc: '烈焰攻擊，造成 {v} 點傷害，並給予 3 層毒', extra: { poison: 3 } },
    { id: 'storm', en: 'storm', zh: '暴風', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 2, value: 6, emoji: '🌪️',
      desc: '暴風攻擊，每次造成 {v} 點傷害，隨機攻擊兩次', extra: { hits: 2 } },
    { id: 'knife', en: 'knife', zh: '刀', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 0, value: 3, emoji: '🔪',
      desc: '飛刀攻擊，造成 {v} 點傷害' },
    { id: 'angry', en: 'angry', zh: '生氣的', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 4, emoji: '😡',
      desc: '憤怒一擊，造成 {v} 點傷害，並給予 2 回合虛弱', extra: { weak: 2 } },
    { id: 'brave', en: 'brave', zh: '勇敢的', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '💪',
      desc: '勇氣之擊，造成 {v} 點傷害' },
    { id: 'horse', en: 'horse', zh: '馬', difficulty: 2, rarity: 'epic',
      type: 'attack', cost: 1, value: 5, emoji: '🐴',
      desc: '戰馬衝鋒，造成 {v} 點傷害，並給予 2 回合易傷', extra: { vulnerable: 2 } },
    { id: 'stone', en: 'stone', zh: '石頭', difficulty: 2, rarity: 'rare',
      type: 'attack', cost: 1, value: 6, emoji: '🪨',
      desc: '投石攻擊，造成 {v} 點傷害' },

    // --- 防禦牌 ---
    { id: 'shield', en: 'shield', zh: '盾牌', difficulty: 2, rarity: 'rare',
      type: 'defend', cost: 1, value: 6, emoji: '🛡️',
      desc: '舉起盾牌，獲得 {v} 點護甲' },
    { id: 'armor', en: 'armor', zh: '盔甲', difficulty: 2, rarity: 'epic',
      type: 'defend', cost: 2, value: 12, emoji: '🦺',
      desc: '穿上盔甲，獲得 {v} 點護甲' },
    { id: 'tower', en: 'tower', zh: '塔', difficulty: 2, rarity: 'rare',
      type: 'defend', cost: 2, value: 10, emoji: '🏰',
      desc: '塔樓防禦，獲得 {v} 點護甲' },
    { id: 'cloud', en: 'cloud', zh: '雲', difficulty: 2, rarity: 'epic',
      type: 'defend', cost: 1, value: 5, emoji: '☁️',
      desc: '雲霧隱身，獲得 {v} 點護甲並抽 1 張牌', extra: { draw: 1 } },
    { id: 'house', en: 'house', zh: '房子', difficulty: 2, rarity: 'epic',
      type: 'defend', cost: 2, value: 12, emoji: '🏠',
      desc: '躲進房子，獲得 {v} 點護甲' },
    { id: 'pond', en: 'pond', zh: '池塘', difficulty: 2, rarity: 'rare',
      type: 'defend', cost: 1, value: 4, emoji: '🌊',
      desc: '池塘水盾，獲得 {v} 點護甲並抽 1 張牌', extra: { draw: 1 } },
    { id: 'forest', en: 'forest', zh: '森林', difficulty: 2, rarity: 'rare',
      type: 'defend', cost: 1, value: 6, emoji: '🌲',
      desc: '森林藏身，獲得 {v} 點護甲' },
    { id: 'wall', en: 'wall', zh: '牆壁', difficulty: 2, rarity: 'epic',
      type: 'defend', cost: 2, value: 12, emoji: '🧱',
      desc: '高牆防禦，獲得 {v} 點護甲' },

    // --- 技能牌 ---
    { id: 'apple', en: 'apple', zh: '蘋果', difficulty: 2, rarity: 'rare',
      type: 'skill', cost: 1, value: 2, emoji: '🍎',
      desc: '健康蘋果，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'water', en: 'water', zh: '水', difficulty: 2, rarity: 'epic',
      type: 'skill', cost: 1, value: 3, emoji: '💧',
      desc: '泉水湧現，抽 {v} 張牌', extra: { draw: true } },
    { id: 'music', en: 'music', zh: '音樂', difficulty: 2, rarity: 'rare',
      type: 'skill', cost: 1, value: 2, emoji: '🎵',
      desc: '旋律指引，抽 {v} 張牌', extra: { draw: true } },
    { id: 'magic', en: 'magic', zh: '魔法', difficulty: 2, rarity: 'epic',
      type: 'skill', cost: 0, value: 2, emoji: '✨',
      desc: '魔力充填，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'light', en: 'light', zh: '光', difficulty: 2, rarity: 'epic',
      type: 'skill', cost: 1, value: 3, emoji: '💡',
      desc: '光芒照耀，抽 {v} 張牌', extra: { draw: true } },
    { id: 'happy', en: 'happy', zh: '快樂的', difficulty: 2, rarity: 'rare',
      type: 'skill', cost: 1, value: 2, emoji: '😊',
      desc: '快樂共鳴，獲得 {v} 點能量並抽 1 張牌', extra: { energy: true, bonusDraw: 1 } },
    { id: 'dream', en: 'dream', zh: '夢', difficulty: 2, rarity: 'rare',
      type: 'skill', cost: 0, value: 1, emoji: '💭',
      desc: '美夢能量，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'candy', en: 'candy', zh: '糖果', difficulty: 2, rarity: 'rare',
      type: 'skill', cost: 0, value: 1, emoji: '🍬',
      desc: '糖果亢奮，抽 {v} 張牌', extra: { draw: true } },

    // --- 能力牌 ---
    { id: 'crown', en: 'crown', zh: '皇冠', difficulty: 2, rarity: 'epic',
      type: 'power', cost: 2, value: 4, emoji: '👑',
      desc: '國王之冠，本場攻擊力 +{v}', extra: { permAtk: true } },
    { id: 'heart', en: 'heart', zh: '心', difficulty: 2, rarity: 'epic',
      type: 'power', cost: 2, value: 4, emoji: '❤️',
      desc: '生命之心，每回合獲得 {v} 點護甲', extra: { blockRegen: true } },
    { id: 'rose', en: 'rose', zh: '玫瑰', difficulty: 2, rarity: 'epic',
      type: 'power', cost: 1, value: 3, emoji: '🌹',
      desc: '荊棘玫瑰，受擊反彈 {v} 傷害', extra: { thorns: true } },

    // ============================
    //   難度 3 - 挑戰單字 (Floor 7-10)
    // ============================

    // --- 攻擊牌 ---
    { id: 'dragon', en: 'dragon', zh: '龍', difficulty: 3, rarity: 'legendary',
      type: 'attack', cost: 2, value: 14, emoji: '🐉',
      desc: '巨龍吐息，造成 {v} 點傷害' },
    { id: 'thunder', en: 'thunder', zh: '雷', difficulty: 3, rarity: 'legendary',
      type: 'attack', cost: 3, value: 18, emoji: '⚡',
      desc: '雷霆萬鈞，造成 {v} 點傷害' },
    { id: 'warrior', en: 'warrior', zh: '戰士', difficulty: 3, rarity: 'legendary',
      type: 'attack', cost: 2, value: 7, emoji: '⚔️',
      desc: '戰士連擊，每次造成 {v} 點傷害，共攻擊兩次', extra: { hits: 2 } },
    { id: 'monster', en: 'monster', zh: '怪物', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 2, value: 12, emoji: '👾',
      desc: '怪物猛擊，造成 {v} 點傷害' },
    { id: 'volcano', en: 'volcano', zh: '火山', difficulty: 3, rarity: 'legendary',
      type: 'attack', cost: 3, value: 13, emoji: '🌋',
      desc: '火山爆發，造成 {v} 點傷害，並給予 5 層毒', extra: { poison: 5 } },
    { id: 'hammer', en: 'hammer', zh: '鐵鎚', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 2, value: 12, emoji: '🔨',
      desc: '巨鎚重擊，造成 {v} 點傷害' },
    { id: 'spider', en: 'spider', zh: '蜘蛛', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 1, value: 3, emoji: '🕷️',
      desc: '蜘蛛毒咬，造成 {v} 點傷害，並給予 4 層毒', extra: { poison: 4 } },
    { id: 'battle', en: 'battle', zh: '戰鬥', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 1, value: 7, emoji: '💥',
      desc: '全力戰鬥，造成 {v} 點傷害' },
    { id: 'pirate', en: 'pirate', zh: '海盜', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 1, value: 7, emoji: '🏴‍☠️',
      desc: '海盜突襲，造成 {v} 點傷害' },
    { id: 'rocket', en: 'rocket', zh: '火箭', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 2, value: 12, emoji: '🚀',
      desc: '火箭發射，造成 {v} 點傷害' },
    { id: 'strong', en: 'strong', zh: '強壯的', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 1, value: 5, emoji: '💪',
      desc: '力量爆發，造成 {v} 點傷害，並給予 2 回合易傷', extra: { vulnerable: 2 } },
    { id: 'wolf', en: 'wolf', zh: '狼', difficulty: 3, rarity: 'epic',
      type: 'attack', cost: 1, value: 5, emoji: '🐺',
      desc: '狼牙撕咬，造成 {v} 點傷害，並給予 2 回合虛弱', extra: { weak: 2 } },

    // --- 防禦牌 ---
    { id: 'castle', en: 'castle', zh: '城堡', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 2, value: 12, emoji: '🏰',
      desc: '城堡守護，獲得 {v} 點護甲' },
    { id: 'mountain', en: 'mountain', zh: '山', difficulty: 3, rarity: 'legendary',
      type: 'defend', cost: 3, value: 18, emoji: '⛰️',
      desc: '高山屏障，獲得 {v} 點護甲' },
    { id: 'island', en: 'island', zh: '島嶼', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 2, value: 12, emoji: '🏝️',
      desc: '島嶼結界，獲得 {v} 點護甲' },
    { id: 'diamond', en: 'diamond', zh: '鑽石', difficulty: 3, rarity: 'legendary',
      type: 'defend', cost: 2, value: 9, emoji: '💎',
      desc: '鑽石護盾，獲得 {v} 點護甲，並施加 5 反傷（持續 3 回合）', extra: { reflect: 5, reflectTurns: 3 } },
    { id: 'bridge', en: 'bridge', zh: '橋', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 1, value: 7, emoji: '🌉',
      desc: '橋樑防禦，獲得 {v} 點護甲' },
    { id: 'garden', en: 'garden', zh: '花園', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 1, value: 3, emoji: '🌺',
      desc: '花園守護，獲得 {v} 點護甲並抽 2 張牌', extra: { draw: 2 } },
    { id: 'helmet', en: 'helmet', zh: '頭盔', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 1, value: 7, emoji: '⛑️',
      desc: '戰盔防禦，獲得 {v} 點護甲' },
    { id: 'umbrella', en: 'umbrella', zh: '雨伞', difficulty: 3, rarity: 'epic',
      type: 'defend', cost: 1, value: 5, emoji: '☂️',
      desc: '雨傘格擋，獲得 {v} 點護甲並獲得 1 點能量', extra: { energy: 1 } },

    // --- 技能牌 ---
    { id: 'rainbow', en: 'rainbow', zh: '彩虹', difficulty: 3, rarity: 'epic',
      type: 'skill', cost: 1, value: 2, emoji: '🌈',
      desc: '彩虹光芒，獲得 {v} 點能量並抽 1 張牌', extra: { energy: true, bonusDraw: 1 } },
    { id: 'treasure', en: 'treasure', zh: '寶藏', difficulty: 3, rarity: 'epic',
      type: 'skill', cost: 0, value: 3, emoji: '💰',
      desc: '寶藏發現，抽 {v} 張牌', extra: { draw: true } },
    { id: 'crystal', en: 'crystal', zh: '水晶', difficulty: 3, rarity: 'epic',
      type: 'skill', cost: 0, value: 2, emoji: '🔮',
      desc: '水晶能量，獲得 {v} 點能量', extra: { energy: true } },

    { id: 'potion', en: 'potion', zh: '藥水', difficulty: 3, rarity: 'legendary',
      type: 'skill', cost: 0, value: 3, emoji: '🧪',
      desc: '神奇藥水，獲得 {v} 點能量', extra: { energy: true } },
    { id: 'wisdom', en: 'wisdom', zh: '智慧', difficulty: 3, rarity: 'epic',
      type: 'skill', cost: 1, value: 3, emoji: '📖',
      desc: '智慧之書，抽 {v} 張牌', extra: { draw: true } },
    { id: 'candle', en: 'candle', zh: '蠟燭', difficulty: 3, rarity: 'epic',
      type: 'skill', cost: 0, value: 1, emoji: '🕯️',
      desc: '燭光指引，獲得 {v} 點能量並抽 1 張牌', extra: { energy: true, bonusDraw: 1 } },
    { id: 'angel', en: 'angel', zh: '天使', difficulty: 3, rarity: 'legendary',
      type: 'skill', cost: 1, value: 2, emoji: '👼',
      desc: '天使降臨，獲得 {v} 點能量並抽 2 張牌', extra: { energy: true, bonusDraw: 2 } },

    // --- 能力牌 ---
    { id: 'kingdom', en: 'kingdom', zh: '王國', difficulty: 3, rarity: 'legendary',
      type: 'power', cost: 2, value: 5, emoji: '🏰',
      desc: '王國之力，本場攻擊力 +{v}', extra: { permAtk: true } },
    { id: 'phoenix', en: 'phoenix', zh: '鳳凰', difficulty: 3, rarity: 'legendary',
      type: 'power', cost: 2, value: 5, emoji: '🔥',
      desc: '鳳凰羽翼，每回合獲得 {v} 點護甲', extra: { blockRegen: true } },
    { id: 'champion', en: 'champion', zh: '冠軍', difficulty: 3, rarity: 'legendary',
      type: 'power', cost: 3, value: 7, emoji: '🏆',
      desc: '冠軍氣場，本場攻擊力 +{v}', extra: { permAtk: true } },
    { id: 'guardian', en: 'guardian', zh: '守護者', difficulty: 3, rarity: 'epic',
      type: 'power', cost: 1, value: 3, emoji: '🛡️',
      desc: '守護荊棘，受擊反彈 {v} 傷害', extra: { thorns: true } },
];

// ===== 相似拼字庫（用於出題干擾選項）=====
// 每個單字配一組長相相似的干擾詞
export const SIMILAR_WORDS = {
    // 難度 1
    cat: ['cap', 'car', 'can', 'bat', 'cut', 'mat', 'cot', 'cab'],
    dog: ['dig', 'dot', 'fog', 'log', 'dug', 'bog', 'cog', 'jog'],
    bird: ['bind', 'born', 'bard', 'bite', 'bred', 'burn', 'blur', 'brad'],
    fish: ['fist', 'dish', 'wish', 'fill', 'five', 'figs', 'fizz', 'fins'],
    lion: ['loin', 'lime', 'line', 'link', 'loan', 'liar', 'lien', 'lint'],
    bear: ['beer', 'bean', 'beat', 'dear', 'fear', 'gear', 'hear', 'near'],
    fire: ['five', 'fine', 'firm', 'tire', 'hire', 'wire', 'file', 'fill'],
    kick: ['kiss', 'kind', 'king', 'kill', 'knit', 'kite', 'kids', 'tick'],
    hit: ['hat', 'hot', 'hid', 'him', 'hip', 'bit', 'fit', 'sit'],
    bee: ['bed', 'bet', 'beg', 'ben', 'see', 'fee', 'tee', 'pee'],
    egg: ['age', 'ego', 'end', 'elf', 'elm', 'add', 'odd', 'err'],
    red: ['rod', 'rid', 'rug', 'run', 'rub', 'bed', 'fed', 'led'],
    hat: ['hit', 'hot', 'hut', 'ham', 'had', 'bat', 'cat', 'mat'],
    cup: ['cut', 'cub', 'cur', 'cue', 'cap', 'cop', 'pup', 'sup'],
    box: ['fox', 'bow', 'boy', 'bot', 'bog', 'bon', 'cox', 'hex'],
    bed: ['bad', 'bid', 'bud', 'bee', 'bet', 'red', 'fed', 'led'],
    bag: ['bat', 'bad', 'ban', 'bar', 'bay', 'big', 'bug', 'tag'],
    door: ['doom', 'deer', 'dear', 'done', 'down', 'dock', 'dose', 'dorm'],
    ice: ['ace', 'ire', 'icy', 'ink', 'ion', 'ivy', 'rice', 'dice'],
    tree: ['free', 'true', 'three', 'trim', 'trip', 'tray', 'trap', 'trek'],
    sun: ['son', 'sum', 'sub', 'sue', 'fun', 'bun', 'gun', 'run'],
    moon: ['mood', 'moan', 'moat', 'move', 'noon', 'soon', 'boom', 'room'],
    star: ['stay', 'step', 'stop', 'stir', 'scar', 'spar', 'char', 'stab'],
    rain: ['rail', 'raid', 'rein', 'gain', 'main', 'pain', 'vain', 'ruin'],
    eye: ['dye', 'rye', 'aye', 'eve', 'ewe', 'era', 'eel', 'ear'],
    run: ['rub', 'rug', 'rum', 'rut', 'bun', 'fun', 'gun', 'sun'],
    cake: ['case', 'cave', 'came', 'cape', 'care', 'fake', 'lake', 'make'],
    milk: ['mild', 'mill', 'mind', 'mint', 'mist', 'silk', 'bilk', 'bulk'],

    // 難度 2
    sword: ['sworn', 'swore', 'swirl', 'sweet', 'world', 'words', 'worth', 'worst'],
    arrow: ['allow', 'arson', 'array', 'arena', 'argue', 'arise', 'armor', 'aside'],
    snake: ['shake', 'shame', 'shape', 'share', 'shade', 'stake', 'snare', 'snack'],
    tiger: ['timer', 'tower', 'taker', 'rider', 'diver', 'fiber', 'liner', 'miner'],
    shark: ['share', 'sharp', 'shake', 'shame', 'shape', 'spark', 'stark', 'charm'],
    eagle: ['early', 'earth', 'eager', 'easel', 'eaten', 'angle', 'ankle', 'eight'],
    flame: ['frame', 'flake', 'blame', 'shame', 'place', 'plane', 'flare', 'flash'],
    storm: ['story', 'store', 'stork', 'stomp', 'stone', 'stove', 'sworn', 'stern'],
    knife: ['kneel', 'knack', 'knock', 'knelt', 'knave', 'unite', 'while', 'quite'],
    angry: ['angel', 'angle', 'agree', 'adult', 'array', 'aunty', 'entry', 'empty'],
    brave: ['brake', 'brand', 'blaze', 'brace', 'grade', 'grave', 'crave', 'bravo'],
    horse: ['house', 'worse', 'nurse', 'purse', 'haste', 'loose', 'goose', 'chose'],
    stone: ['store', 'stove', 'stole', 'stoke', 'storm', 'story', 'alone', 'atone'],
    shield: ['shells', 'should', 'shared', 'shined', 'shifts', 'shrewd', 'shriek', 'shrill'],
    armor: ['arrow', 'aroma', 'alarm', 'amber', 'amour', 'anger', 'argue', 'arise'],
    tower: ['power', 'lower', 'mower', 'towel', 'timer', 'toner', 'tiger', 'tuner'],
    cloud: ['clown', 'close', 'clock', 'clean', 'climb', 'class', 'crowd', 'cloak'],
    house: ['horse', 'mouse', 'haste', 'those', 'loose', 'goose', 'chose', 'louse'],
    pond: ['bond', 'fond', 'wand', 'band', 'pong', 'port', 'post', 'pole'],
    forest: ['forget', 'forced', 'formal', 'former', 'foster', 'fourth', 'frozen', 'frosty'],
    wall: ['well', 'walk', 'will', 'wild', 'warm', 'wash', 'ball', 'call'],
    apple: ['ankle', 'angle', 'ample', 'maple', 'apply', 'agree', 'argue', 'alone'],
    water: ['wager', 'waver', 'wafer', 'watch', 'waste', 'later', 'hater', 'cater'],
    music: ['mural', 'muddy', 'musty', 'magic', 'basic', 'manic', 'mucus', 'mimic'],
    magic: ['music', 'major', 'manic', 'basic', 'logic', 'topic', 'panic', 'comic'],
    light: ['might', 'night', 'right', 'sight', 'tight', 'fight', 'eight', 'bight'],
    happy: ['hippy', 'handy', 'harry', 'hasty', 'hardy', 'haste', 'heavy', 'puppy'],
    dream: ['dread', 'cream', 'gleam', 'steam', 'realm', 'drawn', 'dress', 'drift'],
    candy: ['handy', 'dandy', 'sandy', 'canoe', 'carry', 'catch', 'pandy', 'randy'],
    crown: ['clown', 'brown', 'frown', 'drown', 'grown', 'crowd', 'crawl', 'crane'],
    heart: ['heard', 'earth', 'heavy', 'heath', 'heave', 'chart', 'smart', 'start'],
    rose: ['rope', 'role', 'rode', 'robe', 'nose', 'pose', 'dose', 'hose'],

    // 難度 3
    dragon: ['dragging', 'dragonfly', 'drawing', 'drain', 'dream', 'drama', 'driven', 'dagger'],
    thunder: ['hundred', 'thinner', 'plunder', 'blunder', 'wander', 'wonder', 'tender', 'slender'],
    warrior: ['warring', 'worrier', 'barrier', 'carrier', 'warbler', 'warning', 'warrant', 'warrens'],
    monster: ['minster', 'master', 'muster', 'mystery', 'rooster', 'lobster', 'mobster', 'blister'],
    volcano: ['village', 'violate', 'vintage', 'victory', 'villain', 'visible', 'vibrate', 'vagrant'],
    hammer: ['hatter', 'happen', 'harbor', 'hamper', 'manner', 'matter', 'hacker', 'banner'],
    spider: ['slider', 'spidey', 'slicer', 'sniper', 'spruce', 'spiral', 'spring', 'stripe'],
    battle: ['bottle', 'baffle', 'bubble', 'buckle', 'bundle', 'castle', 'cattle', 'rattle'],
    pirate: ['palace', 'parade', 'parrot', 'plaque', 'planet', 'please', 'polite', 'prince'],
    rocket: ['pocket', 'socket', 'ticket', 'racket', 'bucket', 'basket', 'jacket', 'wicket'],
    strong: ['string', 'spring', 'stream', 'strain', 'struck', 'strict', 'strand', 'storey'],
    wolf: ['golf', 'wool', 'woke', 'womb', 'worm', 'work', 'word', 'worn'],
    castle: ['cattle', 'candle', 'cackle', 'battle', 'bottle', 'cobble', 'cradle', 'circle'],
    mountain: ['maintain', 'fountain', 'mistaken', 'movement', 'moisture', 'moonrise', 'multiply', 'mortgage'],
    island: ['inland', 'insect', 'isolate', 'insult', 'iceman', 'intact', 'inward', 'ironic'],
    diamond: ['diagram', 'dialect', 'diploma', 'dynamic', 'disable', 'digital', 'display', 'distant'],
    bridge: ['fridge', 'bridle', 'bright', 'broken', 'bronze', 'breath', 'breeze', 'browse'],
    garden: ['golden', 'gather', 'gentle', 'global', 'garlic', 'gallon', 'gifted', 'glider'],
    helmet: ['hamlet', 'hermit', 'halted', 'hidden', 'hacked', 'hinged', 'healed', 'helped'],
    umbrella: ['umbrella', 'undulate', 'umbrella', 'unlocked', 'unlikely', 'unstable', 'universe', 'updating'],
    rainbow: ['railway', 'raindrop', 'raising', 'rampage', 'relying', 'renamed', 'rebound', 'sandbox'],
    treasure: ['training', 'treating', 'troubled', 'triangle', 'transfer', 'tracking', 'telegram', 'tropical'],
    crystal: ['crustal', 'coastal', 'central', 'cynical', 'crucial', 'capital', 'comical', 'crimson'],
    flower: ['flavor', 'flawed', 'fluent', 'flying', 'folder', 'fellow', 'follow', 'frozen'],
    potion: ['poison', 'polish', 'motion', 'notion', 'option', 'pardon', 'patron', 'piston'],
    wisdom: ['window', 'winter', 'wizard', 'wicked', 'worsen', 'warmth', 'wealth', 'within'],
    candle: ['castle', 'cancel', 'cattle', 'cradle', 'cuddle', 'circle', 'couple', 'handle'],
    angel: ['angle', 'anger', 'ankle', 'eager', 'agent', 'agree', 'alien', 'alive'],
    kingdom: ['kitchen', 'kindred', 'killing', 'knitted', 'knowing', 'kipling', 'kinetic', 'kidneys'],
    phoenix: ['phonics', 'phrases', 'physics', 'pioneer', 'pillows', 'pointed', 'posture', 'pleased'],
    champion: ['chambers', 'charging', 'chapters', 'chairman', 'changing', 'charming', 'channels', 'checking'],
    guardian: ['greeting', 'guidance', 'gathered', 'gambling', 'grateful', 'generous', 'gripping', 'grasping'],
};

// ===== 敵人定義 =====
export const ENEMIES = {
    slime: { name: '史萊姆', emoji: '🟢', hp: 20, attacks: [
        { name: '撞擊', damage: 4, emoji: '💥' },
        { name: '重砸', damage: 6, emoji: '☄️' },
        { name: '黏液', damage: 2, emoji: '💧', applyWeak: 1 },
        { name: '分裂', damage: 0, emoji: '🟢', heal: 5 },
    ]},
    bat: { name: '蝙蝠', emoji: '🦇', hp: 16, attacks: [
        { name: '啃咬', damage: 4, emoji: '🦷' },
        { name: '吸血', damage: 3, emoji: '🩸', heal: 3 },
        { name: '啃咬', damage: 5, emoji: '🦷' },
        { name: '超音波', damage: 2, emoji: '🔊', applyVuln: 1 },
    ]},
    goblin: { name: '哥布林', emoji: '👺', hp: 24, attacks: [
        { name: '棍棒', damage: 6, emoji: '🏐' },
        { name: '重棍', damage: 8, emoji: '🏏' },
        { name: '偷竊', damage: 4, emoji: '💰' },
        { name: '嘲諽', damage: 0, emoji: '😜', applyWeak: 1 },
    ]},
    mushroom: { name: '毒蘑菇', emoji: '🍄', hp: 20, attacks: [
        { name: '毒孢子', damage: 2, emoji: '☁️', poison: 2 },
        { name: '猛毒', damage: 1, emoji: '🦠', poison: 3 },
        { name: '頭槌', damage: 5, emoji: '💥' },
        { name: '迷幻粉', damage: 0, emoji: '🌀', applyVuln: 1, applyWeak: 1 },
    ]},
    skeleton: { name: '骷髏兵', emoji: '💀', hp: 32, attacks: [
        { name: '骨劍', damage: 8, emoji: '🗡️' },
        { name: '刺擊', damage: 10, emoji: '🗡️' },
        { name: '骨盾', damage: 0, emoji: '🛡️', block: 6 },
        { name: '詛咒', damage: 4, emoji: '👻', applyVuln: 2 },
        { name: '死亡凝視', damage: 0, emoji: '💀', applyWeak: 2, applyVuln: 1 },
    ]},
    dark_wolf: { name: '暗影狼', emoji: '🐺', hp: 30, attacks: [
        { name: '撕咬', damage: 8, emoji: '🦷' },
        { name: '血盆大口', damage: 12, emoji: '🐾' },
        { name: '嚎叫', damage: 0, emoji: '🌙', buffSelf: 2 },
        { name: '恐嚇', damage: 3, emoji: '😨', applyWeak: 2 },
    ]},
    orc: { name: '獸人', emoji: '👹', hp: 45, attacks: [
        { name: '巨斧', damage: 12, emoji: '🪓' },
        { name: '瘋狂劈砍', damage: 16, emoji: '⚔️' },
        { name: '躐踏', damage: 6, emoji: '🦶', applyVuln: 1 },
        { name: '戰吼', damage: 0, emoji: '📢', buffSelf: 3, block: 5 },
    ]},
    dark_knight: { name: '黑騎士', emoji: '🖤', hp: 55, attacks: [
        { name: '暗黑斬', damage: 15, emoji: '⚔️' },
        { name: '破防猛擊', damage: 18, emoji: '💥' },
        { name: '黑盾', damage: 0, emoji: '🛡️', block: 10 },
        { name: '恐懼', damage: 4, emoji: '😱', applyWeak: 2 },
        { name: '破甲', damage: 6, emoji: '💔', applyVuln: 2 },
    ]},
    necromancer: { name: '死靈法師', emoji: '🧙', hp: 42, attacks: [
        { name: '暗影彈', damage: 10, emoji: '🔮' },
        { name: '靈魂收割', damage: 14, emoji: '💀' },
        { name: '吸血', damage: 8, emoji: '🩸', heal: 8 },
        { name: '虛弱詛咒', damage: 0, emoji: '☠️', applyWeak: 2, applyVuln: 2 },
    ]},
    dragon_lord: { name: '龍王', emoji: '🐉', hp: 120, isBoss: true, attacks: [
        { name: '龍息', damage: 15, emoji: '🔥', poison: 3 },
        { name: '尾擊', damage: 10, emoji: '💥', applyVuln: 2 },
        { name: '烈焰風暴', damage: 25, emoji: '☄️' },
        { name: '龍鳞', damage: 0, emoji: '🛡️', block: 15 },
        { name: '毀滅吐息', damage: 30, emoji: '☄️' },
        { name: '龍威', damage: 5, emoji: '🐲', applyWeak: 3, applyVuln: 2 },
    ]},
};

// ===== 樓層配置 =====
export const FLOOR_CONFIG = [
    { floor: 1, enemies: ['slime'], vocabDifficulty: 1, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 1] },
    { floor: 2, enemies: ['slime', 'bat'], vocabDifficulty: 1, enemyHpMult: 1.1, enemyAtkMult: 1.0, enemyCount: [1, 1] },
    { floor: 3, enemies: ['bat', 'goblin', 'mushroom'], vocabDifficulty: 1, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 2] },
    { floor: 4, enemies: ['skeleton', 'goblin'], vocabDifficulty: 2, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 2] },
    { floor: 5, enemies: ['skeleton', 'dark_wolf'], vocabDifficulty: 2, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 2] },
    { floor: 6, enemies: ['dark_wolf', 'orc'], vocabDifficulty: 2, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [2, 3] },
    { floor: 7, enemies: ['dark_knight', 'orc'], vocabDifficulty: 3, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 2] },
    { floor: 8, enemies: ['dark_knight', 'necromancer'], vocabDifficulty: 3, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [2, 3] },
    { floor: 9, enemies: ['necromancer', 'dark_knight'], vocabDifficulty: 3, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [2, 3] },
    { floor: 10, enemies: ['dragon_lord'], vocabDifficulty: 3, enemyHpMult: 1.0, enemyAtkMult: 1.0, enemyCount: [1, 1] },
];

// ===== 初始牌組（10張普通卡）=====
export const STARTER_DECK = [
    'cat', 'dog', 'hit', 'kick',       // 4張攻擊
    'hat', 'box', 'bed', 'bag',         // 4張防禦
    'sun', 'milk',                       // 2張技能（回血+治癒）
];

// ===== 遊戲常數 =====
export const GAME_CONSTANTS = {
    STARTING_HP: 65,
    MAX_HP: 65,
    ENERGY_PER_TURN: 3,
    HAND_SIZE: 5,
    QUIZ_TIME_LIMIT: 20,
    REWARD_CARD_CHOICES: 3,
    REST_HEAL_AMOUNT: 15,
    GOLD_PER_BATTLE: 10,
};

// ===== 卡牌稀有度系統 =====
export const RARITY_CONFIG = {
    common:    { color: '#e0e0e0', label: '普通', glow: 'rgba(224,224,224,0.2)', border: '2px solid #e0e0e0' },
    rare:      { color: '#4dabf7', label: '稀有', glow: 'rgba(77,171,247,0.35)', border: '2px solid #4dabf7' },
    epic:      { color: '#be4bdb', label: '史詩', glow: 'rgba(190,75,219,0.4)', border: '3px solid #be4bdb' },
    legendary: { color: '#fd7e14', label: '傳說', glow: 'rgba(253,126,20,0.5)', border: '3px solid #fd7e14' },
};

export const RARITY_BY_DIFFICULTY = {
    1: RARITY_CONFIG.common,
    2: RARITY_CONFIG.rare,
    3: RARITY_CONFIG.epic,
};

// 直接讀取卡牌的 rarity 欄位
export function getCardRarity(card) {
    return card.rarity || 'common';
}

export function getCardRarityConfig(card) {
    return RARITY_CONFIG[getCardRarity(card)];
}

// ===== 自訂單字管理工具 =====
export function getCustomWords() {
    try { return JSON.parse(localStorage.getItem('vocabSpire_customWords') || '[]'); }
    catch { return []; }
}

export function getAllWordCards() {
    const custom = getCustomWords();
    const customIds = new Set(custom.map(c => c.id));
    const baseCards = WORD_CARDS.filter(c => !customIds.has(c.id));
    return [...baseCards, ...custom];
}

export function getCustomSimilarWords() {
    try { return JSON.parse(localStorage.getItem('vocabSpire_customSimilar') || '{}'); }
    catch { return {}; }
}

export function getAllSimilarWords() {
    return { ...SIMILAR_WORDS, ...getCustomSimilarWords() };
}

// ===== 家長卡牌池篩選 =====
export function getActiveCardIds() {
    try {
        const ids = JSON.parse(localStorage.getItem('vocabSpire_activeCardIds'));
        return ids ? new Set(ids) : null; // null = 全部啟用
    } catch { return null; }
}

export function saveActiveCardIds(ids) {
    localStorage.setItem('vocabSpire_activeCardIds', JSON.stringify([...ids]));
}

export function getActiveWordCards() {
    const all = getAllWordCards();
    const activeIds = getActiveCardIds();
    if (!activeIds) return all;
    return all.filter(c => activeIds.has(c.id));
}

// ===== 自訂卡牌圖片 =====
export function getCardImages() {
    try { return JSON.parse(localStorage.getItem('vocabSpire_cardImages') || '{}'); }
    catch { return {}; }
}

export function saveCardImages(images) {
    localStorage.setItem('vocabSpire_cardImages', JSON.stringify(images));
}

// ===== 玩家牌庫（持久收藏）=====
export function getPlayerCollection() {
    try { return JSON.parse(localStorage.getItem('vocabSpire_playerCollection') || '[]'); }
    catch { return []; }
}

export function savePlayerCollection(collection) {
    localStorage.setItem('vocabSpire_playerCollection', JSON.stringify(collection));
}

// ===== 玩家牌組配置 =====
export function getPlayerDeckConfig() {
    try { return JSON.parse(localStorage.getItem('vocabSpire_playerDeckConfig') || '[]'); }
    catch { return []; }
}

export function savePlayerDeckConfig(deck) {
    localStorage.setItem('vocabSpire_playerDeckConfig', JSON.stringify(deck));
}

