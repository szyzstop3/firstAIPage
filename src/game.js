const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const startButton = document.getElementById('startButton');

// 游戏状态
let gameStarted = false;
let isAlive = true;
let initialEnemySpeed = 1.5;
let currentEnemySpeed = 1.5;
let speedIncreaseInterval;
let timerInterval;

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

// 射击相关变量
let canShoot = true;
let shootInterval;
let shootDelay = 250;

// 游戏时间计时器
let gameTimer = 0;
const VICTORY_TIME = 10;

// 添加事件监听器
startButton.addEventListener('click', startGame);

// 开始游戏
function startGame() {
    startGameCore();
}

function startGameCore() {
    gameStarted = true;
    isAlive = true;
    menuScreen.style.display = 'none';
    score = 0;
    gameTimer = 0;
    currentEnemySpeed = initialEnemySpeed;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    enemies = [];
    bullets = [];
    
    speedIncreaseInterval = setInterval(() => {
        if (gameStarted && isAlive) {
            currentEnemySpeed += 0.5;
        }
    }, 10000);

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

function updatePlayer() {
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.up && player.y > 0) player.y -= player.speed;
    if (keys.down && player.y < canvas.height - player.height) player.y += player.speed;

    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = '#4CAF50';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7;
        
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullets[i].x, bullets[i].y, 4, 10);

        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

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
        
        ctx.fillStyle = 'red';
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

        if (enemies[i].y > canvas.height) enemies.splice(i, 1);
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collision(player, enemies[i])) {
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

function collision(rect1, rect2) {
    if (rect1 === player) {
        const circleX = player.x + player.width / 2;
        const circleY = player.y + player.height / 2;
        const radius = player.width / 2;
        
        const rectCenterX = rect2.x + rect2.width / 2;
        const rectCenterY = rect2.y + rect2.height / 2;
        
        const distX = Math.abs(circleX - rectCenterX);
        const distY = Math.abs(circleY - rectCenterY);
        
        if (distX > (rect2.width / 2 + radius)) return false;
        if (distY > (rect2.height / 2 + radius)) return false;
        
        if (distX <= rect2.width / 2) return true;
        if (distY <= rect2.height / 2) return true;
        
        const cornerDistSq = Math.pow(distX - rect2.width / 2, 2) +
                            Math.pow(distY - rect2.height / 2, 2);
        
        return (cornerDistSq <= Math.pow(radius, 2));
    }
    
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + 4 > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + 10 > rect2.y;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${score}`, 10, 30);
    ctx.fillText(`剩余时间: ${Math.max(0, VICTORY_TIME - gameTimer)}秒`, 10, 60);
}

function shoot() {
    if (!gameStarted || !isAlive) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y
    });
}

function gameOver() {
    gameStarted = false;
    isAlive = false;
    clearInterval(speedIncreaseInterval);
    clearInterval(timerInterval);
    clearInterval(shootInterval);
    menuScreen.style.display = 'block';
    
    const defeatElement = document.createElement('h2');
    defeatElement.textContent = '游戏结束';
    defeatElement.style.color = '#ff4444';
    
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `最终得分: ${score}`;
    scoreElement.classList.add('final-score');
    
    const oldScore = menuScreen.querySelector('.final-score');
    if (oldScore) oldScore.remove();
    
    const oldResult = menuScreen.querySelector('.victory-text, .defeat-text');
    if (oldResult) oldResult.remove();
    
    defeatElement.classList.add('defeat-text');
    const button = menuScreen.querySelector('button');
    button.parentNode.insertBefore(defeatElement, button);
    button.parentNode.insertBefore(scoreElement, button);
}

function victory() {
    gameStarted = false;
    isAlive = false;
    clearInterval(speedIncreaseInterval);
    clearInterval(timerInterval);
    clearInterval(shootInterval);
    menuScreen.style.display = 'block';
    
    const victoryElement = document.createElement('h2');
    victoryElement.textContent = '胜利！';
    victoryElement.style.color = '#4CAF50';
    
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `最终得分: ${score}`;
    scoreElement.classList.add('final-score');
    
    const oldScore = menuScreen.querySelector('.final-score');
    if (oldScore) oldScore.remove();
    
    const oldVictory = menuScreen.querySelector('.victory-text');
    if (oldVictory) oldVictory.remove();
    
    victoryElement.classList.add('victory-text');
    const button = menuScreen.querySelector('button');
    button.parentNode.insertBefore(victoryElement, button);
    button.parentNode.insertBefore(scoreElement, button);
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
    if (e.key === ' ' && !keys.space) {
        keys.space = true;
        shoot();
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
        clearInterval(shootInterval);
    }
});

// 触摸事件支持
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleInput(x, y);
});

function handleInput(x, y) {
    const gameX = (x / canvas.clientWidth) * canvas.width;
    const gameY = (y / canvas.clientHeight) * canvas.height;
    // 处理触摸输入逻辑
} 