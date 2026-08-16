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

    // 提取正文（从 currentPostData 读取，不依赖 DOM）
    let rawContent = '';
    if (Array.isArray(currentPostData.content)) {
        rawContent = currentPostData.content.join(' ');
    } else if (typeof currentPostData.content === 'string') {
        rawContent = currentPostData.content;
    }
    rawContent = rawContent.replace(/<[^>]+>/g, '').trim();
    // 截取前100个字符
    let excerpt = rawContent.slice(0, 100);
    if (rawContent.length > 100) excerpt += '...';

    // 加载背景图
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgImageUrl;
    try {
        await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = () => reject(new Error('背景图加载失败'));
        });
    } catch (e) {
        // 背景图加载失败，使用纯色
    }

    const width = 1200,
        height = 630;
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

    // 圆角卡片
    const cardMargin = 80;
    const cardX = cardMargin,
        cardY = cardMargin;
    const cardW = width - 2 * cardMargin,
        cardH = height - 2 * cardMargin;
    const radius = 30;

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

    // ===== 标题 =====
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxWidth = cardW - 80;
    let fontSize = 44;
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;

    // 标题换行（修复版：按空格/标点优先换行）
    let titleLines = [];
    let currentLine = '';
    for (let i = 0; i < title.length; i++) {
        let testLine = currentLine + title[i];
        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
            // 如果当前字符是中文标点，连同标点一起换行
            if (['，', '。', '！', '？', '、', '：', '；'].includes(title[i])) {
                currentLine += title[i];
                titleLines.push(currentLine);
                currentLine = '';
            } else {
                titleLines.push(currentLine);
                currentLine = title[i];
            }
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) titleLines.push(currentLine);

    // 如果标题行数超过3行，减小字号
    while (titleLines.length > 3 && fontSize > 28) {
        fontSize -= 4;
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
        titleLines = [];
        currentLine = '';
        for (let i = 0; i < title.length; i++) {
            let testLine = currentLine + title[i];
            if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
                if (['，', '。', '！', '？', '、', '：', '；'].includes(title[i])) {
                    currentLine += title[i];
                    titleLines.push(currentLine);
                    currentLine = '';
                } else {
                    titleLines.push(currentLine);
                    currentLine = title[i];
                }
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) titleLines.push(currentLine);
    }

    const lineHeight = fontSize * 1.3;
    let startY = cardY + 50;
    ctx.fillStyle = '#1a1a2e';
    titleLines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    // ===== 日期 =====
    startY += titleLines.length * lineHeight + 20;
    ctx.font = `24px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(`📅 ${date} · 博客分享`, width / 2, startY);

    // ===== 正文摘要 =====
    if (excerpt && excerpt.length > 0) {
        startY += 45;
        ctx.font = `26px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
        ctx.fillStyle = '#333';
        let excerptLines = [];
        let currentExcerptLine = '';
        for (let i = 0; i < excerpt.length; i++) {
            let testLine = currentExcerptLine + excerpt[i];
            if (ctx.measureText(testLine).width > maxWidth && currentExcerptLine.length > 0) {
                excerptLines.push(currentExcerptLine);
                currentExcerptLine = excerpt[i];
            } else {
                currentExcerptLine = testLine;
            }
        }
        if (currentExcerptLine) excerptLines.push(currentExcerptLine);
        excerptLines = excerptLines.slice(0, 3);
        excerptLines.forEach((line, idx) => {
            ctx.fillText(line, width / 2, startY + idx * 38);
        });
    }

    // ===== 水印 =====
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = `20px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(150,150,150,0.8)';
    ctx.fillText(blogName, width - 40, height - 40);

    // 下载
    const link = document.createElement('a');
    link.download = `分享图-${title.slice(0, 20)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}