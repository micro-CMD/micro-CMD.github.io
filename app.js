// ========== DOM 引用 ==========
const homePage = document.getElementById('home-page');
const postPage = document.getElementById('post-page');
const postContent = document.getElementById('post-content');
let currentPostData = null;

// ========== 随机背景图 ==========
(function setRandomBackground() {
    const images = [
        'images/OIP-C.png',
        'images/0723458a3aff6a65a4f0fa2e9301ed1c.png'
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];
    document.body.style.backgroundImage = `url(${selectedImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
})();

// ========== fetch 封装 ==========
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
    return res.json();
}

// ========== 渲染首页 ==========
async function renderHome() {
    homePage.style.display = 'block';
    postPage.style.display = 'none';
    homePage.innerHTML = '<div class="loading">加载中...</div>';

    try {
        const list = await fetchJSON('./posts/list.json');
        list.sort((a, b) => new Date(b.date) - new Date(a.date));

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

// ========== 渲染文章详情 ==========
async function renderPost(id) {
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    postContent.innerHTML = '<div class="loading">加载中...</div>';
    const shareSection = document.getElementById('share-section');
    if (shareSection) shareSection.style.display = 'none';

    try {
        const data = await fetchJSON(`./posts/${id}.json`);
        currentPostData = data;

        let contentArray = data.content;
        if (typeof contentArray === 'string') contentArray = [contentArray];
        if (!Array.isArray(contentArray)) contentArray = ['（内容格式错误）'];

        postContent.innerHTML = `
            <div style="margin-bottom:10px;color:#999;font-size:14px;" class="post-date-meta">📅 ${data.date || '日期未知'}</div>
            <h1>${data.title || '无标题'}</h1>
            ${contentArray.map(p => `<p>${p}</p>`).join('')}
        `;

        if (shareSection) shareSection.style.display = 'block';
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.onclick = generateShareImage;
        }
    } catch (err) {
        console.error('加载文章失败:', err);
        postContent.innerHTML = `<div style="color:red;padding:40px;">加载文章失败：${err.message}</div>`;
    }
}

// ========== 渲染关于 ==========
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

// ========== 路由导航 ==========
function navigate(path) {
    const currentHash = window.location.hash.slice(1) || '/';
    if (currentHash !== path) {
        window.location.hash = path;
    }

    if (path === '/' || path === '') {
        renderHome();
    } else if (path === '/about') {
        renderAbout();
    } else {
        const match = path.match(/^\/post\/(\d+)$/);
        if (match) {
            renderPost(match[1]);
        } else {
            renderHome();
        }
    }
}

// ========== 监听浏览器前进/后退 ==========
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || '/';
    navigate(hash);
});

// ========== 页面初始化 ==========
(async function init() {
    const hash = window.location.hash.slice(1) || '/';
    if (hash === '/about') {
        await renderAbout();
    } else if (hash.startsWith('/post/')) {
        const id = hash.split('/')[2];
        if (id) await renderPost(id);
        else await renderHome();
    } else {
        await renderHome();
    }
})();

// ========== 深色模式 ==========
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const btn = document.querySelector('.nav-links a:last-child');
    if (btn) {
        btn.textContent = newTheme === 'dark' ? '☀️ 明亮' : '🌓 深色';
    }
}

(function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const btn = document.querySelector('.nav-links a:last-child');
        if (btn) btn.textContent = '☀️ 明亮';
    }
})();

// ========== 生成分享图 ==========
async function generateShareImage() {
    if (!currentPostData) {
        alert('请先打开一篇文章');
        return;
    }

    const title = currentPostData.title || '无标题';
    const date = currentPostData.date || new Date().toISOString().slice(0, 10);
    const blogName = 'micro-CMD 的博客';
    const bgImageUrl = 'images/bg1.jpg';

    // 提取正文
    let fullContent = '';
    if (Array.isArray(currentPostData.content)) {
        fullContent = currentPostData.content.join(' ');
    } else if (typeof currentPostData.content === 'string') {
        fullContent = currentPostData.content;
    }
    fullContent = fullContent.replace(/<[^>]+>/g, '').trim();

    // ===== 竖屏尺寸（3:4 比例） =====
    const width = 600, height = 900;

    // 加载背景图
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgImageUrl;
    try {
        await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = () => reject(new Error('背景图加载失败'));
        });
    } catch (e) {}

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 绘制背景
    try {
        ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (e) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#667eea');
        grad.addColorStop(1, '#764ba2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // ===== 圆角卡片（更大占比，上下留白更小） =====
    const cardMargin = 30;
    const cardX = cardMargin, cardY = cardMargin;
    const cardW = width - 2 * cardMargin, cardH = height - 2 * cardMargin;
    const radius = 25;

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
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fill();

    // ===== 文字 =====
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxWidth = cardW - 40;

    // 标题（字号适配竖屏）
    let fontSize = 32;
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    let titleLines = [];
    let currentLine = '';
    for (let i = 0; i < title.length; i++) {
        let testLine = currentLine + title[i];
        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
            titleLines.push(currentLine);
            currentLine = title[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) titleLines.push(currentLine);
    while (titleLines.length > 3 && fontSize > 22) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
        titleLines = [];
        currentLine = '';
        for (let i = 0; i < title.length; i++) {
            let testLine = currentLine + title[i];
            if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
                titleLines.push(currentLine);
                currentLine = title[i];
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) titleLines.push(currentLine);
    }

    const lineHeight = fontSize * 1.3;
    let startY = cardY + 30;
    ctx.fillStyle = '#1a1a2e';
    titleLines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    // 日期
    startY += titleLines.length * lineHeight + 15;
    ctx.font = `18px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(`📅 ${date} · 博客分享`, width / 2, startY);

    // ===== 正文（竖屏显示更多） =====
    if (fullContent && fullContent.length > 0) {
        startY += 30;
        let contentFontSize = 20;
        ctx.font = `${contentFontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;

        let contentLines = [];
        let currentContentLine = '';
        for (let i = 0; i < fullContent.length; i++) {
            let testLine = currentContentLine + fullContent[i];
            if (ctx.measureText(testLine).width > maxWidth && currentContentLine.length > 0) {
                contentLines.push(currentContentLine);
                currentContentLine = fullContent[i];
            } else {
                currentContentLine = testLine;
            }
        }
        if (currentContentLine) contentLines.push(currentContentLine);

        // 计算可用空间，自适应字号
        const maxLines = Math.floor((cardH - (startY - cardY) - 60) / 30);
        while (contentLines.length > maxLines && contentFontSize > 14) {
            contentFontSize -= 1;
            ctx.font = `${contentFontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
            contentLines = [];
            currentContentLine = '';
            for (let i = 0; i < fullContent.length; i++) {
                let testLine = currentContentLine + fullContent[i];
                if (ctx.measureText(testLine).width > maxWidth && currentContentLine.length > 0) {
                    contentLines.push(currentContentLine);
                    currentContentLine = fullContent[i];
                } else {
                    currentContentLine = testLine;
                }
            }
            if (currentContentLine) contentLines.push(currentContentLine);
        }

        // 显示全部正文（如果超出就截断）
        const finalMaxLines = Math.floor((cardH - (startY - cardY) - 50) / 30);
        if (contentLines.length > finalMaxLines) {
            contentLines = contentLines.slice(0, finalMaxLines);
            let lastLine = contentLines[contentLines.length - 1];
            while (ctx.measureText(lastLine + '...').width > maxWidth && lastLine.length > 0) {
                lastLine = lastLine.slice(0, -1);
            }
            contentLines[contentLines.length - 1] = lastLine + '...';
        }

        ctx.fillStyle = '#333';
        const contentLineHeight = contentFontSize * 1.5;
        contentLines.forEach((line, idx) => {
            ctx.fillText(line, width / 2, startY + idx * contentLineHeight);
        });
    }

        // ===== 博客网址 =====
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = `16px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
        ctx.fillStyle = 'rgba(100,100,100,0.6)';
        ctx.fillText('https://micro-CMD.github.io', width / 2, height - 45);
    
    // 水印
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = `16px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(150,150,150,0.7)';
    ctx.fillText(blogName, width - 25, height - 25);

    // 下载
    const link = document.createElement('a');
    link.download = `分享图-${title.slice(0, 20)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}