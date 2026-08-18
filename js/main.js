// 个人主页交互逻辑
// 1. 主题切换与本地缓存
// 2. 导航栏、滚动状态与移动端菜单
// 3. 页面加载动画与滚动进度条
// 4. 打字机效果与滚动激活导航
// 5. 粒子背景 canvas 与自定义鼠标光标
// 6. 可见性动画、数字计数、技能进度条
// 7. 项目筛选、按钮波纹与卡片倾斜效果
// 8. 联系表单校验与提交反馈
// 9. 返回顶部和平滑滚动

const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu-panel');
const siteHeader = document.querySelector('.site-header');
const scrollProgress = document.querySelector('.scroll-progress');
const loadingScreen = document.querySelector('.loading-screen');
const loaderProgress = document.getElementById('loader-progress');
const backToTop = document.getElementById('backToTop');
const typingText = document.getElementById('typing-text');
const form = document.getElementById('contactForm');
const statusBox = document.querySelector('.form-status');
const statNumbers = document.querySelectorAll('.stat-number');
const skillFills = document.querySelectorAll('.skill-fill');
const revealElements = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');
const siteYear = document.getElementById('siteYear');
const copyrightYear = document.getElementById('copyrightYear');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

const typedWords = ['工具开发者', '效率创造者', '代码爱好者', '终身学习者'];

// 主题初始化：从 localStorage 或系统偏好读取
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light', isLight);
  const icon = document.querySelector('.theme-icon');
  if (icon) {
    icon.textContent = isLight ? '🌙' : '☀️';
  }
}

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(prefersLight ? 'light' : 'dark');
}

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('light') ? 'dark' : 'light';
  applyTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
});

const savedThemeValue = localStorage.getItem('theme');
if (savedThemeValue) {
  applyTheme(savedThemeValue);
}

// 页面滚动：顶部进度条、导航背景、返回顶部按钮显示
function updateScrollState() {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  if (siteHeader) {
    siteHeader.classList.toggle('scrolled', window.scrollY > 18);
  }
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

// 移动端菜单展开/收起，并同步 aria-expanded
menuToggle?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.mobile-nav .nav-link, .main-nav .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// 加载动画：模拟进度加载后淡出
let loadingValue = 0;
function simulateLoading() {
  if (!loadingScreen) return;
  if (loadingValue >= 100) {
    loadingScreen.classList.add('hidden');
    return;
  }

  loadingValue += Math.random() * 20 + 10;
  if (loaderProgress) {
    loaderProgress.style.width = `${Math.min(loadingValue, 100)}%`;
  }
  setTimeout(simulateLoading, 120);
}
window.addEventListener('load', () => {
  setTimeout(simulateLoading, 200);
});

// 打字机效果：循环输出多句文本
let typeState = { text: '', wordIndex: 0, charIndex: 0, isDeleting: false };

function typeLoop() {
  const currentWord = typedWords[typeState.wordIndex];

  if (!typeState.isDeleting) {
    typeState.text = currentWord.slice(0, ++typeState.charIndex);
  } else {
    typeState.text = currentWord.slice(0, --typeState.charIndex);
  }

  typingText.textContent = typeState.text;

  let delay = typeState.isDeleting ? 60 : 120;

  if (!typeState.isDeleting && typeState.text === currentWord) {
    delay = 1400;
    typeState.isDeleting = true;
  } else if (typeState.isDeleting && typeState.text === '') {
    typeState.isDeleting = false;
    typeState.wordIndex = (typeState.wordIndex + 1) % typedWords.length;
    delay = 280;
  }

  setTimeout(typeLoop, delay);
}

typeLoop();

// IntersectionObserver：滚动进入视口时触发 reveal 动画
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => revealObserver.observe(element));

// 当前导航高亮：根据滚动位置设置 active
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isActive);
      });
    });
  },
  { threshold: 0.55 }
);

sections.forEach((section) => sectionObserver.observe(section));

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// 数字计数动画：进入视口后从 0 增长到目标值
function animateNumber(element) {
  const target = Number(element.dataset.target || 0);
  const duration = 1600;
  const start = performance.now();

  function run(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    element.textContent = `${value}${target === 99 ? '%' : ''}`;

    if (progress < 1) {
      requestAnimationFrame(run);
    } else {
      element.textContent = `${target}${target === 99 ? '%' : ''}`;
    }
  }

  requestAnimationFrame(run);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

statNumbers.forEach((number) => statObserver.observe(number));

// 技能条按需动画：从 0 到目标百分比
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const value = fill.style.getPropertyValue('--value') || '0%';
        fill.style.width = value;
        skillObserver.unobserve(fill);
      }
    });
  },
  { threshold: 0.5 }
);

skillFills.forEach((fill) => skillObserver.observe(fill));

// 项目筛选：全部/工具/网页/其他
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});

// 按钮点击波纹效果
const rippleButtons = document.querySelectorAll('.ripple-btn');
rippleButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// 3D 卡片倾斜效果（可选但已实现）
const tiltCards = document.querySelectorAll('.tilt-card');

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = (0.5 - (y / rect.height)) * 12;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// 粒子背景 canvas：鼠标交互导致连线/排斥效果
const particleCanvas = document.getElementById('particle-canvas');
const particleCtx = particleCanvas.getContext('2d');
const particles = [];
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };

function resizeCanvas() {
  const hero = document.querySelector('.hero');
  const rect = hero.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const ratio = window.devicePixelRatio || 1;

  particleCanvas.width = width * ratio;
  particleCanvas.height = height * ratio;
  particleCanvas.style.width = `${width}px`;
  particleCanvas.style.height = `${height}px`;
  particleCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  particles.length = 0;
  const count = Math.min(90, Math.max(48, Math.floor((width * height) / 12)));

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2
    });
  }
}

function animateParticles() {
  const width = particleCanvas.width / (window.devicePixelRatio || 1);
  const height = particleCanvas.height / (window.devicePixelRatio || 1);

  particleCtx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 120) {
        const force = (120 - distance) / 120;
        particle.x -= (dx / distance) * force * 2.6;
        particle.y -= (dy / distance) * force * 2.6;
      }
    }

    particleCtx.beginPath();
    particleCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    particleCtx.fillStyle = `rgba(167, 139, 250, ${particle.opacity})`;
    particleCtx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const next = particles[j];
      const distX = particle.x - next.x;
      const distY = particle.y - next.y;
      const dist = Math.hypot(distX, distY);

      if (dist < 100) {
        particleCtx.beginPath();
        particleCtx.moveTo(particle.x, particle.y);
        particleCtx.lineTo(next.x, next.y);
        particleCtx.strokeStyle = `rgba(102, 126, 234, ${0.22 - dist / 1000})`;
        particleCtx.stroke();
      }
    }
  });

  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (event) => {
  const heroRect = document.querySelector('.hero')?.getBoundingClientRect();
  if (heroRect) {
    pointer.x = event.clientX - heroRect.left;
    pointer.y = event.clientY - heroRect.top;
  }
  pointer.active = true;
  if (cursorDot) {
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
  }
  if (cursorRing) {
    cursorRing.style.left = `${event.clientX}px`;
    cursorRing.style.top = `${event.clientY}px`;
  }
});

window.addEventListener('mouseleave', () => {
  pointer.active = false;
});

resizeCanvas();
animateParticles();

// 自定义鼠标光标：跟随鼠标 + 可点击元素放大
const interactiveSelector = 'a, button, input, textarea, .project-card, .service-card, .achievement-card';

document.querySelectorAll(interactiveSelector).forEach((element) => {
  element.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

window.addEventListener('pointerleave', () => document.body.classList.add('cursor-hidden'));
window.addEventListener('pointerenter', () => document.body.classList.remove('cursor-hidden'));

// 返回顶部按钮
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 联系表单校验与提交提示
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();

  if (!name || !email || !message) {
    if (statusBox) {
      statusBox.textContent = '请填写完整的姓名、邮箱和消息内容。';
      statusBox.className = 'form-status error';
    }
    return;
  }

  if (!validateEmail(email)) {
    if (statusBox) {
      statusBox.textContent = '邮箱格式不正确，请重新检查后再提交。';
      statusBox.className = 'form-status error';
    }
    return;
  }

  if (statusBox) {
    statusBox.textContent = '消息已成功提交，感谢你的联系！';
    statusBox.className = 'form-status success';
  }
  form.reset();
});

// 页脚年份
const currentYear = new Date().getFullYear();
if (siteYear) siteYear.textContent = String(currentYear);
if (copyrightYear) copyrightYear.textContent = String(currentYear);
