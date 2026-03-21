// lock.club - Main JavaScript
// ============================================
(function() {
    'use strict';

    // ============================================
    // 1. Scroll Progress Bar
    // ============================================
    function initScrollProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }, { passive: true });
    }

    // ============================================
    // 2. Navbar Scroll Effect (shrink + shadow)
    // ============================================
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ============================================
    // 3. Hero Title Character Animation
    // ============================================
    function initHeroTitleAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.innerHTML = '';

        let delay = 0;
        for (let i = 0; i < text.length; i++) {
            const char = document.createElement('span');
            char.className = 'char';
            char.textContent = text[i] === ' ' ? '\u00A0' : text[i];
            char.style.animationDelay = delay + 's';
            heroTitle.appendChild(char);
            delay += 0.05;
        }
    }

    // ============================================
    // 4. Scroll-triggered Fade-in Animations
    // ============================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.fade-in-section, .fade-in-left, .fade-in-right, .scale-in-section, .stagger-children, .timeline-item'
        );

        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve after animation triggers
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // 5. Number Counter Animation (数字滚动)
    // ============================================
    function initNumberCounters() {
        const counters = document.querySelectorAll('.highlight-number[data-count], .counter-animate');

        if (!counters.length) {
            // Fallback: auto-find number elements in the why-choose section
            const whyChooseSection = document.querySelector('section[style*="background:#1a1a2e"]');
            if (whyChooseSection) {
                const numberDivs = whyChooseSection.querySelectorAll('div > div > div:first-child');
                numberDivs.forEach(el => {
                    const text = el.textContent.trim();
                    const match = text.match(/^(\d+)(\+|%|年|天|个)?/);
                    if (match) {
                        el.setAttribute('data-count', match[1]);
                        el.setAttribute('data-suffix', match[2] || '');
                    }
                });
            }
        }

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                // Handle special cases
                if (suffix === '%') {
                    el.textContent = current + '%';
                } else if (suffix === '+') {
                    el.textContent = current + '+';
                } else if (suffix === '年') {
                    el.textContent = current + '年+';
                } else if (suffix === '天') {
                    el.textContent = current + '天';
                } else if (suffix === '个') {
                    el.textContent = current + '个';
                } else {
                    el.textContent = current + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            requestAnimationFrame(update);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const allCounters = document.querySelectorAll('[data-count]');
        allCounters.forEach(c => counterObserver.observe(c));
    }

    // ============================================
    // 5b. Hero Stats Counter Animation
    // ============================================
    function initHeroStatsCounter() {
        const heroStats = document.querySelectorAll('.hero-stats .hero-stat-num');
        if (!heroStats.length) return;
        
        const animateCounter = (el) => {
            const countAttr = el.getAttribute('data-count');
            if (!countAttr) return;
            const target = parseInt(countAttr, 10);
            const suffix = el.getAttribute('data-suffix') || '+';
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heroStats.forEach((stat, i) => {
                        setTimeout(() => animateCounter(stat), i * 200);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroStats.forEach(stat => {
                if (!stat.getAttribute('data-count')) {
                    const text = stat.textContent.trim();
                    const match = text.match(/^(\d+)(.*)/);
                    if (match) {
                        stat.setAttribute('data-count', match[1]);
                        stat.setAttribute('data-suffix', match[2] || '+');
                        stat.textContent = '0' + (match[2] || '+');
                    }
                }
            });
            observer.observe(heroSection);
        }
    }

    // ============================================
    // 6. CTA Button Pulse Effect
    // ============================================
    function initCTAPulse() {
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(btn => {
            btn.classList.add('cta-button-pulse');
        });
    }

    // ============================================
    // 7. Mobile Menu Toggle
    // ============================================
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenuMobile = document.querySelector('.nav-menu-mobile');
        const overlay = document.querySelector('.mobile-overlay');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                document.body.classList.toggle('mobile-menu-open');

                if (navMenuMobile) {
                    navMenuMobile.classList.toggle('active');
                }
                if (overlay) {
                    overlay.classList.toggle('active');
                }
            });
        }

        // Close menu when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
                if (navMenuMobile) navMenuMobile.classList.remove('active');
                this.classList.remove('active');
            });
        }

        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-menu-mobile a, .nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
                if (navMenuMobile) navMenuMobile.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            });
        });
    }

    // ============================================
    // 8. Lazy Loading for Images
    // ============================================
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                        }
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '100px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imgObserver.observe(img);
            });
        }
    }

    // ============================================
    // 9. Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // 10. Card Hover 3D Tilt Effect
    // ============================================
    function initCardTilt() {
        const cards = document.querySelectorAll('.highlight-card, .product-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                this.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // ============================================
    // 11. Why Choose Section Number Animation
    // ============================================
    function initWhyChooseNumbers() {
        const whyChooseSection = document.querySelector('section[style*="background:#1a1a2e"]');
        if (!whyChooseSection) return;

        const numberDivs = whyChooseSection.querySelectorAll('div > div > div:first-child');

        const animateCounter = (el) => {
            const text = el.textContent.trim();
            let match = text.match(/^(\d+)(.*)/);
            if (!match) return;

            const target = parseInt(match[1], 10);
            const suffix = match[2];
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const firstNumber = entry.target.querySelector('div > div > div:first-child');
                    if (firstNumber && !firstNumber.dataset.animated) {
                        firstNumber.dataset.animated = 'true';
                        animateCounter(firstNumber);

                        // Animate all siblings
                        const siblings = entry.target.parentElement.querySelectorAll('div > div > div:first-child');
                        siblings.forEach((sib, i) => {
                            if (i === 0) return;
                            setTimeout(() => {
                                if (!sib.dataset.animated) {
                                    sib.dataset.animated = 'true';
                                    animateCounter(sib);
                                }
                            }, i * 150);
                        });

                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.3 });

        numberDivs.forEach(el => observer.observe(el));
    }

    // ============================================
    // 12. Stagger Animation for Grid Items
    // ============================================
    function initStaggerGrid() {
        const grids = document.querySelectorAll('.highlights-grid, .products-grid');

        grids.forEach(grid => {
            const items = grid.querySelectorAll('.highlight-card, .product-card');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('stagger-item-visible');
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, index * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            // Set initial state
            items.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            });

            observer.observe(grid);
        });
    }

    // ============================================
    // 13. Live Counter Animation for Trust Bar
    // ============================================
    function initLiveCounters() {
        const counters = document.querySelectorAll('.live-counter');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const duration = 2000;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current.toLocaleString();
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach((c, i) => {
                        setTimeout(() => animateCounter(c), i * 200);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const trustSection = document.querySelector('section[style*="0a1628"]');
        if (trustSection) observer.observe(trustSection);
    }

    // ============================================
    // Init All
    // ============================================
    function init() {
        initScrollProgressBar();
        initNavbarScroll();
        initHeroTitleAnimation();
        initScrollAnimations();
        initNumberCounters();
        initHeroStatsCounter();
        initCTAPulse();
        initMobileMenu();
        initLazyLoading();
        initSmoothScroll();
        initCardTilt();
        initWhyChooseNumbers();
        initStaggerGrid();
        initLiveCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

console.log('lock.club - Loaded successfully');
