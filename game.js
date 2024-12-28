const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');

// 游戏状态
let gameStarted = false;
let isAlive = true;
let initialEnemySpeed = 1.5;
let currentEnemySpeed = 1.5;
let speedIncreaseInterval;
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 50,
    speed: 5
};

let bullets = [];
let enemies = [];
let score = 0;

// 控制状态
let keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};

// 在游戏状态部分添加射击相关变量
let canShoot = true;
let shootInterval;
let shootDelay = 250; // 射击间隔（毫秒）

// 在游戏状态部分添加图片对象
const playerImg = new Image();
playerImg.src = './pimg.webp';

// 备用链接：
// 'https://img.alicdn.com/imgextra/i4/O1CN01c26DBL1L3ADHsvGAM_!!6000000001243-2-tps-124-141.png'

// 添加游戏时间计时器
let gameTimer = 0;
const VICTORY_TIME = 10; // 胜利需要坚持的秒数

// 开始游戏
function startGame() {
    // 确保图片已加载
    if (!playerImg.complete) {
        playerImg.onload = () => {
            startGameCore();
        };
        return;
    }
    startGameCore();
}

// 添加核心游戏启动函数
function startGameCore() {
    gameStarted = true;
    isAlive = true;
    menuScreen.style.display = 'none';
    score = 0;
    gameTimer = 0;  // 重置计时器
    currentEnemySpeed = initialEnemySpeed;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    enemies = [];
    bullets = [];
    
    // 每10秒增加敌人速度
    speedIncreaseInterval = setInterval(() => {
        if (gameStarted && isAlive) {
            currentEnemySpeed += 0.5;
        }
    }, 10000);

    // 添加游戏时间计时器
    gameTimer = 0;
    timerInterval = setInterval(() => {
        if (gameStarted && isAlive) {
            gameTimer++;
            if (gameTimer >= VICTORY_TIME) {
                victory();
            }
        }
    }, 1000);
    
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    if (!gameStarted || !isAlive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// 更新玩家位置
function updatePlayer() {
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.up && player.y > 0) player.y -= player.speed;
    if (keys.down && player.y < canvas.height - player.height) player.y += player.speed;

    // 使用图片绘制玩家，添加错误处理
    try {
        if (playerImg.complete) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            // 如果图片未加载，使用默认的矩形
            ctx.fillStyle = 'white';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    } catch (error) {
        console.error('绘制玩家图片时出错:', error);
        // 使用默认的矩形作为备用
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// 更新子弹
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7;
        
        // 绘制子弹
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullets[i].x, bullets[i].y, 4, 10);

        // 移除超出屏幕的子弹
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

// 更新敌人
function updateEnemies() {
    if (Math.random() < 0.02) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += currentEnemySpeed;
        
        // 绘制敌人
        ctx.fillStyle = 'red';
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

        // 移除超出屏幕的敌人
        if (enemies[i].y > canvas.height) enemies.splice(i, 1);
    }
}

// 碰撞检测
function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collision({
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height
        }, enemies[i])) {
            gameOver();
            return;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (collision(bullets[j], enemies[i])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 100;
                break;
            }
        }
    }
}

// 碰撞检测辅助函数
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + 4 > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + 10 > rect2.y;
}

// 绘制分数
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${score}`, 10, 30);
    
    // 显示剩余时间
    const remainingTime = Math.max(0, VICTORY_TIME - gameTimer);
    ctx.fillText(`剩余时间: ${remainingTime}秒`, 10, 60);
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
    if (e.key === ' ' && !keys.space) {
        keys.space = true;
        // 立即发射第一颗子弹
        shoot();
        // 设置连续射击间隔
        shootInterval = setInterval(shoot, shootDelay);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
    if (e.key === ' ') {
        keys.space = false;
        clearInterval(shootInterval);  // 停止连续射击
    }
});

// 添加射击函数
function shoot() {
    if (!gameStarted || !isAlive) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y
    });
}

// 添加游戏结束函数
function gameOver() {
    gameStarted = false;
    isAlive = false;
    clearInterval(speedIncreaseInterval);
    clearInterval(timerInterval);  // 添加这行
    clearInterval(shootInterval);
    menuScreen.style.display = 'block';
    
    // 更新菜单显示失败信息和最终分数
    const defeatElement = document.createElement('h2');
    defeatElement.textContent = '游戏结束';
    defeatElement.style.color = '#ff4444';
    
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `最终得分: ${score}`;
    scoreElement.classList.add('final-score');
    
    // 移除之前的分数显示（如果有）
    const oldScore = menuScreen.querySelector('.final-score');
    if (oldScore) {
        oldScore.remove();
    }
    
    // 移除之前的胜利/失败信息（如果有）
    const oldResult = menuScreen.querySelector('.victory-text, .defeat-text');
    if (oldResult) {
        oldResult.remove();
    }
    
    defeatElement.classList.add('defeat-text');
    const button = menuScreen.querySelector('button');
    button.parentNode.insertBefore(defeatElement, button);
    button.parentNode.insertBefore(scoreElement, button);
}

// 添加胜利函数
function victory() {
    gameStarted = false;
    isAlive = false;
    clearInterval(speedIncreaseInterval);
    clearInterval(timerInterval);
    clearInterval(shootInterval);
    menuScreen.style.display = 'block';
    
    // 更新菜单显示胜利信息和最终分数
    const victoryElement = document.createElement('h2');
    victoryElement.textContent = '胜利！';
    victoryElement.style.color = '#4CAF50';
    
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `最终得分: ${score}`;
    scoreElement.classList.add('final-score');
    
    // 移除之前的分数显示（如果有）
    const oldScore = menuScreen.querySelector('.final-score');
    if (oldScore) {
        oldScore.remove();
    }
    
    // 移除之前的胜利信息（如果有）
    const oldVictory = menuScreen.querySelector('.victory-text');
    if (oldVictory) {
        oldVictory.remove();
    }
    
    victoryElement.classList.add('victory-text');
    const button = menuScreen.querySelector('button');
    button.parentNode.insertBefore(victoryElement, button);
    button.parentNode.insertBefore(scoreElement, button);
}

// 添加触摸事件监听
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleInput(x, y);
});

// 修改handleInput方法以支持触摸
function handleInput(x, y) {
    // 将触摸坐标转换为游戏坐标
    const gameX = (x / canvas.clientWidth) * canvas.width;
    const gameY = (y / canvas.clientHeight) * canvas.height;
    
    // 处理游戏逻辑
    // ...
} 