// ========== DOM 引用 ==========
const homePage = document.getElementById('home-page');
const postPage = document.getElementById('post-page');
const postContent = document.getElementById('post-content');
const downloadPage = document.getElementById('download-page');
const downloadContent = document.getElementById('download-content');
let currentPostData = null;

// ========== 随机背景图 ==========
function setRandomBackground() {
    const images = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
        'https://images.unsplash.com/photo-1470071459604-7b8ec44ffd0b?w=1200',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200'
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    document.body.style.backgroundImage = `url(${images[randomIndex]})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
}
setRandomBackground();

// ========== fetch 封装 ==========
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
    return res.json();
}

// ========== 渲染首页 ==========
async function renderHome() {
    resetBackground();
    homePage.style.display = 'block';
    postPage.style.display = 'none';
    if (downloadPage) downloadPage.style.display = 'none';
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
    resetBackground();
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    if (downloadPage) downloadPage.style.display = 'none';
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
    resetBackground();
    homePage.style.display = 'none';
    postPage.style.display = 'block';
    if (downloadPage) downloadPage.style.display = 'none';
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

// ========== 恢复默认背景 ==========
// ========== 恢复默认背景 ==========
// ========== 恢复默认背景 ==========
function resetBackground() {
    // 恢复 container 背景
    const container = document.querySelector('.container');
    if (container) {
        container.style.background = '';
        container.style.backdropFilter = '';
        container.style.boxShadow = '';
    }
    // 恢复 body 随机背景
    setRandomBackground();
}

// ========== 渲染 Arcaea 下载页 ==========
function renderDownloadPage() {
    homePage.style.display = 'none';
    postPage.style.display = 'none';
    if (!downloadPage || !downloadContent) return;
    downloadPage.style.display = 'block';

    // ---- 让 container 背景透明 ----
    const container = document.querySelector('.container');
    if (container) {
        container.style.background = 'transparent';
        container.style.backdropFilter = 'none';
        container.style.boxShadow = 'none';
    }

    // ---- 设置整个页面的背景为 Arcaea 专属图 ----
    document.body.style.backgroundImage = "url('images/arcaea-bg.png')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';

    downloadPage.style.background = 'transparent';
    downloadPage.style.backgroundColor = 'transparent';

    downloadContent.innerHTML = `
        <div style="text-align: center; padding: 20px 0; background: rgba(56, 56, 56, 0.6); backdrop-filter: blur(8px); border-radius: 20px; margin: 20px;">
            <h2 style="font-size: 28px; margin-bottom: 10px;">🎵 Arcaea 下载</h2>
            <p style="color: #666; margin-bottom: 25px;">点击按钮获取最新版本 APK</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button id="download-arcaea-btn" 
                        style="display: inline-block; padding: 14px 40px; background: #4a6cf7; color: white; border: none; border-radius: 30px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(74,108,247,0.3); transition: 0.2s;"
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'">
                    ⬇️ 下载最新版
                </button>
                <a href="https://arcaea.lowiro.com/zh" 
                   target="_blank" 
                   style="display: inline-block; padding: 14px 40px; background: #6c757d; color: white; border-radius: 30px; text-decoration: none; font-weight: bold;">
                    🌐 前往官网
                </a>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #888;">
                💡 点击“下载最新版”将自动获取官方最新 APK 直链，若失败请前往官网下载。
            </p>
        </div>
    `;

    const btn = document.getElementById('download-arcaea-btn');
    if (btn) {
        btn.addEventListener('click', downloadArcaea);
    }
}
// ========== 下载 Arcaea（直接请求 API，使用 killcors 代理） ==========
// ========== 下载 Arcaea（多代理轮询） ==========
async function downloadArcaea() {
    const btn = document.getElementById('download-arcaea-btn');
    const originalText = btn ? btn.textContent : '下载中...';

    // 代理列表（按优先级排列）
    const proxies = [
        'https://corsproxy.io/?',
        'https://proxy.killcors.com?url='
    ];

    const api = 'https://webapi.lowiro.com/webapi/serve/static/bin/arcaea/apk';

    if (btn) {
        btn.textContent = '⏳ 尝试获取链接...';
        btn.disabled = true;
    }

    // 依次尝试每个代理
    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxy = proxies[i];
            const url = proxy + encodeURIComponent(api);
            const resp = await fetch(url, { signal: AbortSignal.timeout(8000) }); // 8秒超时
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();

            if (data.success && data.value && data.value.url) {
                // 成功获取到链接，打开下载
                window.open(data.value.url, '_blank');
                if (btn) {
                    btn.textContent = `✅ 已开始下载 (${data.value.version || '最新版'})`;
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 3000);
                }
                return; // 成功则退出函数
            }
        } catch (error) {
            console.warn(`代理 ${proxies[i]} 失败:`, error.message);
            // 继续尝试下一个代理
        }
    }

    // 所有代理都失败
    console.error('所有代理均无法获取下载链接');
    alert('获取下载链接失败，请前往官网下载。');
    if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ========== 下载 Arcaea（直接请求 API，使用 killcors 代理） ==========


// ========== 渲染 Phira 下载页 ==========
function renderPhiraDownloadPage() {
    resetBackground();
    homePage.style.display = 'none';
    postPage.style.display = 'none';
    if (!downloadPage || !downloadContent) return;
    downloadPage.style.display = 'block';

    const phiraUrl = 'https://gh-proxy.org/https://github.com/TeamFlos/phira/releases/download/v0.8.2/Phira-android-arm64-v8a-v0.8.2.apk';

    downloadContent.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
            <h2 style="font-size: 28px; margin-bottom: 10px;">🎵 Phira 下载</h2>
            <p style="color: #666; margin-bottom: 25px;">选择适合你的下载方式</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <a href="${phiraUrl}" 
                   target="_blank" 
                   style="display: inline-block; padding: 14px 40px; background: #4a6cf7; color: white; border-radius: 30px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(74,108,247,0.3); transition: 0.2s;"
                   onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'">
                    ⬇️ 下载 Phira v0.8.2
                </a>
                <a href="https://github.com/TeamFlos/phira/releases" 
                   target="_blank" 
                   style="display: inline-block; padding: 14px 40px; background: #2d3748; color: white; border-radius: 30px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(45,55,72,0.3);">
                    🌐 GitHub Releases
                </a>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #888;">
                💡 直链来自 gh-proxy 加速服务，若失效请前往 GitHub Releases 获取最新版本。
            </p>
        </div>
    `;
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
    } else if (path === '/arcaea-download') {
        renderDownloadPage();
    } else if (path === '/phira-download') {
        renderPhiraDownloadPage();
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
    } else if (hash === '/arcaea-download') {
        renderDownloadPage();
    } else if (hash === '/phira-download') {
        renderPhiraDownloadPage();
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

    let fullContent = '';
    if (Array.isArray(currentPostData.content)) {
        fullContent = currentPostData.content.join(' ');
    } else if (typeof currentPostData.content === 'string') {
        fullContent = currentPostData.content;
    }
    fullContent = fullContent.replace(/<[^>]+>/g, '').trim();

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgImageUrl;
    try {
        await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = () => reject(new Error('背景图加载失败'));
        });
    } catch (e) {}

    const width = 600, height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    try {
        ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (e) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#667eea');
        grad.addColorStop(1, '#764ba2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

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

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxWidth = cardW - 40;

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

    startY += titleLines.length * lineHeight + 15;
    ctx.font = `18px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(`📅 ${date} · 博客分享`, width / 2, startY);

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

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `16px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(100,100,100,0.6)';
    ctx.fillText('https://micro-CMD.github.io', width / 2, height - 45);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = `18px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(150,150,150,0.7)';
    ctx.fillText(blogName, width - 25, height - 25);

    const link = document.createElement('a');
    link.download = `分享图-${title.slice(0, 20)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}