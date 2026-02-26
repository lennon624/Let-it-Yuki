// 1. 延迟初始化，确保 DOM 准备好
let canvas, ctx;
let width, height;
let isDarkTheme = false; // 主题状态
let isSnowEnabled = false; // 默认关闭雪花
let animationId = null;
let currentParticleCount = 600; // 默认显示的雪花数量（大雪）

// 2. 雪花粒子系统（使用对象池技术）
const snowflakes = [];
const MAX_PARTICLES = 1200; // 大幅增加雪花数量到 1200 片

class Snowflake {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.radius = Math.random() * 1.1 + 0.5; // 半径范围：0.5 到 1.6 像素（小雪花加大0.1）
    this.density = Math.random() * MAX_PARTICLES;
    // 建立半径与透明度的关联：半径越大，透明度越高（0.1 到 0.8）
    this.opacity = 0.1 + (this.radius / 1.6) * 0.7; // 最小0.1，最大0.8
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
    this.radius = Math.random() * 1.1 + 0.5; // 半径范围：0.5 到 1.6 像素（小雪花加大0.1）
    this.density = Math.random() * MAX_PARTICLES;
    // 建立半径与透明度的关联：半径越大，透明度越高（0.1 到 0.8）
    this.opacity = 0.1 + (this.radius / 1.6) * 0.7; // 最小0.1，最大0.8
    this.color = `rgba(255, 255, 255, ${this.opacity})`; // 重新计算颜色
    this.wobble = Math.random() * 1000; // 重置摇摆相位
    this.wobbleFrequency = Math.random() * 0.02 + 0.01; // 重置摇摆频率
    this.turbulence = Math.random() * 0.5; // 重置湍流程度
    this.turbulenceTimer = Math.random() * 1000; // 重置湍流定时器
  }

  update() {
    // 建立半径与速度的关联：速度与半径正相关（speed = baseSpeed + radius * multiplier）
    const baseSpeed = 0.3; // 基础速度
    const speedMultiplier = 0.4; // 速度乘数
    const totalSpeed = baseSpeed + this.radius * speedMultiplier; // 严格遵循物理公式

    // 增强风的模拟效果 - 大雪花摆动幅度更大
    this.wobble += this.wobbleFrequency;
    const wobbleAmount = Math.sin(this.wobble) * (0.1 + this.radius * 0.3); // 增大摇摆幅度

    // 角度更新 - 每个雪花有不同的摆动频率
    this.angle += 0.002 + (this.radius / 1.6) * 0.008; // 大雪花摆动更急

    // 水平移动：结合正弦摆动、摇摆效果，模拟真实的风动
    const windEffect = Math.sin(this.angle) * (0.3 + this.radius * 0.4);
    this.x += windEffect + wobbleAmount;
    // 垂直移动：半径越大，下落越快，创造3D纵深感
    this.y += totalSpeed;

    // 使用对象池技术：雪花掉出屏幕后重置到顶部，而非创建新对象
    if (this.y > height) {
      this.reset();
    }
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
  }

  draw() {
    ctx.beginPath();

    // 边缘发光效果：柔和的散景，shadowColor与填充颜色一致
    const glowRadius = this.radius * 0.8; // 发光半径与雪花大小正相关
    ctx.shadowBlur = glowRadius;
    ctx.shadowColor = this.color; // shadowColor与填充颜色一致

    // 使用雪花自身的颜色（包含透明度信息）
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

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

// 初始化画布
function initCanvas() {
  if (canvas) return; // 防止重复初始化

  // 创建画布
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');

  // 样式设置
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2147483647';
  document.body.appendChild(canvas);

  // 调整画布分辨率
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// 初始化主题
function initTheme() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkTheme = mediaQuery.matches;
  } else {
    isDarkTheme = false; // 默认浅色主题
  }

  // 根据主题设置画布样式
  if (ctx) {
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
  if (isSnowEnabled && canvas && ctx) {
    ctx.clearRect(0, 0, width, height);

    // 阴影颜色由雪花自身颜色决定，不再使用全局设置

    // 只更新和绘制指定数量的雪花
    let lastShadowBlur = null;
    for (let i = 0; i < currentParticleCount; i++) {
      const flake = snowflakes[i];
      flake.update();

      // 阴影设置由雪花自身控制，不需要全局优化

      flake.draw();
    }
  }
  animationId = requestAnimationFrame(animate);
}

// 初始化函数
function init() {
  initCanvas();
  createSnowflakePool();
  initTheme();
  animate();
}

// 等待 DOM 准备好后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  if (canvas) {
    canvas.width = width;
    canvas.height = height;
  }
});

// 监听系统主题变化
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    isDarkTheme = e.matches;
    console.log('主题变化:', e.matches ? '深色模式' : '浅色模式');

    // 更新主题样式
    if (ctx) {
      if (isDarkTheme) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      } else {
        ctx.fillStyle = 'rgba(200, 200, 210, 0.7)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      }
    }
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request); // 添加调试日志

  if (request.action === 'toggleSnow') {
    isSnowEnabled = !isSnowEnabled;

    // 如果关闭雪花，立即清空画布
    if (!isSnowEnabled && ctx) {
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
