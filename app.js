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
