// ===== 卡牌 SVG 圖案生成器 =====
// 為每個單字自動產生風格化的 SVG 卡圖

const ART_TEMPLATES = {
    // 動物
    cat: `<circle cx="50" cy="35" r="18" fill="#f39c12"/><circle cx="42" cy="30" r="3" fill="#2c3e50"/><circle cx="58" cy="30" r="3" fill="#2c3e50"/><polygon points="35,20 40,10 45,22" fill="#f39c12"/><polygon points="55,22 60,10 65,20" fill="#f39c12"/><path d="M46,38 Q50,42 54,38" stroke="#2c3e50" fill="none" stroke-width="1.5"/><line x1="30" y1="35" x2="40" y2="33" stroke="#2c3e50" stroke-width="0.8"/><line x1="30" y1="38" x2="40" y2="37" stroke="#2c3e50" stroke-width="0.8"/><line x1="60" y1="33" x2="70" y2="35" stroke="#2c3e50" stroke-width="0.8"/><line x1="60" y1="37" x2="70" y2="38" stroke="#2c3e50" stroke-width="0.8"/>`,
    dog: `<circle cx="50" cy="35" r="18" fill="#c0855c"/><circle cx="42" cy="30" r="3.5" fill="#2c3e50"/><circle cx="58" cy="30" r="3.5" fill="#2c3e50"/><ellipse cx="50" cy="40" rx="6" ry="4" fill="#8B4513"/><ellipse cx="35" cy="25" rx="8" ry="12" fill="#a0724a" transform="rotate(-20,35,25)"/><ellipse cx="65" cy="25" rx="8" ry="12" fill="#a0724a" transform="rotate(20,65,25)"/><path d="M47,43 Q50,47 53,43" stroke="#c0392b" fill="#e74c3c" stroke-width="0.8"/>`,
    bird: `<ellipse cx="50" cy="38" rx="15" ry="12" fill="#3498db"/><circle cx="50" cy="28" r="10" fill="#3498db"/><circle cx="46" cy="26" r="2" fill="#2c3e50"/><polygon points="55,28 65,26 55,30" fill="#f39c12"/><path d="M35,35 Q20,25 25,40" fill="#2980b9"/><path d="M65,35 Q80,25 75,40" fill="#2980b9"/><line x1="45" y1="50" x2="45" y2="58" stroke="#e67e22" stroke-width="2"/><line x1="55" y1="50" x2="55" y2="58" stroke="#e67e22" stroke-width="2"/>`,
    fish: `<ellipse cx="50" cy="40" rx="22" ry="12" fill="#1abc9c"/><circle cx="38" cy="37" r="3" fill="#2c3e50"/><circle cx="38" cy="37" r="1.5" fill="#fff"/><polygon points="72,40 85,30 85,50" fill="#16a085"/><path d="M45,32 Q50,28 55,32" fill="#0e8c7a"/><path d="M45,48 Q50,52 55,48" fill="#0e8c7a"/>`,
    lion: `<circle cx="50" cy="40" r="22" fill="#e67e22"/><circle cx="50" cy="38" r="15" fill="#f39c12"/><circle cx="43" cy="34" r="3" fill="#2c3e50"/><circle cx="57" cy="34" r="3" fill="#2c3e50"/><ellipse cx="50" cy="42" rx="5" ry="3" fill="#d35400"/><path d="M47,44 Q50,48 53,44" stroke="#2c3e50" fill="none" stroke-width="1"/>`,
    bear: `<circle cx="50" cy="38" r="20" fill="#8B6914"/><circle cx="38" cy="22" r="8" fill="#8B6914"/><circle cx="62" cy="22" r="8" fill="#8B6914"/><circle cx="38" cy="22" r="5" fill="#a0824a"/><circle cx="62" cy="22" r="5" fill="#a0824a"/><circle cx="44" cy="33" r="3" fill="#2c3e50"/><circle cx="56" cy="33" r="3" fill="#2c3e50"/><ellipse cx="50" cy="42" rx="6" ry="4" fill="#5a4310"/><circle cx="50" cy="40" r="2.5" fill="#2c3e50"/>`,
    bee: `<ellipse cx="50" cy="40" rx="14" ry="10" fill="#f1c40f"/><rect x="40" y="34" width="20" height="3" fill="#2c3e50"/><rect x="40" y="41" width="20" height="3" fill="#2c3e50"/><circle cx="50" cy="32" r="8" fill="#f1c40f"/><circle cx="46" cy="30" r="2" fill="#2c3e50"/><circle cx="54" cy="30" r="2" fill="#2c3e50"/><ellipse cx="38" cy="30" rx="10" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-30,38,30)"/><ellipse cx="62" cy="30" rx="10" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(30,62,30)"/><polygon points="50,50 48,58 52,58" fill="#2c3e50"/>`,
    snake: `<path d="M20,50 Q30,30 40,40 Q50,50 60,35 Q70,20 80,30" fill="none" stroke="#27ae60" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="30" r="5" fill="#27ae60"/><circle cx="78" cy="28" r="1.5" fill="#c0392b"/><path d="M85,30 L90,28 L90,32 Z" fill="#c0392b"/>`,
    tiger: `<circle cx="50" cy="38" r="18" fill="#e67e22"/><circle cx="42" cy="33" r="3" fill="#2c3e50"/><circle cx="58" cy="33" r="3" fill="#2c3e50"/><line x1="42" y1="30" x2="50" y2="34" stroke="#2c3e50" stroke-width="2"/><line x1="50" y1="34" x2="58" y2="30" stroke="#2c3e50" stroke-width="2"/><line x1="45" y1="38" x2="50" y2="42" stroke="#2c3e50" stroke-width="2"/><line x1="55" y1="38" x2="50" y2="42" stroke="#2c3e50" stroke-width="2"/><ellipse cx="50" cy="43" rx="4" ry="2.5" fill="#d35400"/>`,
    shark: `<ellipse cx="50" cy="40" rx="25" ry="12" fill="#7f8c8d"/><polygon points="50,28 45,18 55,18" fill="#95a5a6"/><circle cx="36" cy="37" r="2.5" fill="#2c3e50"/><path d="M55,40 L65,38 L60,42 L68,40 L63,44 L70,42" fill="#fff"/>`,
    eagle: `<ellipse cx="50" cy="42" rx="12" ry="10" fill="#795548"/><circle cx="50" cy="30" r="9" fill="#fff"/><circle cx="47" cy="28" r="2.5" fill="#2c3e50"/><circle cx="53" cy="28" r="2.5" fill="#2c3e50"/><polygon points="50,32 45,36 55,36" fill="#f39c12"/><path d="M38,38 Q15,30 20,50" fill="#5D4037"/><path d="M62,38 Q85,30 80,50" fill="#5D4037"/>`,
    wolf: `<circle cx="50" cy="38" r="16" fill="#78909C"/><polygon points="38,25 42,12 46,24" fill="#78909C"/><polygon points="54,24 58,12 62,25" fill="#78909C"/><circle cx="44" cy="34" r="2.5" fill="#f1c40f"/><circle cx="56" cy="34" r="2.5" fill="#f1c40f"/><ellipse cx="50" cy="42" rx="5" ry="3" fill="#546E7A"/><path d="M46,45 Q50,50 54,45" fill="none" stroke="#2c3e50" stroke-width="1"/>`,
    spider: `<circle cx="50" cy="40" r="10" fill="#2c3e50"/><circle cx="50" cy="30" r="7" fill="#2c3e50"/><circle cx="47" cy="28" r="2" fill="#e74c3c"/><circle cx="53" cy="28" r="2" fill="#e74c3c"/><line x1="42" y1="38" x2="25" y2="28" stroke="#2c3e50" stroke-width="2"/><line x1="42" y1="42" x2="22" y2="45" stroke="#2c3e50" stroke-width="2"/><line x1="42" y1="45" x2="25" y2="55" stroke="#2c3e50" stroke-width="2"/><line x1="58" y1="38" x2="75" y2="28" stroke="#2c3e50" stroke-width="2"/><line x1="58" y1="42" x2="78" y2="45" stroke="#2c3e50" stroke-width="2"/><line x1="58" y1="45" x2="75" y2="55" stroke="#2c3e50" stroke-width="2"/>`,
    dragon: `<ellipse cx="50" cy="42" rx="18" ry="14" fill="#27ae60"/><circle cx="50" cy="28" r="12" fill="#27ae60"/><circle cx="44" cy="25" r="3" fill="#f1c40f"/><circle cx="56" cy="25" r="3" fill="#f1c40f"/><polygon points="38,18 42,8 46,20" fill="#27ae60"/><polygon points="54,20 58,8 62,18" fill="#27ae60"/><path d="M48,32 L50,36 L52,32" fill="#e74c3c"/><path d="M32,38 Q18,30 22,48" fill="#1e8449"/><path d="M68,38 Q82,30 78,48" fill="#1e8449"/>`,

    // 物品
    sword: `<rect x="48" y="10" width="4" height="35" fill="#bdc3c7" rx="1"/><rect x="40" y="42" width="20" height="5" fill="#8B6914" rx="2"/><rect x="46" y="45" width="8" height="12" fill="#6d4c0a" rx="1"/><circle cx="50" cy="12" r="3" fill="#e74c3c"/>`,
    arrow: `<line x1="50" y1="15" x2="50" y2="60" stroke="#8B6914" stroke-width="3"/><polygon points="50,10 44,22 56,22" fill="#bdc3c7"/><line x1="44" y1="55" x2="50" y2="60" stroke="#795548" stroke-width="1.5"/><line x1="56" y1="55" x2="50" y2="60" stroke="#795548" stroke-width="1.5"/>`,
    knife: `<path d="M50,12 L55,40 L50,42 L45,40 Z" fill="#bdc3c7"/><rect x="46" y="40" width="8" height="15" fill="#8B6914" rx="1"/>`,
    shield: `<path d="M50,15 L25,25 L25,45 Q25,60 50,68 Q75,60 75,45 L75,25 Z" fill="#3498db" stroke="#2980b9" stroke-width="2"/><path d="M50,22 L35,28 L35,42 Q35,53 50,58 Q65,53 65,42 L65,28 Z" fill="#2980b9"/><polygon points="50,30 46,42 50,38 54,42" fill="#f1c40f"/>`,
    armor: `<path d="M35,20 L65,20 L68,35 L60,50 L50,55 L40,50 L32,35 Z" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="1.5"/><line x1="50" y1="20" x2="50" y2="55" stroke="#6c7a7d" stroke-width="1"/><path d="M38,25 L62,25" stroke="#95a5a6" stroke-width="1"/>`,
    hammer: `<rect x="47" y="30" width="6" height="30" fill="#8B6914" rx="1"/><rect x="35" y="18" width="30" height="15" fill="#7f8c8d" rx="3"/>`,
    crown: `<polygon points="25,45 30,25 38,40 50,18 62,40 70,25 75,45" fill="#f1c40f" stroke="#e67e22" stroke-width="1"/><rect x="25" y="45" width="50" height="8" fill="#f1c40f" rx="2"/><circle cx="38" cy="35" r="3" fill="#e74c3c"/><circle cx="50" cy="25" r="3" fill="#3498db"/><circle cx="62" cy="35" r="3" fill="#2ecc71"/>`,
    helmet: `<path d="M30,45 Q30,15 50,12 Q70,15 70,45" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="2"/><rect x="28" y="42" width="44" height="8" fill="#95a5a6" rx="2"/><rect x="35" y="35" width="30" height="5" fill="rgba(0,0,0,0.2)"/>`,
    umbrella: `<path d="M25,35 Q25,15 50,12 Q75,15 75,35" fill="#9b59b6"/><line x1="50" y1="12" x2="50" y2="58" stroke="#8B6914" stroke-width="2.5"/><path d="M50,58 Q45,62 42,58" fill="none" stroke="#8B6914" stroke-width="2.5"/>`,
    diamond: `<polygon points="50,15 72,35 50,62 28,35" fill="#3498db" stroke="#2980b9" stroke-width="1.5"/><polygon points="50,15 60,35 50,55 40,35" fill="#5dade2" opacity="0.5"/>`,

    // 自然
    fire: `<ellipse cx="50" cy="50" rx="12" ry="8" fill="#e67e22"/><path d="M50,15 Q60,30 55,42 Q50,35 50,42 Q45,35 45,42 Q40,30 50,15" fill="#e74c3c"/><path d="M50,25 Q55,35 52,42 Q50,38 48,42 Q45,35 50,25" fill="#f1c40f"/>`,
    ice: `<polygon points="50,12 56,30 75,30 60,42 66,60 50,48 34,60 40,42 25,30 44,30" fill="#aed6f1" stroke="#85c1e9" stroke-width="1"/><polygon points="50,20 54,32 65,32 56,40 60,52 50,44 40,52 44,40 35,32 46,32" fill="#d4effc"/>`,
    sun: `<circle cx="50" cy="40" r="14" fill="#f1c40f"/><line x1="50" y1="18" x2="50" y2="10" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="62" x2="50" y2="70" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="28" y1="40" x2="20" y2="40" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="72" y1="40" x2="80" y2="40" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="34" y1="24" x2="28" y2="18" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="66" y1="56" x2="72" y2="62" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="66" y1="24" x2="72" y2="18" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/><line x1="34" y1="56" x2="28" y2="62" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>`,
    moon: `<circle cx="50" cy="38" r="18" fill="#f1c40f"/><circle cx="58" cy="32" r="15" fill="#1a0a2e"/>`,
    star: `<polygon points="50,10 56,30 78,30 60,42 67,62 50,50 33,62 40,42 22,30 44,30" fill="#f1c40f" stroke="#e67e22" stroke-width="1"/>`,
    rain: `<path d="M25,35 Q25,20 50,20 Q75,20 75,35 L25,35" fill="#95a5a6"/><ellipse cx="50" cy="50" rx="4" ry="6" fill="#3498db"/><ellipse cx="35" cy="48" rx="3" ry="5" fill="#3498db"/><ellipse cx="65" cy="48" rx="3" ry="5" fill="#3498db"/>`,
    tree: `<rect x="45" y="45" width="10" height="20" fill="#8B6914"/><circle cx="50" cy="32" r="18" fill="#27ae60"/><circle cx="38" cy="38" r="12" fill="#2ecc71"/><circle cx="62" cy="38" r="12" fill="#2ecc71"/>`,
    water: `<path d="M50,15 Q60,30 60,42 Q60,55 50,58 Q40,55 40,42 Q40,30 50,15" fill="#3498db"/><path d="M48,30 Q52,35 50,42" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5"/>`,
    cloud: `<circle cx="40" cy="40" r="14" fill="#ecf0f1"/><circle cx="55" cy="38" r="16" fill="#ecf0f1"/><circle cx="65" cy="43" r="11" fill="#ecf0f1"/><circle cx="48" cy="45" r="12" fill="#bdc3c7"/>`,
    flower: `<circle cx="50" cy="38" r="6" fill="#f1c40f"/><circle cx="50" cy="25" r="7" fill="#e74c3c"/><circle cx="62" cy="32" r="7" fill="#e74c3c"/><circle cx="58" cy="47" r="7" fill="#e74c3c"/><circle cx="42" cy="47" r="7" fill="#e74c3c"/><circle cx="38" cy="32" r="7" fill="#e74c3c"/><line x1="50" y1="50" x2="50" y2="68" stroke="#27ae60" stroke-width="3"/>`,
    rainbow: `<path d="M15,55 Q50,0 85,55" fill="none" stroke="#e74c3c" stroke-width="4"/><path d="M18,55 Q50,5 82,55" fill="none" stroke="#f39c12" stroke-width="4"/><path d="M21,55 Q50,10 79,55" fill="none" stroke="#f1c40f" stroke-width="4"/><path d="M24,55 Q50,15 76,55" fill="none" stroke="#2ecc71" stroke-width="4"/><path d="M27,55 Q50,20 73,55" fill="none" stroke="#3498db" stroke-width="4"/><path d="M30,55 Q50,25 70,55" fill="none" stroke="#9b59b6" stroke-width="4"/>`,
    forest: `<rect x="25" y="40" width="6" height="22" fill="#6d4c0a"/><circle cx="28" cy="30" r="12" fill="#27ae60"/><rect x="47" y="35" width="6" height="27" fill="#6d4c0a"/><circle cx="50" cy="22" r="15" fill="#2ecc71"/><rect x="68" y="42" width="5" height="20" fill="#6d4c0a"/><circle cx="70" cy="32" r="10" fill="#27ae60"/>`,
    mountain: `<polygon points="50,12 80,60 20,60" fill="#7f8c8d"/><polygon points="50,12 60,28 40,28" fill="#ecf0f1"/><polygon points="70,30 90,60 50,60" fill="#95a5a6"/>`,
    volcano: `<polygon points="50,15 80,60 20,60" fill="#795548"/><ellipse cx="50" cy="18" rx="10" ry="5" fill="#e74c3c"/><path d="M45,15 Q42,8 48,5 Q50,10 52,5 Q58,8 55,15" fill="#f39c12"/>`,
    ocean: `<rect x="10" y="30" width="80" height="35" fill="#2980b9" rx="5"/><path d="M10,35 Q25,28 40,35 Q55,42 70,35 Q85,28 90,35" fill="#3498db"/>`,
    pond: `<ellipse cx="50" cy="45" rx="28" ry="15" fill="#3498db"/><ellipse cx="50" cy="43" rx="24" ry="12" fill="#5dade2"/><ellipse cx="42" cy="42" rx="4" ry="2" fill="rgba(255,255,255,0.3)"/>`,
    island: `<ellipse cx="50" cy="50" rx="30" ry="10" fill="#f39c12"/><ellipse cx="50" cy="48" rx="26" ry="8" fill="#e8c547"/><rect x="48" y="25" width="4" height="23" fill="#8B6914"/><circle cx="55" cy="25" r="10" fill="#27ae60"/><circle cx="45" cy="28" r="8" fill="#2ecc71"/>`,

    // 建築/場所
    castle: `<rect x="30" y="30" width="40" height="32" fill="#7f8c8d"/><rect x="25" y="25" width="10" height="37" fill="#95a5a6"/><rect x="65" y="25" width="10" height="37" fill="#95a5a6"/><rect x="27" y="20" width="2" height="5" fill="#95a5a6"/><rect x="31" y="20" width="2" height="5" fill="#95a5a6"/><rect x="67" y="20" width="2" height="5" fill="#95a5a6"/><rect x="71" y="20" width="2" height="5" fill="#95a5a6"/><rect x="45" y="45" width="10" height="17" fill="#5a4310" rx="5 5 0 0"/>`,
    tower: `<rect x="40" y="20" width="20" height="42" fill="#7f8c8d"/><polygon points="35,20 50,8 65,20" fill="#c0392b"/><rect x="46" y="35" width="8" height="10" fill="#f1c40f" rx="4 4 0 0"/>`,
    house: `<rect x="28" y="38" width="44" height="25" fill="#e8c547"/><polygon points="20,40 50,18 80,40" fill="#c0392b"/><rect x="43" y="45" width="14" height="18" fill="#8B6914"/><rect x="33" y="42" width="8" height="8" fill="#aed6f1"/>`,
    door: `<rect x="32" y="15" width="36" height="50" fill="#8B6914" rx="3"/><circle cx="60" cy="42" r="3" fill="#f1c40f"/><rect x="36" y="18" width="28" height="8" fill="#6d4c0a"/>`,
    bridge: `<path d="M10,40 Q50,20 90,40" fill="none" stroke="#8B6914" stroke-width="6"/><line x1="30" y1="33" x2="30" y2="55" stroke="#8B6914" stroke-width="3"/><line x1="50" y1="28" x2="50" y2="55" stroke="#8B6914" stroke-width="3"/><line x1="70" y1="33" x2="70" y2="55" stroke="#8B6914" stroke-width="3"/>`,
    garden: `<rect x="15" y="50" width="70" height="12" fill="#27ae60" rx="3"/><circle cx="30" cy="42" r="6" fill="#e74c3c"/><circle cx="50" cy="38" r="7" fill="#f1c40f"/><circle cx="70" cy="42" r="6" fill="#9b59b6"/><line x1="30" y1="48" x2="30" y2="55" stroke="#27ae60" stroke-width="2"/><line x1="50" y1="45" x2="50" y2="55" stroke="#27ae60" stroke-width="2"/><line x1="70" y1="48" x2="70" y2="55" stroke="#27ae60" stroke-width="2"/>`,
    wall: `<rect x="15" y="20" width="70" height="42" fill="#95a5a6"/><rect x="15" y="20" width="23" height="10" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="0.5"/><rect x="38" y="20" width="23" height="10" fill="#bdc3c7" stroke="#6c7a7d" stroke-width="0.5"/><rect x="61" y="20" width="24" height="10" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="0.5"/><rect x="15" y="30" width="15" height="10" fill="#bdc3c7" stroke="#6c7a7d" stroke-width="0.5"/><rect x="30" y="30" width="23" height="10" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="0.5"/><rect x="53" y="30" width="15" height="10" fill="#bdc3c7" stroke="#6c7a7d" stroke-width="0.5"/><rect x="68" y="30" width="17" height="10" fill="#7f8c8d" stroke="#6c7a7d" stroke-width="0.5"/>`,
    kingdom: `<rect x="20" y="35" width="60" height="30" fill="#7f8c8d"/><polygon points="50,8 20,35 80,35" fill="#9b59b6"/><rect x="42" y="45" width="16" height="20" fill="#5a4310" rx="8 8 0 0"/><polygon points="50,3 47,12 53,12" fill="#f1c40f"/>`,

    // 食物
    egg: `<ellipse cx="50" cy="40" rx="14" ry="18" fill="#fdebd0"/><ellipse cx="50" cy="42" rx="12" ry="15" fill="#fef9e7"/>`,
    cake: `<rect x="28" y="35" width="44" height="22" fill="#e8c547" rx="3"/><rect x="28" y="35" width="44" height="8" fill="#e74c3c" rx="3"/><rect x="25" y="30" width="50" height="8" fill="#f5cba7" rx="3"/><line x1="50" y1="20" x2="50" y2="30" stroke="#f1c40f" stroke-width="2"/><circle cx="50" cy="18" r="3" fill="#e67e22"/>`,
    apple: `<circle cx="50" cy="42" r="16" fill="#e74c3c"/><path d="M50,26 Q55,20 52,15" fill="none" stroke="#27ae60" stroke-width="2"/><ellipse cx="55" cy="22" rx="5" ry="3" fill="#27ae60" transform="rotate(20,55,22)"/>`,
    milk: `<rect x="38" y="20" width="24" height="38" fill="#ecf0f1" rx="3"/><rect x="38" y="20" width="24" height="12" fill="#3498db" rx="3"/><rect x="36" y="18" width="28" height="5" fill="#bdc3c7" rx="2"/>`,
    candy: `<circle cx="50" cy="38" r="12" fill="#e74c3c"/><path d="M50,38 L50,26 L55,26" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M38,38 Q30,30 25,35" fill="none" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/><path d="M62,38 Q70,30 75,35" fill="none" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/>`,

    // 人物/概念
    eye: `<ellipse cx="50" cy="40" rx="22" ry="14" fill="#ecf0f1"/><circle cx="50" cy="40" r="10" fill="#3498db"/><circle cx="50" cy="40" r="5" fill="#2c3e50"/><circle cx="53" cy="37" r="2" fill="#fff"/>`,
    heart: `<path d="M50,55 Q20,35 30,22 Q40,10 50,25 Q60,10 70,22 Q80,35 50,55" fill="#e74c3c"/>`,
    angel: `<circle cx="50" cy="28" r="10" fill="#fdebd0"/><path d="M40,38 L35,58 L50,52 L65,58 L60,38" fill="#ecf0f1"/><circle cx="50" cy="16" r="12" fill="none" stroke="#f1c40f" stroke-width="2"/><ellipse cx="35" cy="35" rx="8" ry="12" fill="rgba(255,255,255,0.4)" transform="rotate(-15,35,35)"/><ellipse cx="65" cy="35" rx="8" ry="12" fill="rgba(255,255,255,0.4)" transform="rotate(15,65,35)"/>`,
    phoenix: `<ellipse cx="50" cy="40" rx="15" ry="12" fill="#e74c3c"/><circle cx="50" cy="28" r="8" fill="#f39c12"/><circle cx="47" cy="26" r="2" fill="#2c3e50"/><polygon points="55,28 62,25 55,30" fill="#f1c40f"/><path d="M35,38 Q15,25 18,50" fill="#e67e22"/><path d="M65,38 Q85,25 82,50" fill="#e67e22"/><path d="M45,52 Q40,65 35,60" fill="#f39c12"/><path d="M55,52 Q60,65 65,60" fill="#f39c12"/><path d="M50,52 Q50,68 50,62" fill="#e74c3c"/>`,
    warrior: `<circle cx="50" cy="22" r="10" fill="#fdebd0"/><rect x="40" y="32" width="20" height="25" fill="#7f8c8d"/><rect x="48" y="12" width="4" height="3" fill="#f1c40f"/><line x1="68" y1="25" x2="75" y2="55" stroke="#bdc3c7" stroke-width="3"/><ellipse cx="33" cy="40" rx="8" ry="12" fill="#3498db"/>`,
    champion: `<polygon points="50,10 42,30 20,30 38,42 30,62 50,50 70,62 62,42 80,30 58,30" fill="#f1c40f" stroke="#e67e22" stroke-width="1.5"/><circle cx="50" cy="38" r="8" fill="#e67e22"/><text x="50" y="42" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">1</text>`,
    guardian: `<circle cx="50" cy="22" r="10" fill="#fdebd0"/><rect x="38" y="32" width="24" height="28" fill="#3498db"/><path d="M30,32 L25,25 L25,45 Q25,55 50,62 Q75,55 75,45 L75,25 L70,32" fill="none" stroke="#f1c40f" stroke-width="2"/>`,
    pirate: `<circle cx="50" cy="28" r="12" fill="#fdebd0"/><rect x="38" y="18" width="24" height="5" fill="#2c3e50"/><circle cx="56" cy="28" r="5" fill="#2c3e50"/><path d="M46,32 Q50,36 54,32" stroke="#2c3e50" fill="none" stroke-width="1"/><line x1="65" y1="35" x2="80" y2="55" stroke="#bdc3c7" stroke-width="2.5"/>`,
    monster: `<circle cx="50" cy="38" r="20" fill="#8e44ad"/><circle cx="42" cy="32" r="5" fill="#fff"/><circle cx="58" cy="32" r="5" fill="#fff"/><circle cx="42" cy="32" r="2.5" fill="#e74c3c"/><circle cx="58" cy="32" r="2.5" fill="#e74c3c"/><path d="M38,48 L42,42 L46,48 L50,42 L54,48 L58,42 L62,48" fill="#fff"/>`,

    // 其他物品/概念
    box: `<rect x="28" y="28" width="44" height="32" fill="#e8c547"/><rect x="28" y="28" width="44" height="8" fill="#d4a832"/><line x1="50" y1="28" x2="50" y2="60" stroke="#c49622" stroke-width="1.5"/>`,
    bag: `<rect x="32" y="30" width="36" height="30" fill="#e67e22" rx="3"/><path d="M38,30 Q38,18 50,18 Q62,18 62,30" fill="none" stroke="#d35400" stroke-width="3"/>`,
    bed: `<rect x="20" y="40" width="60" height="20" fill="#e8c547"/><rect x="20" y="35" width="60" height="8" fill="#ecf0f1"/><rect x="18" y="30" width="8" height="32" fill="#8B6914" rx="2"/><rect x="74" y="38" width="8" height="24" fill="#8B6914" rx="2"/>`,
    cup: `<path d="M32,25 L36,58 L64,58 L68,25 Z" fill="#ecf0f1"/><path d="M68,32 Q80,32 80,42 Q80,52 68,48" fill="none" stroke="#bdc3c7" stroke-width="2.5"/><path d="M36,30 Q50,22 64,30" fill="#87CEEB"/>`,
    hat: `<ellipse cx="50" cy="52" rx="28" ry="8" fill="#2c3e50"/><rect x="38" y="25" width="24" height="27" fill="#2c3e50"/><rect x="35" y="22" width="30" height="6" fill="#2c3e50" rx="3"/><rect x="38" y="48" width="24" height="3" fill="#e74c3c"/>`,
    book: `<rect x="28" y="18" width="40" height="45" fill="#e74c3c" rx="2"/><rect x="32" y="18" width="36" height="45" fill="#c0392b" rx="2"/><rect x="36" y="25" width="24" height="3" fill="#f1c40f"/><rect x="36" y="32" width="18" height="2" fill="rgba(255,255,255,0.3)"/><rect x="36" y="38" width="20" height="2" fill="rgba(255,255,255,0.3)"/>`,
    pen: `<line x1="50" y1="15" x2="50" y2="55" stroke="#2c3e50" stroke-width="4"/><polygon points="48,55 52,55 50,62" fill="#f39c12"/><rect x="47" y="15" width="6" height="5" fill="#e74c3c"/>`,
    key: `<circle cx="40" cy="30" r="10" fill="#f1c40f" stroke="#e67e22" stroke-width="2"/><circle cx="40" cy="30" r="4" fill="#1a0a2e"/><rect x="48" y="27" width="25" height="6" fill="#f1c40f" rx="1"/><rect x="65" y="33" width="4" height="8" fill="#f1c40f"/><rect x="58" y="33" width="4" height="6" fill="#f1c40f"/>`,
    rocket: `<ellipse cx="50" cy="35" rx="10" ry="22" fill="#ecf0f1"/><polygon points="50,10 42,22 58,22" fill="#e74c3c"/><polygon points="38,50 30,60 42,52" fill="#e74c3c"/><polygon points="62,50 70,60 58,52" fill="#e74c3c"/><circle cx="50" cy="35" r="5" fill="#3498db"/><path d="M44,55 Q50,65 56,55" fill="#f39c12"/>`,
    crystal: `<polygon points="50,10 65,30 60,58 40,58 35,30" fill="#9b59b6" stroke="#8e44ad" stroke-width="1"/><polygon points="50,10 58,30 55,50 45,50 42,30" fill="#af7ac5" opacity="0.5"/>`,
    treasure: `<rect x="25" y="35" width="50" height="28" fill="#e8c547" rx="3"/><rect x="25" y="30" width="50" height="10" fill="#d4a832" rx="3"/><rect x="45" y="32" width="10" height="8" fill="#f1c40f" rx="2"/><circle cx="50" cy="36" r="3" fill="#e67e22"/><circle cx="35" cy="48" r="4" fill="#f1c40f"/><circle cx="50" cy="45" r="3" fill="#e74c3c"/><circle cx="62" cy="48" r="4" fill="#3498db"/>`,
    potion: `<circle cx="50" cy="45" r="14" fill="#9b59b6"/><rect x="45" y="22" width="10" height="15" fill="#bdc3c7"/><rect x="43" y="20" width="14" height="5" fill="#95a5a6" rx="2"/><circle cx="45" cy="42" r="3" fill="rgba(255,255,255,0.3)"/><circle cx="52" cy="48" r="2" fill="rgba(255,255,255,0.2)"/>`,
    rose: `<circle cx="50" cy="32" r="10" fill="#e74c3c"/><circle cx="42" cy="28" r="6" fill="#c0392b"/><circle cx="58" cy="28" r="6" fill="#c0392b"/><circle cx="45" cy="38" r="6" fill="#c0392b"/><circle cx="55" cy="38" r="6" fill="#c0392b"/><line x1="50" y1="42" x2="50" y2="65" stroke="#27ae60" stroke-width="3"/><path d="M50,52 Q40,48 38,52" fill="#27ae60"/><path d="M50,56 Q60,52 62,56" fill="#27ae60"/>`,
    candle: `<rect x="44" y="30" width="12" height="30" fill="#fdebd0"/><rect x="44" y="58" width="12" height="5" fill="#bdc3c7" rx="1"/><ellipse cx="50" cy="28" rx="5" ry="8" fill="#f39c12"/><ellipse cx="50" cy="26" rx="3" ry="5" fill="#f1c40f"/>`,
    music: `<circle cx="38" cy="52" r="7" fill="#2c3e50"/><circle cx="62" cy="46" r="7" fill="#2c3e50"/><line x1="45" y1="52" x2="45" y2="20" stroke="#2c3e50" stroke-width="2.5"/><line x1="69" y1="46" x2="69" y2="14" stroke="#2c3e50" stroke-width="2.5"/><rect x="45" y="14" width="24" height="8" fill="#2c3e50"/>`,
    light: `<circle cx="50" cy="32" r="14" fill="#f1c40f" opacity="0.3"/><circle cx="50" cy="32" r="8" fill="#f1c40f"/><rect x="45" y="46" width="10" height="12" fill="#bdc3c7" rx="2"/><line x1="50" y1="14" x2="50" y2="8" stroke="#f1c40f" stroke-width="1.5"/><line x1="36" y1="20" x2="32" y2="15" stroke="#f1c40f" stroke-width="1.5"/><line x1="64" y1="20" x2="68" y2="15" stroke="#f1c40f" stroke-width="1.5"/>`,
    wisdom: `<rect x="25" y="22" width="50" height="38" fill="#8e44ad" rx="3"/><rect x="30" y="25" width="40" height="32" fill="#7d3c98"/><text x="50" y="45" text-anchor="middle" fill="#f1c40f" font-size="16" font-weight="bold">W</text>`,
    magic: `<polygon points="50,10 56,30 78,30 60,42 67,62 50,50 33,62 40,42 22,30 44,30" fill="none" stroke="#9b59b6" stroke-width="1.5"/><circle cx="50" cy="38" r="5" fill="#9b59b6"/><circle cx="40" cy="28" r="2" fill="#f1c40f"/><circle cx="60" cy="28" r="2" fill="#f1c40f"/><circle cx="50" cy="52" r="2" fill="#f1c40f"/>`,
    dream: `<circle cx="50" cy="38" r="18" fill="rgba(155,89,182,0.2)" stroke="#9b59b6" stroke-width="1" stroke-dasharray="4"/><circle cx="42" cy="35" r="3" fill="#f1c40f" opacity="0.6"/><circle cx="58" cy="32" r="2" fill="#3498db" opacity="0.6"/><circle cx="50" cy="45" r="2.5" fill="#e74c3c" opacity="0.6"/><text x="50" y="40" text-anchor="middle" fill="#c9a5e0" font-size="14">Z z z</text>`,
    thunder: `<polygon points="55,10 40,35 50,35 38,60 65,30 52,30 62,10" fill="#f1c40f"/>`,
    battle: `<line x1="30" y1="20" x2="55" y2="55" stroke="#bdc3c7" stroke-width="3"/><line x1="45" y1="55" x2="70" y2="20" stroke="#bdc3c7" stroke-width="3"/><circle cx="50" cy="38" r="8" fill="#e74c3c" opacity="0.6"/>`,
    strong: `<path d="M35,45 L40,30 Q50,20 60,30 L65,45" fill="#fdebd0"/><path d="M38,32 Q45,38 50,30 Q55,38 62,32" fill="none" stroke="#e67e22" stroke-width="2"/>`,

    // 簡單概念
    hit: `<circle cx="50" cy="38" r="16" fill="#e74c3c" opacity="0.2"/><text x="50" y="44" text-anchor="middle" fill="#e74c3c" font-size="24" font-weight="bold">!</text><circle cx="50" cy="38" r="16" fill="none" stroke="#e74c3c" stroke-width="2" stroke-dasharray="4"/>`,
    kick: `<path d="M50,20 L50,42 L65,55" stroke="#fdebd0" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="65" cy="55" r="6" fill="#e67e22"/>`,
    run: `<circle cx="50" cy="22" r="8" fill="#fdebd0"/><path d="M50,30 L45,48 L35,58" stroke="#3498db" stroke-width="3" fill="none"/><path d="M50,30 L55,48 L65,55" stroke="#3498db" stroke-width="3" fill="none"/><path d="M45,35 L35,42" stroke="#3498db" stroke-width="3" fill="none"/><path d="M55,35 L68,30" stroke="#3498db" stroke-width="3" fill="none"/>`,
    happy: `<circle cx="50" cy="38" r="18" fill="#f1c40f"/><circle cx="43" cy="33" r="3" fill="#2c3e50"/><circle cx="57" cy="33" r="3" fill="#2c3e50"/><path d="M38,43 Q50,55 62,43" fill="none" stroke="#2c3e50" stroke-width="2.5"/>`,
    angry: `<circle cx="50" cy="38" r="18" fill="#e74c3c"/><line x1="38" y1="28" x2="46" y2="33" stroke="#2c3e50" stroke-width="2.5"/><line x1="62" y1="28" x2="54" y2="33" stroke="#2c3e50" stroke-width="2.5"/><circle cx="43" cy="35" r="2.5" fill="#2c3e50"/><circle cx="57" cy="35" r="2.5" fill="#2c3e50"/><path d="M40,48 Q50,42 60,48" fill="none" stroke="#2c3e50" stroke-width="2.5"/>`,
    brave: `<circle cx="50" cy="25" r="10" fill="#fdebd0"/><rect x="40" y="35" width="20" height="22" fill="#e74c3c"/><polygon points="50,40 45,50 55,50" fill="#f1c40f"/>`,
    red: `<circle cx="50" cy="38" r="20" fill="#e74c3c"/><circle cx="50" cy="38" r="12" fill="#c0392b"/><circle cx="50" cy="38" r="5" fill="#e74c3c"/>`,
    storm: `<circle cx="45" cy="28" r="12" fill="#7f8c8d"/><circle cx="58" cy="25" r="14" fill="#95a5a6"/><circle cx="50" cy="30" r="10" fill="#7f8c8d"/><polygon points="52,38 44,52 54,48 48,62" fill="#f1c40f"/>`,
    flame: `<ellipse cx="50" cy="52" rx="16" ry="10" fill="#e67e22"/><path d="M50,10 Q65,30 58,45 Q50,35 50,45 Q42,35 42,45 Q35,30 50,10" fill="#e74c3c"/><path d="M50,22 Q58,35 54,45 Q50,38 46,45 Q42,35 50,22" fill="#f1c40f"/>`,
    horse: `<ellipse cx="50" cy="42" rx="18" ry="12" fill="#8B6914"/><circle cx="65" cy="30" r="10" fill="#8B6914"/><circle cx="70" cy="28" r="2.5" fill="#2c3e50"/><polygon points="70,25 75,18 72,25" fill="#8B6914"/><path d="M60,22 Q55,12 58,22" fill="#5a4310"/><line x1="38" y1="54" x2="38" y2="65" stroke="#5a4310" stroke-width="3"/><line x1="48" y1="54" x2="48" y2="65" stroke="#5a4310" stroke-width="3"/>`,
    stone: `<ellipse cx="50" cy="45" rx="22" ry="15" fill="#7f8c8d"/><ellipse cx="45" cy="40" rx="8" ry="5" fill="#95a5a6" opacity="0.5"/>`,
};

// 生成 SVG（支援自訂圖片）
export function getCardArt(wordId, emoji = '') {
    // 優先使用自訂上傳圖片
    try {
        const images = JSON.parse(localStorage.getItem('vocabSpire_cardImages') || '{}');
        if (images[wordId]) {
            return `<img src="${images[wordId]}" alt="${wordId}" style="width:100%;height:100%;object-fit:contain;border-radius:4px">`;
        }
    } catch {}

    const art = ART_TEMPLATES[wordId];
    if (!art) {
        // 若無 SVG 模板，嘗試從自訂卡牌取得 emoji（未傳入時自動查詢）
        if (!emoji) {
            try {
                const customWords = JSON.parse(localStorage.getItem('vocabSpire_customWords') || '[]');
                const card = customWords.find(c => c.id === wordId);
                if (card?.emoji) emoji = card.emoji;
            } catch {}
        }
        return generateDefaultArt(wordId, emoji);
    }
    return `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
}

function generateDefaultArt(wordId, emoji = '') {
    if (emoji) {
        // 用 emoji 作為卡牌圖案
        return `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
            <text x="50" y="35" text-anchor="middle" dominant-baseline="middle" font-size="40">${emoji}</text>
        </svg>`;
    }
    // fallback：用字母生成彩色幾何圖案
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const color = colors[wordId.charCodeAt(0) % colors.length];
    const letter = wordId.charAt(0).toUpperCase();
    return `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="35" r="25" fill="${color}" opacity="0.3"/>
        <circle cx="50" cy="35" r="16" fill="${color}" opacity="0.5"/>
        <text x="50" y="42" text-anchor="middle" fill="#fff" font-size="22" font-weight="bold">${letter}</text>
    </svg>`;
}

// 取得所有可用的圖案 ID
export function getAvailableArtIds() {
    return Object.keys(ART_TEMPLATES);
}
