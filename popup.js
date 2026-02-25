// 雪花动画开关功能
document.getElementById('toggleBtn').addEventListener('click', async () => {
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

            const toggleBtn = document.getElementById('toggleBtn');
            if (response.isEnabled) {
                toggleBtn.textContent = '关闭雪花';
                toggleBtn.classList.remove('off');
            } else {
                toggleBtn.textContent = '开启雪花';
                toggleBtn.classList.add('off');
            }
        });
    } catch (error) {
        console.error('操作失败:', error);
        alert('操作失败，请刷新页面重试');
    }
});

// 设置按钮点击事件
document.getElementById('settingsBtn').addEventListener('click', () => {
    alert('设置功能开发中...');
});

// 页面加载时获取当前雪花状态
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('获取状态失败:', chrome.runtime.lastError);
                const toggleBtn = document.getElementById('toggleBtn');
                toggleBtn.textContent = '开启雪花';
                toggleBtn.classList.add('off');
                return;
            }

            const toggleBtn = document.getElementById('toggleBtn');
            if (response.isEnabled) {
                toggleBtn.textContent = '关闭雪花';
                toggleBtn.classList.remove('off');
            } else {
                toggleBtn.textContent = '开启雪花';
                toggleBtn.classList.add('off');
            }
        });
    } catch (error) {
        console.error('获取状态失败:', error);
    }
});
