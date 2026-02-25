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
const MAX_PARTICLES = 400; // 大幅增加雪花数量到 400 片

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
    this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.4})`;
    this.angle = Math.random() * Math.PI * 2;
  }

  // 重置雪花到顶部
  reset() {
    this.x = Math.random() * width;
    this.y = -10; // 从屏幕顶部上方开始
    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 1.5 + 0.2;
    this.density = Math.random() * MAX_PARTICLES;
  }

  update() {
    this.angle += 0.005;
    this.x += Math.sin(this.angle) * 0.5;
    this.y += Math.cos(this.angle + this.density) * 0.5 + 0.5 + this.radius / 4;

    // 使用对象池技术：雪花掉出屏幕后重置到顶部，而非创建新对象
    if (this.y > height) {
      this.reset();
    }
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
  }

  draw() {
    ctx.beginPath();
    ctx.shadowBlur = 5;

    // 根据系统深色/浅色模式调整雪花颜色
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 深色模式：雪花白一点，发光
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)"; // 浅色阴影，在深色背景上更明显
    } else {
        // 浅色模式：雪花带点蓝灰，或者加阴影
        ctx.fillStyle = "rgba(200, 200, 210, 0.8)";
        ctx.shadowColor = "rgba(0,0,0,0.1)";
    }

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

// 初始化雪花对象池
createSnowflakePool();

// 雪花动画控制变量
let isSnowEnabled = true;
let animationId = null;

// 动画循环控制
function animate() {
  if (isSnowEnabled) {
    ctx.clearRect(0, 0, width, height);
    snowflakes.forEach(flake => {
      flake.update();
      flake.draw();
    });
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
    console.log('主题变化:', e.matches ? '深色模式' : '浅色模式');
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request); // 添加调试日志

  if (request.action === 'toggleSnow') {
    isSnowEnabled = !isSnowEnabled;
    sendResponse({ isEnabled: isSnowEnabled });
  } else if (request.action === 'getStatus') {
    sendResponse({ isEnabled: isSnowEnabled });
  }

  // 确保异步消息能正常响应
  return true;
});

console.log('雪花插件 content script 已加载'); // 添加加载确认日志

// 启动动画
animate();
