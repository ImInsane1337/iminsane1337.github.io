const encryptionKey = 'supersecretkey';

function encrypt(text, key) {
    return text.split('').map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))).join('');
}

function decrypt(text, key) {
    return encrypt(text, key);
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return decodeURIComponent(cookieValue.trim());
        }
    }
    return null;
}

function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
}

function askForNickname() {
    let nickname = prompt('Введите ваш никнейм:');
    while (!nickname) {
        nickname = prompt('Введите ваш никнейм:');
    }
    document.cookie = `nickname=${encodeURIComponent(nickname)}; path=/;`;
}

function getNickname() {
    const nickname = getCookie('nickname');
    if (!nickname) {
        askForNickname();
    }
}

function formatNumber(num) {
    if (num >= 1e42) return (num / 1e42).toFixed(1) + ' Tr';
    if (num >= 1e39) return (num / 1e39).toFixed(1) + ' Dd';
    if (num >= 1e36) return (num / 1e36).toFixed(1) + ' U';
    if (num >= 1e33) return (num / 1e33).toFixed(1) + ' D';
    if (num >= 1e30) return (num / 1e30).toFixed(1) + ' N';
    if (num >= 1e27) return (num / 1e27).toFixed(1) + ' Oc';
    if (num >= 1e24) return (num / 1e24).toFixed(1) + ' Sp';
    if (num >= 1e21) return (num / 1e21).toFixed(1) + ' Sx';
    if (num >= 1e18) return (num / 1e18).toFixed(1) + ' Qi';
    if (num >= 1e15) return (num / 1e15).toFixed(1) + ' Qa';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + ' T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + ' K';
    return num;
}

let count = 0;
let clickPower = 1;
let autoClickInterval = 5000;
const autoClicker = document.getElementById('auto-clicker');
const bonusContainer = document.getElementById('bonus-container');
let bonusQueue = [];

function initCounter() {
    const encryptedCount = getCookie('counter');
    if (encryptedCount) {
        const decryptedCount = decrypt(encryptedCount, encryptionKey);
        count = parseInt(decryptedCount, 10);
    } else {
        count = 0;
    }
    updateCounter();
}

function updateCounter() {
    document.getElementById('counter').textContent = formatNumber(count);
    const encryptedCount = encrypt(count.toString(), encryptionKey);
    setCookie('counter', encryptedCount);
}

function updateUpgradeInfo() {
    const upgrades = JSON.parse(decrypt(getCookie('upgrades') || '{}', encryptionKey));
    document.getElementById('clickpower-level').textContent = upgrades.clickpower || 0;
    document.getElementById('auto-clicker-level').textContent = upgrades.autoclick || 0;
    document.getElementById('clickpower-power').textContent = clickPower.toFixed(1);
    document.getElementById('auto-clicker-speed').textContent = autoClickInterval;
    document.getElementById('autoclick-cost').textContent = (upgrades.autoclick ? 100 * (upgrades.autoclick + 1) : 100);
    document.getElementById('clickpower-cost').textContent = (upgrades.clickpower ? 50 * (upgrades.clickpower + 1) : 50);
}

document.getElementById('coin').addEventListener('click', () => {
    count += clickPower;
    updateCounter();
    showBonus();
    applyClickEffect();
});

function showBonus() {
    if (bonusQueue.length >= 5) {
        const oldBonus = bonusQueue.shift(); // Удаляем старый бонус
        oldBonus.remove();
    }

    const bonusAmount = `+${clickPower.toFixed(1)}`;
    const newBonus = document.createElement('div');
    newBonus.className = 'bonus-text';
    newBonus.textContent = bonusAmount;

    // Позиционируем бонус вверху
    const coinRect = document.getElementById('coin').getBoundingClientRect();
    newBonus.style.left = `${coinRect.left + coinRect.width / 2}px`;
    newBonus.style.top = `${coinRect.top}px`;

    // Рандомный наклон
    const tilt = Math.random() * 10 - 5; // От -5 до 5 градусов
    newBonus.style.transform = `rotate(${tilt}deg)`;

    // Добавляем анимацию
    newBonus.style.animation = 'bonusAnimation 0.4s ease forwards';

    bonusContainer.appendChild(newBonus);
    bonusQueue.push(newBonus);
}

function applyClickEffect() {
    const coin = document.getElementById('coin');
    coin.classList.add('click-effect');
    setTimeout(() => {
        coin.classList.remove('click-effect');
    }, 200); // Удаляем класс через 200ms, чтобы эффект завершился
}

function toggleUpgradePanel() {
    const upgradePanel = document.getElementById('upgrade-panel');
    upgradePanel.classList.toggle('visible');
}

function buyUpgrade(upgrade) {
    let upgrades = getCookie('upgrades');
    if (!upgrades) {
        upgrades = { autoclick: 0, clickpower: 0 };
    } else {
        upgrades = JSON.parse(decrypt(upgrades, encryptionKey));
    }

    if (upgrade === 'autoclick') {
        const autoclickCost = (upgrades.autoclick ? 100 * (upgrades.autoclick + 1) : 100);
        if (count >= autoclickCost) {
            count -= autoclickCost;
            upgrades.autoclick = (upgrades.autoclick || 0) + 1;
            autoClickInterval = Math.max(autoClickInterval - 1000, 1000); // Уменьшить интервал на 1 секунду до минимума 1 секунда
            updateCounter();
            setCookie('upgrades', encrypt(JSON.stringify(upgrades), encryptionKey));
            updateUpgradeInfo();
        }
    } else if (upgrade === 'clickpower') {
        const clickpowerCost = (upgrades.clickpower ? 50 * (upgrades.clickpower + 1) : 50);
        if (count >= clickpowerCost) {
            count -= clickpowerCost;
            upgrades.clickpower = (upgrades.clickpower || 0) + 1;
            clickPower += 0.5;
            updateCounter();
            setCookie('upgrades', encrypt(JSON.stringify(upgrades), encryptionKey));
            updateUpgradeInfo();
        }
    }
}

function startAutoClicker() {
    setInterval(() => {
        const upgrades = JSON.parse(decrypt(getCookie('upgrades') || '{}', encryptionKey));
        if (upgrades.autoclick > 0) {
            autoClicker.style.opacity = 1;
            autoClicker.style.left = '0';
            autoClicker.style.bottom = '0';
            setTimeout(() => {
                count += clickPower;
                updateCounter();
                autoClicker.style.transition = `all ${autoClickInterval / 1000}s linear`;
                autoClicker.style.left = '50%';
                autoClicker.style.bottom = '50%';
                setTimeout(() => {
                    autoClicker.style.opacity = 0;
                }, autoClickInterval);
            }, 100);
        }
    }, autoClickInterval);
}

window.onload = () => {
    getNickname();
    initCounter();
    updateUpgradeInfo();
    startAutoClicker();
};
