// ========== 随机背景图（立即执行） ==========
(function setRandomBackground() {
    const images = [
        'images/0723458a3aff6a65a4f0fa2e9301ed1c.png',
        'images/OIP-C.png',
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];
    document.body.style.backgroundImage = `url(${selectedImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
})();

// ---------- DOM 引用 ----------
const homePage = document.getElementById('home-page');
const postPage = document.getElementById('post-page');
const postContent = document.getElementById('post-content');

// ---------- 工具：fetch 封装 ----------
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
    return res.json();
}

// ---------- 渲染首页 ----------
async function renderHome() {
    homePage.style.display = 'block';
    postPage.style.display = 'none';
    homePage.innerHTML = '<div class="loading">加载中...</div>';

    try {
        const list = await fetchJSON('./posts/list.json');
        homePage.innerHTML = list.map(post => `
            <div class="post-item" onclick="navigate('/post/${post.id}')">
                <div class="post-title">${post.title}</div>
                <div class="post-meta">📅 ${post.date}  ·  ☕ ${post.readTime || 2}分钟阅读</div>
                <div class="post-excerpt">${post.excerpt}</div>
            </div>
        `).join('');
    } catch (err) {
        homePage.innerHTML = `<div style="color:red;padding:40px;">加载文章列表失败：${err.message}</div>`;
        console.error(err);
    }
}

// ---------- 渲染文章详情 ----------
async function renderPost(id) {
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    postContent.innerHTML = '<div class="loading">加载中...</div>';

    try {
        const data = await fetchJSON(`./posts/${id}.json`);
        postContent.innerHTML = `
            <div style="margin-bottom:10px;color:#999;font-size:14px;">📅 ${data.date}</div>
            <h1>${data.title}</h1>
            ${data.content.map(p => `<p>${p}</p>`).join('')}
        `;
    } catch (err) {
        postContent.innerHTML = `<div style="color:red;padding:40px;">加载文章失败：${err.message}</div>`;
        console.error(err);
    }
}

// ---------- 渲染关于 ----------
async function renderAbout() {
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    postContent.innerHTML = '<div class="loading">加载中...</div>';

    try {
        const data = await fetchJSON('./posts/about.json');
        postContent.innerHTML = `
            <h1>${data.title}</h1>
            ${data.content.map(p => `<p>${p}</p>`).join('')}
        `;
    } catch (err) {
        postContent.innerHTML = `<div style="color:red;padding:40px;">加载关于页面失败：${err.message}</div>`;
        console.error(err);
    }
}

// ---------- 路由导航 ----------
function navigate(path) {
    // 更新 hash（但不触发多余事件）
    const currentHash = window.location.hash.slice(1) || '/';
    if (currentHash !== path) {
        window.location.hash = path;
    }

    // 根据路径渲染
    if (path === '/' || path === '') {
        renderHome();
    } else if (path === '/about') {
        renderAbout();
    } else {
        const match = path.match(/^\/post\/(\d+)$/);
        if (match) {
            renderPost(match[1]);
        } else {
            renderHome(); // 未知路径回首页
        }
    }
}

// ---------- 监听浏览器前进/后退 ----------
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || '/';
    navigate(hash);
});

// ---------- 页面初始化 ----------
// 直接根据当前 hash 决定显示什么，但默认显示首页
(async function init() {
    const hash = window.location.hash.slice(1) || '/';
    if (hash === '/about') {
        await renderAbout();
    } else if (hash.startsWith('/post/')) {
        const id = hash.split('/')[2];
        if (id) await renderPost(id);
        else await renderHome();
    } else {
        await renderHome(); // 默认首页
    }
})();

// ========== 深色模式切换 ==========
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // 记住用户偏好

    // 可选：修改按钮文字（增强体验）
    const btn = document.querySelector('.nav-links a:last-child');
    if (btn) {
        btn.textContent = newTheme === 'dark' ? '☀️ 明亮' : '🌓 深色';
    }
}

// 页面加载时，读取本地存储的设置
(function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        // 修改按钮文字
        const btn = document.querySelector('.nav-links a:last-child');
        if (btn) btn.textContent = '☀️ 明亮';
    }
})();
// ========== 生成分享图（Canvas） ==========
async function generateShareImage() {
    const titleEl = document.querySelector('#post-content h1');
    const dateEl = document.querySelector('#post-content .post-date-meta');
    if (!titleEl) return alert('未找到文章标题');

    const title = titleEl.textContent.trim();
    const date = dateEl ? dateEl.textContent.trim().replace('📅 ', '') : new Date().toISOString().slice(0,10);
    const blogName = 'micro-CMD 的博客';
    const bgImageUrl = 'images/0723458a3aff6a65a4f0fa2e9301ed1c.png'; // 可改成你想用的背景图

    // 1. 加载背景图
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgImageUrl;
    await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => reject(new Error('背景图加载失败'));
    });

    // 2. 设置画布尺寸（1200x630 标准分享图比例）
    const width = 1200, height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 3. 绘制背景图（铺满）
    ctx.drawImage(bgImg, 0, 0, width, height);

    // 4. 绘制半透明圆角卡片
    const cardMargin = 80;
    const cardX = cardMargin, cardY = cardMargin;
    const cardW = width - 2 * cardMargin, cardH = height - 2 * cardMargin;
    const radius = 30;

    // 绘制圆角矩形路径
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardW - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
    ctx.lineTo(cardX + cardW, cardY + cardH - radius);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
    ctx.lineTo(cardX + radius, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();

    // 填充半透明白色
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.fill();
    // 可选加描边
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. 绘制文字（需要中文字体，使用系统黑体）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 标题（支持自动换行）
    const maxTitleWidth = cardW - 80;
    let fontSize = 48;
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    let lines = [];
    let words = title.split('');
    let line = '';
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i];
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxTitleWidth && i > 0) {
            lines.push(line);
            line = words[i];
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line);
    // 如果行数太多，减小字号
    while (lines.length > 3 && fontSize > 28) {
        fontSize -= 4;
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
        lines = [];
        line = '';
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxTitleWidth && i > 0) {
                lines.push(line);
                line = words[i];
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line);
    }

    const lineHeight = fontSize * 1.3;
    const totalTitleHeight = lines.length * lineHeight;
    const startY = cardY + (cardH - totalTitleHeight - 80) / 2;

    ctx.fillStyle = '#1a1a2e';
    ctx.textBaseline = 'top';
    lines.forEach((line, idx) => {
        ctx.fillText(line, width/2, startY + idx * lineHeight);
    });

    // 日期（副标题）
    const dateFontSize = 28;
    ctx.font = `${dateFontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#666';
    const dateY = startY + totalTitleHeight + 30;
    ctx.fillText(`📅 ${date}  ·  博客分享`, width/2, dateY);

    // 水印（博客名称，右下角）
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = `20px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(150,150,150,0.8)';
    ctx.fillText(blogName, width - 40, height - 40);

    // 6. 导出为 PNG 并下载
    const link = document.createElement('a');
    link.download = `分享图-${title.slice(0,20)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ========== 在渲染文章时显示分享按钮 ==========
// 修改 renderPost 函数，在内容加载完成后显示分享区域
// 将你现有的 renderPost 函数替换为下面这个（或在你原有基础上加两行）

async function renderPost(id) {
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    postContent.innerHTML = '<div class="loading">加载中...</div>';
    // 隐藏分享按钮
    const shareSection = document.getElementById('share-section');
    if (shareSection) shareSection.style.display = 'none';

    try {
        const data = await fetchJSON(`./posts/${id}.json`);
        postContent.innerHTML = `
            <div style="margin-bottom:10px;color:#999;font-size:14px;" class="post-date-meta">📅 ${data.date}</div>
            <h1>${data.title}</h1>
            ${data.content.map(p => `<p>${p}</p>`).join('')}
        `;
        // 显示分享按钮
        if (shareSection) shareSection.style.display = 'block';
        // 绑定按钮事件（防止重复绑定）
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.onclick = generateShareImage;
        }
    } catch (err) {
        postContent.innerHTML = `<div style="color:red;padding:40px;">加载文章失败：${err.message}</div>`;
        console.error(err);
    }
}