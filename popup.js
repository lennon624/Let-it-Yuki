// 雪花强度配置
const intensityConfig = {
    light: 200,    // 小雪：200片
    medium: 600,   // 大雪：600片（默认）
    heavy: 1200    // 暴雪：1200片
};

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
                alert('雪花效果未加载，请刷新页面重试');
                return;
            }

            // 由于现在是 checkbox，我们直接使用 e.target.checked 来控制
            // 但为了确保状态一致，我们会根据响应更新 checked 属性
            const toggleBtn = document.getElementById('toggleBtn');
            toggleBtn.checked = response.isEnabled;
        });
    } catch (error) {
        console.error('操作失败:', error);
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
    alert('设置功能开发中...');
});

// 页面加载时获取当前雪花状态
document.addEventListener('DOMContentLoaded', async () => {
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
    }
});
