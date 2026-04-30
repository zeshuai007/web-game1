// ========== 游戏数据模型 ==========

// 境界体系
const REALMS = [
    { name: '凡人', level: 0, requiredQi: 0, bonus: 1 },
    { name: '炼气期', level: 1, requiredQi: 100, bonus: 1.2 },
    { name: '筑基期', level: 2, requiredQi: 300, bonus: 1.5 },
    { name: '金丹期', level: 3, requiredQi: 800, bonus: 2 },
    { name: '元婴期', level: 4, requiredQi: 2000, bonus: 3 },
    { name: '化神期', level: 5, requiredQi: 5000, bonus: 5 },
    { name: '合体期', level: 6, requiredQi: 12000, bonus: 8 },
    { name: '大乘期', level: 7, requiredQi: 30000, bonus: 12 },
    { name: '渡劫飞升', level: 8, requiredQi: 100000, bonus: 20 }
];

// 功法数据库
const TECHNIQUES = [
    // 剑诀
    { id: 'sword1', name: '青云剑诀', type: 'sword', grade: '玄阶', cost: 100, effect: '攻击+15', description: '青云宗传承剑法，剑气如云' },
    { id: 'sword2', name: '紫霄神剑', type: 'sword', grade: '地阶', cost: 500, effect: '攻击+40', description: '紫霄天降，剑斩妖魔' },
    { id: 'sword3', name: '太虚剑意', type: 'sword', grade: '天阶', cost: 2000, effect: '攻击+100', description: '太虚无相，剑破苍穹' },
    // 心法
    { id: 'heart1', name: '玄元心法', type: 'heart', grade: '玄阶', cost: 100, effect: '灵力+20', description: '玄元一气，生生不息' },
    { id: 'heart2', name: '北冥神功', type: 'heart', grade: '地阶', cost: 500, effect: '灵力+50', description: '吸星纳月，浩瀚如海' },
    { id: 'heart3', name: '混元无极功', type: 'heart', grade: '天阶', cost: 2000, effect: '灵力+120', description: '混元如一，天地同寿' },
    // 丹方
    { id: 'pill1', name: '聚气丹方', type: 'pill', grade: '黄阶', cost: 50, effect: '炼制聚气丹', description: '初级丹方，恢复灵气' },
    { id: 'pill2', name: '筑基丹方', type: 'pill', grade: '玄阶', cost: 200, effect: '炼制筑基丹', description: '辅助筑基，提升修为' },
    { id: 'pill3', name: '金丹方', type: 'pill', grade: '地阶', cost: 800, effect: '炼制金丹', description: '破境神丹，凝聚金丹' },
    // 阵法
    { id: 'formation1', name: '五行聚灵阵', type: 'formation', grade: '玄阶', cost: 150, effect: '修炼速度+20%', description: '聚天地灵气，助修炼' },
    { id: 'formation2', name: '九宫护体阵', type: 'formation', grade: '地阶', cost: 600, effect: '防御+30', description: '九宫八卦，固若金汤' },
    { id: 'formation3', name: '诛仙剑阵', type: 'formation', grade: '天阶', cost: 2500, effect: '攻击+80', description: '上古杀阵，诛仙灭魔' }
];

// 丹药配方
const RECIPES = [
    { id: 'qi_pill', name: '聚气丹', ingredients: ['灵草', '灵草'], successRate: 0.8, fire: 50, effect: 'qi', value: 50 },
    { id: 'foundation_pill', name: '筑基丹', ingredients: ['灵芝', '血参'], successRate: 0.6, fire: 60, effect: 'qi', value: 200 },
    { id: 'golden_pill', name: '金丹', ingredients: ['龙血草', '凤羽花', '天心石'], successRate: 0.4, fire: 75, effect: 'qi', value: 800 },
    { id: 'healing_pill', name: '疗伤丹', ingredients: ['灵草', '血参'], successRate: 0.7, fire: 45, effect: 'hp', value: 100 }
];

// 材料数据
const MATERIALS = [
    { id: 'spirit_grass', name: '灵草', icon: '🌿' },
    { id: 'lingzhi', name: '灵芝', icon: '🍄' },
    { id: 'blood_ginseng', name: '血参', icon: '🌺' },
    { id: 'dragon_grass', name: '龙血草', icon: '🌹' },
    { id: 'phoenix_flower', name: '凤羽花', icon: '🌸' },
    { id: 'sky_stone', name: '天心石', icon: '💎' }
];

// 敌人数据
const ENEMIES = [
    { name: '野猪妖', level: 1, hp: 80, attack: 8, defense: 3, reward: { qi: 20, stones: 10 }, avatar: '🐗' },
    { name: '山贼', level: 2, hp: 120, attack: 12, defense: 5, reward: { qi: 40, stones: 20 }, avatar: '🥷' },
    { name: '狼妖', level: 3, hp: 180, attack: 18, defense: 8, reward: { qi: 80, stones: 40 }, avatar: '🐺' },
    { name: '蛇妖', level: 4, hp: 250, attack: 25, defense: 12, reward: { qi: 150, stones: 80 }, avatar: '🐍' },
    { name: '鬼修', level: 5, hp: 350, attack: 35, defense: 18, reward: { qi: 300, stones: 150 }, avatar: '👻' },
    { name: '邪修', level: 6, hp: 500, attack: 50, defense: 25, reward: { qi: 600, stones: 300 }, avatar: '🧟' }
];

// 宗门数据
const SECTS = {
    sword: { name: '剑宗', bonus: 'attack', value: 1.2, description: '以剑道立宗' },
    pill: { name: '丹宗', bonus: 'alchemy', value: 1.3, description: '炼丹大师' },
    formation: { name: '阵宗', bonus: 'defense', value: 1.25, description: '精通阵法' },
    casual: { name: '散修', bonus: 'none', value: 1, description: '自由修炼' }
};

// ========== 全局游戏状态 ==========
let gameState = {
    player: null,
    currentPage: 'loginPage',
    isCultivating: false,
    cultivateInterval: null,
    currentEnemy: null,
    musicEnabled: true,
    soundEnabled: true,
    lastSaveTime: Date.now()
};

// ========== 玩家数据结构 ==========
function createPlayer(name) {
    const spiritualRoots = generateSpiritualRoots();
    return {
        name: name,
        spiritualRoots: spiritualRoots,
        realm: 0,
        qi: 0,
        maxQi: 100,
        hp: 100,
        maxHp: 100,
        mp: 100,
        maxMp: 100,
        attack: 10,
        defense: 5,
        spiritStones: 100,
        techniques: [],
        inventory: {
            pills: [],
            materials: [
                { id: 'spirit_grass', name: '灵草', count: 3, icon: '🌿' },
                { id: 'lingzhi', name: '灵芝', count: 2, icon: '🍄' }
            ],
            treasures: []
        },
        sect: 'casual',
        contribution: 0,
        caveLevel: 1,
        lastOnlineTime: Date.now()
    };
}

// 生成灵根属性
function generateSpiritualRoots() {
    const elements = ['金', '木', '水', '火', '土'];
    const roots = {};
    let total = 0;

    // 随机生成五行灵根值
    elements.forEach(element => {
        const value = Math.floor(Math.random() * 50) + 20;
        roots[element] = value;
        total += value;
    });

    // 找出最强灵根
    const maxElement = Object.keys(roots).reduce((a, b) => roots[a] > roots[b] ? a : b);
    roots.main = maxElement;
    roots.quality = total > 250 ? '上品' : total > 180 ? '中品' : '下品';

    return roots;
}

// ========== 页面导航 ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    gameState.currentPage = pageId;

    // 页面切换时的特殊处理
    if (pageId === 'techniquePage') {
        renderTechniqueList();
    } else if (pageId === 'alchemyPage') {
        renderRecipeList();
    } else if (pageId === 'inventoryPage') {
        renderInventory();
    } else if (pageId === 'cultivatePage') {
        updateCultivateDisplay();
    }

    playSound('click');
}

// ========== 角色创建与登录 ==========
function createCharacter() {
    const name = document.getElementById('playerName').value.trim();
    if (!name) {
        showFloatingMessage('请输入道号！');
        return;
    }

    gameState.player = createPlayer(name);
    saveGame();

    showFloatingMessage(`欢迎，${name}道友！`);
    playSound('success');

    setTimeout(() => {
        showPage('mainPage');
        updateUI();
    }, 1000);
}

function loadGame() {
    const savedData = localStorage.getItem('cultivationGame');
    if (!savedData) {
        showFloatingMessage('未找到存档！');
        return;
    }

    gameState.player = JSON.parse(savedData);

    // 计算离线收益
    calculateOfflineGains();

    showFloatingMessage(`欢迎回来，${gameState.player.name}道友！`);
    playSound('success');

    setTimeout(() => {
        showPage('mainPage');
        updateUI();
    }, 1000);
}

function saveGame() {
    if (gameState.player) {
        gameState.player.lastOnlineTime = Date.now();
        localStorage.setItem('cultivationGame', JSON.stringify(gameState.player));
        gameState.lastSaveTime = Date.now();
    }
}

// 计算离线收益
function calculateOfflineGains() {
    const player = gameState.player;
    const offlineTime = Date.now() - player.lastOnlineTime;
    const offlineHours = offlineTime / (1000 * 60 * 60);

    if (offlineHours > 0.1) { // 超过6分钟才计算
        const currentRealm = REALMS[player.realm];
        const baseGain = 10 * currentRealm.bonus;
        const caveBonus = 1 + (player.caveLevel * 0.1);
        const offlineGain = Math.floor(baseGain * offlineHours * caveBonus * 0.5); // 离线效率50%

        player.qi += offlineGain;
        showFloatingMessage(`离线修炼获得 ${offlineGain} 灵气！`);
    }
}

// ========== UI更新 ==========
function updateUI() {
    const player = gameState.player;
    if (!player) return;

    // 更新状态栏
    document.getElementById('playerNameDisplay').textContent = player.name;
    document.getElementById('realmDisplay').textContent = REALMS[player.realm].name;

    const rootText = `${player.spiritualRoots.quality}${player.spiritualRoots.main}灵根`;
    document.getElementById('spiritualRootDisplay').textContent = rootText;
    document.getElementById('spiritStones').textContent = player.spiritStones;

    // 更新灵气进度条
    const qiPercent = Math.min((player.qi / player.maxQi) * 100, 100);
    document.getElementById('qiBar').style.width = qiPercent + '%';
    document.getElementById('qiText').textContent = `${player.qi}/${player.maxQi}`;

    // 更新属性
    document.getElementById('hpDisplay').textContent = player.hp;
    document.getElementById('mpDisplay').textContent = player.mp;
    document.getElementById('attackDisplay').textContent = player.attack;
    document.getElementById('defenseDisplay').textContent = player.defense;

    // 更新洞府信息
    document.getElementById('caveLevel').textContent = player.caveLevel;
    document.getElementById('caveBonus').textContent = '+' + (player.caveLevel * 10) + '%';
}

// ========== 修炼系统 ==========
function startCultivate() {
    if (gameState.isCultivating) {
        stopCultivate();
        return;
    }

    gameState.isCultivating = true;
    document.getElementById('cultivateBtn').textContent = '停止修炼';
    document.getElementById('cultivateStatus').textContent = '修炼中...';
    document.getElementById('meditationCircle').classList.add('cultivating');

    playSound('cultivate');

    gameState.cultivateInterval = setInterval(() => {
        const player = gameState.player;
        const currentRealm = REALMS[player.realm];
        const rootBonus = player.spiritualRoots[player.spiritualRoots.main] / 50;
        const caveBonus = 1 + (player.caveLevel * 0.1);

        // 计算灵气增长
        const qiGain = Math.floor(Math.random() * 5 + 3) * rootBonus * caveBonus;
        player.qi += qiGain;

        updateUI();
        updateCultivateDisplay();

        // 显示修炼获得
        if (Math.random() < 0.3) {
            showFloatingMessage(`+${Math.floor(qiGain)} 灵气`);
        }

        // 检查是否可以突破
        const nextRealm = REALMS[player.realm + 1];
        if (nextRealm && player.qi >= nextRealm.requiredQi) {
            stopCultivate();
            document.getElementById('breakthroughBtn').style.display = 'block';
            showFloatingMessage('灵气充盈，可尝试突破！');
        }

        saveGame();
    }, 1000);
}

function stopCultivate() {
    gameState.isCultivating = false;
    clearInterval(gameState.cultivateInterval);
    document.getElementById('cultivateBtn').textContent = '开始修炼';
    document.getElementById('cultivateStatus').textContent = '点击开始修炼';
    document.getElementById('meditationCircle').classList.remove('cultivating');
}

function updateCultivateDisplay() {
    const player = gameState.player;
    const currentRealm = REALMS[player.realm];
    const nextRealm = REALMS[player.realm + 1];

    document.getElementById('currentRealm').textContent = currentRealm.name;

    if (nextRealm) {
        const progress = Math.min((player.qi / nextRealm.requiredQi) * 100, 100);
        document.getElementById('cultivateProgress').textContent = progress.toFixed(1) + '%';
        document.getElementById('breakthroughRequired').textContent = nextRealm.requiredQi;
    } else {
        document.getElementById('cultivateProgress').textContent = '已达巅峰';
        document.getElementById('breakthroughRequired').textContent = '∞';
    }
}

function attemptBreakthrough() {
    const player = gameState.player;
    const nextRealm = REALMS[player.realm + 1];

    if (!nextRealm) {
        showFloatingMessage('已达最高境界！');
        return;
    }

    if (player.qi < nextRealm.requiredQi) {
        showFloatingMessage('灵气不足，无法突破！');
        return;
    }

    // 突破成功率计算
    const baseChance = 0.7;
    const rootBonus = player.spiritualRoots[player.spiritualRoots.main] / 100;
    const successChance = baseChance + rootBonus;

    playSound('breakthrough');

    if (Math.random() < successChance) {
        // 突破成功
        player.realm++;
        player.qi = 0;
        player.maxQi = nextRealm.requiredQi;
        player.maxHp += 50;
        player.hp = player.maxHp;
        player.maxMp += 30;
        player.mp = player.maxMp;
        player.attack = Math.floor(player.attack * 1.3);
        player.defense = Math.floor(player.defense * 1.2);

        showFloatingMessage(`恭喜！突破至${nextRealm.name}！`);
        createBreakthroughEffect();

        document.getElementById('breakthroughBtn').style.display = 'none';
    } else {
        // 突破失败
        player.qi = Math.floor(player.qi * 0.8);
        showFloatingMessage('突破失败，损失部分修为...');
    }

    updateUI();
    updateCultivateDisplay();
    saveGame();
}

// 突破特效
function createBreakthroughEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        color: #d4af37;
        text-shadow: 0 0 50px rgba(212, 175, 55, 1);
        z-index: 9999;
        animation: breakthroughAnim 2s ease-out forwards;
    `;
    effect.textContent = '✨ 突破成功 ✨';
    document.body.appendChild(effect);

    setTimeout(() => effect.remove(), 2000);
}

// ========== 功法系统 ==========
function renderTechniqueList(filter = 'all') {
    const list = document.getElementById('techniqueList');
    list.innerHTML = '';

    const filteredTechniques = filter === 'all'
        ? TECHNIQUES
        : TECHNIQUES.filter(t => t.type === filter);

    filteredTechniques.forEach(technique => {
        const isLearned = gameState.player.techniques.some(t => t.id === technique.id);

        const card = document.createElement('div');
        card.className = 'technique-card';
        card.innerHTML = `
            <h3>${technique.name}</h3>
            <span class="grade">${technique.grade}</span>
            <p>${technique.description}</p>
            <p>效果：${technique.effect}</p>
            <p>消耗：${technique.cost} 灵石</p>
            ${isLearned ? '<p class="learned">✓ 已学习</p>' : ''}
        `;

        if (!isLearned) {
            card.onclick = () => learnTechnique(technique);
        }

        list.appendChild(card);
    });
}

function filterTechniques(type) {
    // 更新按钮状态
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderTechniqueList(type);
}

function learnTechnique(technique) {
    const player = gameState.player;

    if (player.spiritStones < technique.cost) {
        showFloatingMessage('灵石不足！');
        return;
    }

    if (player.techniques.some(t => t.id === technique.id)) {
        showFloatingMessage('已学习此功法！');
        return;
    }

    player.spiritStones -= technique.cost;
    player.techniques.push({ ...technique, proficiency: 0 });

    // 应用功法效果
    applyTechniqueEffect(technique);

    showFloatingMessage(`学会了 ${technique.name}！`);
    playSound('success');

    renderTechniqueList();
    updateUI();
    saveGame();
}

function applyTechniqueEffect(technique) {
    const player = gameState.player;

    // 解析效果字符串
    if (technique.effect.includes('攻击')) {
        const bonus = parseInt(technique.effect.match(/\d+/)[0]);
        player.attack += bonus;
    } else if (technique.effect.includes('灵力')) {
        const bonus = parseInt(technique.effect.match(/\d+/)[0]);
        player.maxMp += bonus;
        player.mp = player.maxMp;
    }
}

// ========== 炼丹系统 ==========
function renderRecipeList() {
    const list = document.getElementById('recipeList');
    list.innerHTML = '';

    RECIPES.forEach(recipe => {
        const hasRecipe = gameState.player.techniques.some(t =>
            t.type === 'pill' && t.effect.includes(recipe.name)
        );

        if (!hasRecipe && recipe.id !== 'qi_pill') {
            return; // 没有丹方就不显示（除了基础聚气丹）
        }

        const item = document.createElement('div');
        item.className = 'recipe-item';
        item.innerHTML = `
            <h4>${recipe.name}</h4>
            <p>材料：${recipe.ingredients.join(', ')}</p>
            <p>成功率：${(recipe.successRate * 100).toFixed(0)}%</p>
        `;

        item.onclick = () => selectRecipe(recipe);
        list.appendChild(item);
    });
}

let selectedRecipe = null;

function selectRecipe(recipe) {
    selectedRecipe = recipe;

    // 更新选中状态
    document.querySelectorAll('.recipe-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.recipe-item').classList.add('selected');

    // 显示所需材料
    const ingredientsDiv = document.getElementById('selectedIngredients');
    ingredientsDiv.innerHTML = `<p>需要材料：${recipe.ingredients.join(', ')}</p>`;
}

function startAlchemy() {
    if (!selectedRecipe) {
        showFloatingMessage('请先选择丹方！');
        return;
    }

    const player = gameState.player;

    // 检查材料
    const materialMap = {
        '灵草': 'spirit_grass',
        '灵芝': 'lingzhi',
        '血参': 'blood_ginseng',
        '龙血草': 'dragon_grass',
        '凤羽花': 'phoenix_flower',
        '天心石': 'sky_stone'
    };

    const canCraft = selectedRecipe.ingredients.every(ingredientName => {
        const materialId = materialMap[ingredientName];
        const material = player.inventory.materials.find(m => m.id === materialId);
        return material && material.count > 0;
    });

    if (!canCraft) {
        showFloatingMessage('材料不足！');
        return;
    }

    // 消耗材料
    selectedRecipe.ingredients.forEach(ingredientName => {
        const materialId = materialMap[ingredientName];
        const material = player.inventory.materials.find(m => m.id === materialId);
        if (material) {
            material.count--;
        }
    });

    // 开始炼丹动画
    const furnaceFire = document.getElementById('furnaceFire');
    furnaceFire.classList.add('active');
    playSound('alchemy');

    setTimeout(() => {
        furnaceFire.classList.remove('active');

        // 计算成功率
        const fireControl = document.getElementById('fireControl').value;
        const fireBonus = 1 - Math.abs(fireControl - selectedRecipe.fire) / 100;
        let successChance = selectedRecipe.successRate * fireBonus;

        // 宗门加成
        if (gameState.player.sect === 'pill') {
            successChance *= SECTS.pill.value;
        }

        if (Math.random() < successChance) {
            // 炼丹成功
            const pill = {
                id: selectedRecipe.id,
                name: selectedRecipe.name,
                effect: selectedRecipe.effect,
                value: selectedRecipe.value,
                count: 1,
                icon: '💊'
            };

            const existingPill = player.inventory.pills.find(p => p.id === pill.id);
            if (existingPill) {
                existingPill.count++;
            } else {
                player.inventory.pills.push(pill);
            }

            showFloatingMessage(`炼制成功！获得 ${selectedRecipe.name}`);
            playSound('success');
        } else {
            showFloatingMessage('炼制失败...');
        }

        saveGame();
    }, 2000);
}

// 更新火候显示
document.getElementById('fireControl')?.addEventListener('input', function() {
    document.getElementById('fireLevel').textContent = this.value + '%';
});

// ========== 战斗系统 ==========
function findEnemy() {
    const player = gameState.player;

    // 根据境界匹配敌人
    const suitableEnemies = ENEMIES.filter(e =>
        e.level >= player.realm && e.level <= player.realm + 2
    );

    if (suitableEnemies.length === 0) {
        showFloatingMessage('未找到合适的对手！');
        return;
    }

    const enemy = { ...suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)] };
    enemy.maxHp = enemy.hp;
    enemy.currentHp = enemy.hp;

    gameState.currentEnemy = enemy;

    // 初始化战斗界面
    document.getElementById('playerCombatName').textContent = player.name;
    document.getElementById('enemyName').textContent = enemy.name;
    document.querySelector('.enemy-avatar').textContent = enemy.avatar;

    updateCombatUI();

    // 显示战斗按钮
    const actionsDiv = document.getElementById('combatActions');
    actionsDiv.innerHTML = `
        <button class="ancient-btn" onclick="playerAttack()">普通攻击</button>
        <button class="ancient-btn" onclick="playerSkill()">技能攻击</button>
        <button class="ancient-btn secondary" onclick="usePillInCombat()">使用丹药</button>
        <button class="ancient-btn secondary" onclick="fleeCombat()">逃跑</button>
    `;

    addCombatLog(`遭遇 ${enemy.name}！`);
    playSound('combat');
}

function updateCombatUI() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    if (!enemy) return;

    // 更新玩家血条
    const playerHpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('playerCombatHP').style.width = playerHpPercent + '%';
    document.getElementById('playerHPText').textContent = `${player.hp}/${player.maxHp}`;

    const playerMpPercent = (player.mp / player.maxMp) * 100;
    document.getElementById('playerCombatMP').style.width = playerMpPercent + '%';
    document.getElementById('playerMPText').textContent = `${player.mp}/${player.maxMp}`;

    // 更新敌人血条
    const enemyHpPercent = (enemy.currentHp / enemy.maxHp) * 100;
    document.getElementById('enemyCombatHP').style.width = enemyHpPercent + '%';
    document.getElementById('enemyHPText').textContent = `${enemy.currentHp}/${enemy.maxHp}`;
}

function addCombatLog(message) {
    const log = document.getElementById('combatLog');
    const p = document.createElement('p');
    p.textContent = message;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function playerAttack() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    if (!enemy) return;

    // 计算伤害
    let damage = Math.max(1, player.attack - enemy.defense);
    damage += Math.floor(Math.random() * 10);

    // 宗门加成
    if (player.sect === 'sword') {
        damage = Math.floor(damage * SECTS.sword.value);
    }

    enemy.currentHp -= damage;
    addCombatLog(`你对 ${enemy.name} 造成了 <span class="damage">${damage}</span> 点伤害！`);

    updateCombatUI();

    // 检查敌人是否死亡
    if (enemy.currentHp <= 0) {
        winCombat();
        return;
    }

    // 敌人反击
    setTimeout(enemyAttack, 1000);
}

function playerSkill() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    if (!enemy) return;

    const mpCost = 20;
    if (player.mp < mpCost) {
        showFloatingMessage('灵力不足！');
        return;
    }

    player.mp -= mpCost;

    // 技能伤害是普通攻击的1.8倍
    let damage = Math.max(1, Math.floor(player.attack * 1.8) - enemy.defense);
    damage += Math.floor(Math.random() * 15);

    if (player.sect === 'sword') {
        damage = Math.floor(damage * SECTS.sword.value);
    }

    enemy.currentHp -= damage;
    addCombatLog(`你施展技能，对 ${enemy.name} 造成了 <span class="damage">${damage}</span> 点伤害！`);

    updateCombatUI();

    if (enemy.currentHp <= 0) {
        winCombat();
        return;
    }

    setTimeout(enemyAttack, 1000);
}

function enemyAttack() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    if (!enemy) return;

    let damage = Math.max(1, enemy.attack - player.defense);
    damage += Math.floor(Math.random() * 8);

    // 宗门防御加成
    if (player.sect === 'formation') {
        damage = Math.floor(damage / SECTS.formation.value);
    }

    player.hp -= damage;
    addCombatLog(`${enemy.name} 对你造成了 <span class="damage">${damage}</span> 点伤害！`);

    updateCombatUI();
    updateUI();

    if (player.hp <= 0) {
        loseCombat();
    }
}

function usePillInCombat() {
    const player = gameState.player;
    const healingPill = player.inventory.pills.find(p => p.effect === 'hp');

    if (!healingPill || healingPill.count === 0) {
        showFloatingMessage('没有疗伤丹！');
        return;
    }

    healingPill.count--;
    if (healingPill.count === 0) {
        player.inventory.pills = player.inventory.pills.filter(p => p.id !== healingPill.id);
    }

    const heal = Math.floor(player.maxHp * 0.5);
    player.hp = Math.min(player.maxHp, player.hp + heal);

    addCombatLog(`你使用了疗伤丹，恢复了 <span class="heal">${heal}</span> 点生命！`);
    updateCombatUI();
    updateUI();

    setTimeout(enemyAttack, 1000);
}

function fleeCombat() {
    if (Math.random() < 0.7) {
        showFloatingMessage('成功逃跑！');
        endCombat();
    } else {
        addCombatLog('逃跑失败！');
        setTimeout(enemyAttack, 1000);
    }
}

function winCombat() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    addCombatLog(`你击败了 ${enemy.name}！`);

    // 获得奖励
    player.qi += enemy.reward.qi;
    player.spiritStones += enemy.reward.stones;

    showFloatingMessage(`获得 ${enemy.reward.qi} 灵气，${enemy.reward.stones} 灵石！`);
    playSound('success');

    // 随机掉落材料
    if (Math.random() < 0.4) {
        const materials = ['spirit_grass', 'lingzhi', 'blood_ginseng'];
        const dropId = materials[Math.floor(Math.random() * materials.length)];
        const material = player.inventory.materials.find(m => m.id === dropId);
        if (material) {
            material.count++;
            showFloatingMessage(`获得 ${material.name}！`);
        }
    }

    updateUI();
    saveGame();

    setTimeout(endCombat, 2000);
}

function loseCombat() {
    const player = gameState.player;

    addCombatLog('你被击败了...');
    showFloatingMessage('战斗失败，损失部分灵石...');

    player.spiritStones = Math.max(0, Math.floor(player.spiritStones * 0.9));
    player.hp = Math.floor(player.maxHp * 0.3);

    updateUI();
    saveGame();

    setTimeout(endCombat, 2000);
}

function endCombat() {
    gameState.currentEnemy = null;
    document.getElementById('combatLog').innerHTML = '';

    const actionsDiv = document.getElementById('combatActions');
    actionsDiv.innerHTML = '<button class="ancient-btn" onclick="findEnemy()">寻找对手</button>';

    // 重置战斗界面
    document.getElementById('enemyName').textContent = '妖兽';
    document.querySelector('.enemy-avatar').textContent = '👹';
}

// ========== 宗门系统 ==========
function joinSect(sectType) {
    const player = gameState.player;

    if (player.sect === sectType) {
        showFloatingMessage('已加入该宗门！');
        return;
    }

    player.sect = sectType;
    player.contribution = 0;

    const sect = SECTS[sectType];
    showFloatingMessage(`加入了 ${sect.name}！`);
    playSound('success');

    document.getElementById('currentSect').textContent = sect.name;
    document.getElementById('contribution').textContent = player.contribution;

    saveGame();
}

// ========== 储物袋系统 ==========
function renderInventory(filter = 'all') {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';

    const player = gameState.player;
    let items = [];

    if (filter === 'all' || filter === 'pills') {
        items = items.concat(player.inventory.pills.map(item => ({ ...item, type: 'pill' })));
    }
    if (filter === 'all' || filter === 'materials') {
        items = items.concat(player.inventory.materials.map(item => ({ ...item, type: 'material' })));
    }
    if (filter === 'all' || filter === 'treasures') {
        items = items.concat(player.inventory.treasures.map(item => ({ ...item, type: 'treasure' })));
    }

    items.forEach(item => {
        if (item.count === 0) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <div class="item-icon">${item.icon || '📦'}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-count">x${item.count}</div>
        `;

        itemDiv.onclick = () => useItem(item);
        grid.appendChild(itemDiv);
    });

    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#b8b8aa;padding:40px;">空空如也</p>';
    }
}

function filterInventory(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderInventory(type);
}

function useItem(item) {
    const player = gameState.player;

    if (item.type === 'pill') {
        if (item.effect === 'qi') {
            player.qi += item.value;
            showFloatingMessage(`使用 ${item.name}，获得 ${item.value} 灵气！`);
        } else if (item.effect === 'hp') {
            const heal = Math.floor(player.maxHp * 0.5);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            showFloatingMessage(`使用 ${item.name}，恢复 ${heal} 生命！`);
        }

        item.count--;
        if (item.count === 0) {
            player.inventory.pills = player.inventory.pills.filter(p => p.id !== item.id);
        }

        playSound('use');
        updateUI();
        renderInventory();
        saveGame();
    }
}

// ========== 粒子动画系统 ==========
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 创建粒子
const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ========== 浮动消息系统 ==========
function showFloatingMessage(message) {
    const container = document.getElementById('floatingMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'floating-message';
    msgDiv.textContent = message;

    container.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove();
    }, 2000);
}

// ========== 音效系统 ==========
function playSound(type) {
    if (!gameState.soundEnabled) return;

    // 使用Web Audio API生成简单音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'click':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'success':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.15;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'cultivate':
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.08;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'breakthrough':
            oscillator.frequency.value = 1000;
            gainNode.gain.value = 0.2;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'combat':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.12;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'alchemy':
            oscillator.frequency.value = 500;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.4);
            break;
        case 'use':
            oscillator.frequency.value = 700;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

function toggleBackgroundMusic() {
    gameState.musicEnabled = !gameState.musicEnabled;
    const btn = document.getElementById('toggleMusic');
    btn.textContent = gameState.musicEnabled ? '🎵' : '🔇';
    btn.style.opacity = gameState.musicEnabled ? '1' : '0.5';
}

function toggleSoundEffects() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('toggleSound');
    btn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    btn.style.opacity = gameState.soundEnabled ? '1' : '0.5';
}

// ========== 自动保存 ==========
setInterval(() => {
    if (gameState.player && Date.now() - gameState.lastSaveTime > 60000) {
        saveGame();
    }
}, 60000); // 每分钟自动保存

// ========== 页面加载完成后初始化 ==========
window.addEventListener('load', () => {
    // 检查是否有存档
    const savedData = localStorage.getItem('cultivationGame');
    if (savedData) {
        // 显示继续游戏按钮
        console.log('找到存档');
    }
});

// 页面关闭前保存
window.addEventListener('beforeunload', () => {
    if (gameState.player) {
        saveGame();
    }
});
