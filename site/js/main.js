// lock.club - Main JavaScript
// ============================================
// 炫酷UI交互脚本

(function() {
    'use strict';

    // ========================================
    // 1. 滚动进度条
    // ========================================
    function initScrollProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // ========================================
    // 2. 导航栏滚动效果
    // ========================================
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // ========================================
    // 3. Hero区域文字逐字显示
    // ========================================
    function initHeroTextAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.innerHTML = '';
        
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${0.3 + i * 0.05}s`;
            heroTitle.appendChild(span);
        });
    }

    // ========================================
    // 4. 滚动渐入动画 (Intersection Observer)
    // ========================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // 可选：观察一次后停止
                    // animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        const animatedElements = document.querySelectorAll(`
            .fade-in-section,
            .fade-in-left,
            .fade-in-right,
            .scale-in-section,
            .stagger-children,
            .timeline-item,
            .highlight-card,
            .product-card,
            section > .container > *
        `);

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }

    // ========================================
    // 5. 数字滚动动画
    // ========================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.highlight-number[data-count]');
        
        const observerOptions = {
            root: null,
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.count);
                    const unit = counter.dataset.unit || '';
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Easing function (ease-out)
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(target * easeOut);
                        
                        counter.textContent = current + unit;
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target + unit;
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // ========================================
    // 6. 卡片Hover 3D效果增强
    // ========================================
    function initCard3DEffect() {
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ========================================
    // 7. 移动端汉堡菜单
    // ========================================
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenuMobile = document.querySelector('.nav-menu-mobile');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        
        // 创建移动端菜单
        if (mobileToggle && !navMenuMobile) {
            // 克隆导航菜单
            const originalNavMenu = document.querySelector('.nav-menu');
            if (!originalNavMenu) return;

            // 创建移动菜单
            const mobileMenu = document.createElement('nav');
            mobileMenu.className = 'nav-menu-mobile';
            mobileMenu.innerHTML = originalNavMenu.innerHTML;
            
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            document.body.appendChild(mobileMenu);
            
            // 点击遮罩关闭
            overlay.addEventListener('click', closeMobileMenu);
            
            // 点击链接关闭
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
            
            function closeMobileMenu() {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            mobileToggle.addEventListener('click', () => {
                const isOpen = mobileToggle.classList.contains('active');
                
                if (isOpen) {
                    closeMobileMenu();
                } else {
                    mobileToggle.classList.add('active');
                    mobileMenu.classList.add('active');
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }

    // ========================================
    // 8. 图片懒加载
    // ========================================
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imgObserver.observe(img);
            });
        } else {
            // Fallback
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }

    // ========================================
    // 9. 平滑滚动
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    const offsetTop = target.offsetTop - 80; // 导航栏高度补偿
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // 10. 时间轴动画增强
    // ========================================
    function initTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 150);
                }
            });
        }, observerOptions);

        timelineItems.forEach(item => timelineObserver.observe(item));
    }

    // ========================================
    // 11. CTA按钮脉冲效果
    // ========================================
    function initCTAPulse() {
        const ctaButtons = document.querySelectorAll('.cta-button-pulse');
        if (ctaButtons.length === 0) {
            // 自动给主CTA按钮添加脉冲效果
            const mainCtaButton = document.querySelector('.cta-button');
            if (mainCtaButton) {
                mainCtaButton.classList.add('cta-button-pulse');
            }
        }
    }

    // ========================================
    // 初始化
    // ========================================
    function init() {
        initScrollProgressBar();
        initNavbarScroll();
        initHeroTextAnimation();
        initScrollAnimations();
        initCounterAnimation();
        initCard3DEffect();
        initMobileMenu();
        initLazyLoading();
        initSmoothScroll();
        initTimelineAnimation();
        initCTAPulse();

        console.log('lock.club - UI增强已加载 ✨');
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
