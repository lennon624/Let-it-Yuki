// 1. 创建画布
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 2. 样式设置
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '2147483647';
document.body.appendChild(canvas);

// 3. 调整画布分辨率
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// 4. 雪花粒子系统（使用对象池技术）
const snowflakes = [];
const MAX_PARTICLES = 1200; // 大幅增加雪花数量到 1200 片

// 创建雪花对象池
function createSnowflakePool() {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const flake = new Snowflake();
    // 初始化雪花到不可见位置
    flake.x = Math.random() * width;
    flake.y = -Math.random() * height; // 从屏幕顶部上方开始下落
    snowflakes.push(flake);
  }
}

class Snowflake {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.radius = Math.random() * 1.5 + 0.2;
    this.density = Math.random() * MAX_PARTICLES;
    this.opacity = Math.random() * 0.7 + 0.3; // 透明度从 0.3 到 1.0 随机
    this.color = `rgba(255, 255, 255, ${this.opacity})`;
    this.angle = Math.random() * Math.PI * 2;
    this.wobble = Math.random() * 1000; // 摇摆属性的初始相位
    this.wobbleFrequency = Math.random() * 0.02 + 0.01; // 摇摆频率
    this.turbulence = Math.random() * 0.5; // 湍流程度
    this.turbulenceTimer = Math.random() * 1000; // 湍流定时器
  }

  // 重置雪花到顶部
  reset() {
    this.x = Math.random() * width;
    this.y = -10; // 从屏幕顶部上方开始
    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 1.5 + 0.2;
    this.density = Math.random() * MAX_PARTICLES;
    this.opacity = Math.random() * 0.7 + 0.3; // 重置透明度（0.3 到 1.0 随机）
    this.color = `rgba(255, 255, 255, ${this.opacity})`; // 重新计算颜色
    this.wobble = Math.random() * 1000; // 重置摇摆相位
    this.wobbleFrequency = Math.random() * 0.02 + 0.01; // 重置摇摆频率
    this.turbulence = Math.random() * 0.5; // 重置湍流程度
    this.turbulenceTimer = Math.random() * 1000; // 重置湍流定时器
  }

  update() {
    // 空气阻力模拟：大雪花受到的阻力大，飘得慢
    const speedFactor = 1.2 - (this.radius / 2.5); // 半径越大，速度越慢

    // 摇摆效果（Wobble）优化
    this.wobble += this.wobbleFrequency;
    const wobbleAmount = Math.sin(this.wobble) * (0.3 + this.radius * 0.1);

    // 角度更新
    this.angle += 0.005;

    // 水平移动：结合正弦摆动、摇摆效果（简化了湍流计算）
    this.x += Math.sin(this.angle) * 0.5 + wobbleAmount;
    // 垂直移动：速度受半径影响，大雪花下落快，小雪花下落慢
    // 半径越大，速度越快，这样大雪花下落得更快
    this.y += (Math.cos(this.angle + this.density) * 0.5 + 0.5) * speedFactor + (this.radius / 4);

    // 使用对象池技术：雪花掉出屏幕后重置到顶部，而非创建新对象
    if (this.y > height) {
      this.reset();
    }
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
  }

  draw() {
    ctx.beginPath();

    // 优化阴影模糊，避免过大值影响性能
    if (this.radius > 1.0) {
        const glowRadius = Math.min(3, 1 + this.radius * 1); // 限制最大发光半径
        ctx.shadowBlur = glowRadius;
    } else {
        ctx.shadowBlur = 0; // 小雪花不添加发光效果
    }

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

// 初始化雪花对象池
createSnowflakePool();

// 初始化主题
initTheme();

// 雪花动画控制变量
let isSnowEnabled = false; // 默认关闭雪花
let animationId = null;
let currentParticleCount = 600; // 默认显示的雪花数量（大雪）
let isDarkTheme = false; // 主题状态

// 初始化主题
function initTheme() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkTheme = mediaQuery.matches;

    // 根据主题设置画布样式
    if (isDarkTheme) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    } else {
      ctx.fillStyle = 'rgba(200, 200, 210, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    }
  }
}

// 动画循环控制
function animate() {
  if (isSnowEnabled) {
    ctx.clearRect(0, 0, width, height);
    // 只更新和绘制指定数量的雪花
    let lastShadowBlur = null;
    for (let i = 0; i < currentParticleCount; i++) {
      const flake = snowflakes[i];
      flake.update();

      // 优化阴影设置：只有在阴影模糊值变化时才更新
      if (flake.radius > 1.0) {
        const glowRadius = Math.min(3, 1 + flake.radius * 1);
        if (lastShadowBlur !== glowRadius) {
          ctx.shadowBlur = glowRadius;
          lastShadowBlur = glowRadius;
        }
      } else {
        if (lastShadowBlur !== 0) {
          ctx.shadowBlur = 0;
          lastShadowBlur = 0;
        }
      }

      flake.draw();
    }
  }
  animationId = requestAnimationFrame(animate);
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// 监听系统主题变化
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    isDarkTheme = e.matches;
    console.log('主题变化:', e.matches ? '深色模式' : '浅色模式');

    // 更新主题样式
    if (isDarkTheme) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    } else {
      ctx.fillStyle = 'rgba(200, 200, 210, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    }
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request); // 添加调试日志

  if (request.action === 'toggleSnow') {
    isSnowEnabled = !isSnowEnabled;

    // 如果关闭雪花，立即清空画布
    if (!isSnowEnabled) {
      ctx.clearRect(0, 0, width, height);
    }

    sendResponse({ isEnabled: isSnowEnabled });
  } else if (request.action === 'getStatus') {
    sendResponse({ isEnabled: isSnowEnabled });
  } else if (request.action === 'setParticleCount') {
    // 设置雪花数量
    const newCount = request.count;
    if (newCount >= 0 && newCount <= MAX_PARTICLES) {
      currentParticleCount = newCount;
      console.log('雪花数量已设置为:', currentParticleCount);
      sendResponse({ success: true, count: currentParticleCount });
    } else {
      sendResponse({ success: false, error: '数量必须在 0 到 ' + MAX_PARTICLES + ' 之间' });
    }
  } else if (request.action === 'getParticleCount') {
    // 获取当前雪花数量
    sendResponse({ count: currentParticleCount, maxCount: MAX_PARTICLES });
  }

  // 确保异步消息能正常响应
  return true;
});

console.log('雪花插件 content script 已加载'); // 添加加载确认日志

// 启动动画
animate();
