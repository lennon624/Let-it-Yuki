// 语言配置
const translations = {
    'zh-CN': {
        title: 'letityuki.',
        subtitle: '为你的屏幕降下一场初雪。',
        snowToggle: '落雪',
        intensityTitle: '降雪模式',
        light: '粉雪',
        medium: '飘雪',
        heavy: '吹雪',
        densityTitle: '雪花密度',
        settingsBtn: '偏好设置 ⚙',
        languageSetting: '语言',
        chinese: '中文',
        english: 'English',
        japanese: '日本語'
    },
    'en-US': {
        title: 'letityuki.',
        subtitle: 'Bring a gentle snowfall to your screen.',
        snowToggle: 'Snow',
        intensityTitle: 'Snowfall Mode',
        light: 'Powder',
        medium: 'Steady',
        heavy: 'Blizzard',
        densityTitle: 'Flake Density',
        settingsBtn: 'Preferences ⚙',
        languageSetting: 'Language',
        chinese: '中文',
        english: 'English',
        japanese: '日本語'
    },
    'ja-JP': {
        title: 'letityuki.',
        subtitle: 'あなたの画面に、静かな初雪を。',
        snowToggle: '雪',
        intensityTitle: '降雪モード',
        light: '粉雪',
        medium: '綿雪',
        heavy: '吹雪',
        densityTitle: '雪の密度',
        settingsBtn: '環境設定 ⚙',
        languageSetting: '言語',
        chinese: '中文',
        english: 'English',
        japanese: '日本語'
    }
};

// 雪花强度配置
const intensityConfig = {
    light: 200,    // 小雪：200片
    medium: 600,   // 大雪：600片（默认）
    heavy: 1200    // 暴雪：1200片
};

// 获取当前语言设置
let currentLanguage = 'zh-CN'; // 默认中文

// 初始化语言设置
function initLanguage() {
    // 从存储中获取用户语言设置
    chrome.storage.sync.get(['language'], (result) => {
        if (result.language) {
            currentLanguage = result.language;
        }
        updateUI();
    });
}

// 更新界面语言
function updateUI() {
    const t = translations[currentLanguage];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('p').textContent = t.subtitle;
    document.querySelector('.main-switch-text').textContent = t.snowToggle;
    document.querySelectorAll('.section-title')[0].textContent = t.intensityTitle;
    document.querySelectorAll('.section-title')[1].textContent = t.densityTitle;
    document.getElementById('lightBtn').textContent = t.light;
    document.getElementById('mediumBtn').textContent = t.medium;
    document.getElementById('heavyBtn').textContent = t.heavy;
    document.getElementById('settingsBtn').textContent = t.settingsBtn;
}

// 切换语言
function switchLanguage(language) {
    currentLanguage = language;
    chrome.storage.sync.set({ language: language });
    updateUI();
}

// 雪花动画开关功能
document.getElementById('toggleBtn').addEventListener('change', async (e) => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('当前活动标签页:', tab);

        // 发送消息到 content script
        chrome.tabs.sendMessage(tab.id, { action: 'toggleSnow' }, (response) => {
            console.log('收到响应:', response);

            if (chrome.runtime.lastError) {
                console.error('消息发送失败:', chrome.runtime.lastError);
                // 尝试直接注入 content script
                try {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tab.id },
                            files: ['snow.js']
                        },
                        () => {
                            // 注入成功后再次发送消息
                            chrome.tabs.sendMessage(tab.id, { action: 'toggleSnow' }, (response2) => {
                                if (chrome.runtime.lastError) {
                                    console.error('再次发送消息失败:', chrome.runtime.lastError);
                                    e.target.checked = false;
                                    alert('雪花效果加载失败，请刷新页面后重试');
                                    return;
                                }
                                // 注入成功后的处理
                                const toggleBtn = document.getElementById('toggleBtn');
                                toggleBtn.checked = response2.isEnabled;
                            });
                        }
                    );
                } catch (injectError) {
                    console.error('注入脚本失败:', injectError);
                    e.target.checked = false;
                    alert('雪花效果加载失败，请刷新页面后重试');
                }
                return;
            }

            // 由于现在是 checkbox，我们直接使用 e.target.checked 来控制
            // 但为了确保状态一致，我们会根据响应更新 checked 属性
            const toggleBtn = document.getElementById('toggleBtn');
            toggleBtn.checked = response.isEnabled;
        });
    } catch (error) {
        console.error('操作失败:', error);
        // 重置 toggle 状态
        document.getElementById('toggleBtn').checked = false;
        alert('操作失败，请刷新页面重试');
    }
});

// 雪花强度控制功能
document.getElementById('lightBtn').addEventListener('click', async () => {
    await setSnowIntensity('light');
});

document.getElementById('mediumBtn').addEventListener('click', async () => {
    await setSnowIntensity('medium');
});

document.getElementById('heavyBtn').addEventListener('click', async () => {
    await setSnowIntensity('heavy');
});

// 滑动条控制功能
document.getElementById('particleCount').addEventListener('input', async (e) => {
    try {
        const newCount = parseInt(e.target.value);
        document.getElementById('countValue').textContent = newCount;

        // 根据数值自动调整按钮状态
        let intensity;
        if (newCount <= 400) {
            intensity = 'light';
        } else if (newCount <= 800) {
            intensity = 'medium';
        } else {
            intensity = 'heavy';
        }

        // 更新按钮状态
        document.querySelectorAll('.intensity-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${intensity}Btn`).classList.add('active');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, {
            action: 'setParticleCount',
            count: newCount
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('设置雪花数量失败:', chrome.runtime.lastError);
                return;
            }

            if (!response.success) {
                console.error('设置失败:', response.error);
            }
        });
    } catch (error) {
        console.error('操作失败:', error);
    }
});

// 设置雪花强度函数
async function setSnowIntensity(intensity) {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const count = intensityConfig[intensity];

        // 更新按钮状态
        document.querySelectorAll('.intensity-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${intensity}Btn`).classList.add('active');

        // 更新滑动条值
        document.getElementById('particleCount').value = count;
        document.getElementById('countValue').textContent = count;

        // 发送消息到 content script
        chrome.tabs.sendMessage(tab.id, {
            action: 'setParticleCount',
            count: count
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('设置雪花强度失败:', chrome.runtime.lastError);
                return;
            }

            if (!response.success) {
                console.error('设置失败:', response.error);
            }
        });
    } catch (error) {
        console.error('操作失败:', error);
    }
}

// 设置按钮点击事件
document.getElementById('settingsBtn').addEventListener('click', () => {
    showSettingsDialog();
});

// 显示设置对话框
function showSettingsDialog() {
    const t = translations[currentLanguage];

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-family: inherit;
    `;

    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 20px;
        width: 280px;
        max-width: 90vw;
        color: #f0f0f0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;

    // 标题
    const dialogTitle = document.createElement('h2');
    dialogTitle.style.cssText = `
        font-size: 16px;
        margin: 0 0 16px 0;
        text-align: center;
    `;
    dialogTitle.textContent = t.settingsBtn;
    dialogContent.appendChild(dialogTitle);

    // 语言设置
    const languageSection = document.createElement('div');
    languageSection.style.cssText = `
        margin-bottom: 20px;
    `;

    const languageTitle = document.createElement('div');
    languageTitle.style.cssText = `
        font-size: 12px;
        color: #888;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;
    languageTitle.textContent = t.languageSetting;
    languageSection.appendChild(languageTitle);

    const languageButtons = document.createElement('div');
    languageButtons.style.cssText = `
        display: flex;
        background: #121212;
        border-radius: 8px;
        padding: 3px;
        border: 1px solid #333;
    `;

    // 中文按钮
    const chineseBtn = document.createElement('button');
    chineseBtn.style.cssText = `
        flex: 1;
        padding: 8px 0;
        font-size: 12px;
        background: ${currentLanguage === 'zh-CN' ? '#333' : 'transparent'};
        color: ${currentLanguage === 'zh-CN' ? '#f0f0f0' : '#888'};
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    `;
    chineseBtn.textContent = t.chinese;
    chineseBtn.addEventListener('click', () => {
        switchLanguage('zh-CN');
        updateDialogText();
    });
    languageButtons.appendChild(chineseBtn);

    // 英文按钮
    const englishBtn = document.createElement('button');
    englishBtn.style.cssText = `
        flex: 1;
        padding: 8px 0;
        font-size: 12px;
        background: ${currentLanguage === 'en-US' ? '#333' : 'transparent'};
        color: ${currentLanguage === 'en-US' ? '#f0f0f0' : '#888'};
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    `;
    englishBtn.textContent = t.english;
    englishBtn.addEventListener('click', () => {
        switchLanguage('en-US');
        updateDialogText();
    });
    languageButtons.appendChild(englishBtn);

    // 日语按钮
    const japaneseBtn = document.createElement('button');
    japaneseBtn.style.cssText = `
        flex: 1;
        padding: 8px 0;
        font-size: 12px;
        background: ${currentLanguage === 'ja-JP' ? '#333' : 'transparent'};
        color: ${currentLanguage === 'ja-JP' ? '#f0f0f0' : '#888'};
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    `;
    japaneseBtn.textContent = t.japanese;
    japaneseBtn.addEventListener('click', () => {
        switchLanguage('ja-JP');
        updateDialogText();
    });
    languageButtons.appendChild(japaneseBtn);

    languageSection.appendChild(languageButtons);
    dialogContent.appendChild(languageSection);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        width: 100%;
        padding: 8px;
        font-size: 12px;
        background: #333;
        color: #f0f0f0;
        border: 1px solid #444;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
    `;
    // 设置关闭按钮初始文本
    let closeText;
    if (currentLanguage === 'zh-CN') {
        closeText = '关闭';
    } else if (currentLanguage === 'en-US') {
        closeText = 'Close';
    } else if (currentLanguage === 'ja-JP') {
        closeText = '閉じる';
    }
    closeBtn.textContent = closeText;
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    dialogContent.appendChild(closeBtn);

    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);

    // 更新对话框文本的函数
    function updateDialogText() {
        const t = translations[currentLanguage];
        dialogTitle.textContent = t.settingsBtn;
        languageTitle.textContent = t.languageSetting;
        chineseBtn.textContent = t.chinese;
        englishBtn.textContent = t.english;
        japaneseBtn.textContent = t.japanese;
        chineseBtn.style.background = currentLanguage === 'zh-CN' ? '#333' : 'transparent';
        chineseBtn.style.color = currentLanguage === 'zh-CN' ? '#f0f0f0' : '#888';
        englishBtn.style.background = currentLanguage === 'en-US' ? '#333' : 'transparent';
        englishBtn.style.color = currentLanguage === 'en-US' ? '#f0f0f0' : '#888';
        japaneseBtn.style.background = currentLanguage === 'ja-JP' ? '#333' : 'transparent';
        japaneseBtn.style.color = currentLanguage === 'ja-JP' ? '#f0f0f0' : '#888';

        // 更新关闭按钮文本
        if (currentLanguage === 'zh-CN') {
            closeBtn.textContent = '关闭';
        } else if (currentLanguage === 'en-US') {
            closeBtn.textContent = 'Close';
        } else if (currentLanguage === 'ja-JP') {
            closeBtn.textContent = '閉じる';
        }
    }
}

// 页面加载时获取当前雪花状态并初始化语言
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化语言设置
    initLanguage();

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // 获取雪花启用状态
        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('获取状态失败:', chrome.runtime.lastError);
                const toggleBtn = document.getElementById('toggleBtn');
                toggleBtn.checked = false;
                return;
            }

            const toggleBtn = document.getElementById('toggleBtn');
            toggleBtn.checked = response.isEnabled;
        });

        // 获取当前雪花数量并更新按钮状态
        chrome.tabs.sendMessage(tab.id, { action: 'getParticleCount' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('获取雪花数量失败:', chrome.runtime.lastError);
                // 如果 content script 未加载，设置默认状态
                document.getElementById('particleCount').value = 600;
                document.getElementById('countValue').textContent = 600;
                document.getElementById('mediumBtn').classList.add('active');
                return;
            }

            // 根据当前数量判断强度级别并更新按钮
            let intensity = 'light'; // 默认小雪
            const count = response.count;

            if (count <= 400) {
                intensity = 'light';
            } else if (count <= 800) {
                intensity = 'medium';
            } else {
                intensity = 'heavy';
            }

            // 更新按钮状态
            document.querySelectorAll('.intensity-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`${intensity}Btn`).classList.add('active');

            // 更新滑动条值
            document.getElementById('particleCount').value = count;
            document.getElementById('countValue').textContent = count;
        });
    } catch (error) {
        console.error('获取状态失败:', error);
        // 设置默认状态
        document.getElementById('toggleBtn').checked = false;
        document.getElementById('particleCount').value = 600;
        document.getElementById('countValue').textContent = 600;
        document.getElementById('mediumBtn').classList.add('active');
    }
});
