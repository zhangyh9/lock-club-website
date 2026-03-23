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

        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const currentScroll = window.pageYOffset;
                    if (currentScroll > 60) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
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
    function initDropdownMenu() {
        var dropdowns = document.querySelectorAll('.nav-item-dropdown');
        dropdowns.forEach(function(dropdown) {
            var link = dropdown.querySelector('a');
            var menu = dropdown.querySelector('.nav-dropdown-menu');
            if (!link || !menu) return;
            
            // Click toggle
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var isOpen = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                document.querySelectorAll('.nav-item-dropdown.active').forEach(function(d) {
                    d.classList.remove('active');
                });
                
                // Toggle current
                if (!isOpen) {
                    dropdown.classList.add('active');
                }
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item-dropdown')) {
                document.querySelectorAll('.nav-item-dropdown.active').forEach(function(d) {
                    d.classList.remove('active');
                });
            }
        });
    }

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
    // V97: IntersectionObserver polyfill for older browsers (Safari < 15.4, Firefox < 55)
    if (!window.IntersectionObserver) {
        window.IntersectionObserver = function(callback, options) {
            this.callback = callback;
            this.options = options || {};
            this.observer = null;
            this.check = (function(self) {
                return function() {
                    callback([], self);
                };
            })(this);
            this.observe = function(el) {
                this.observer = setInterval(this.check, this.options.rootMargin || '100px');
            };
            this.unobserve = function(el) {
                if (this.observer) clearInterval(this.observer);
            };
            this.disconnect = function() {
                if (this.observer) clearInterval(this.observer);
            };
        };
    }

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
    // 13. Back to Top Button
    // ============================================
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', '回到顶部');
        btn.style.cssText = 'position:fixed;bottom:100px;right:32px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#886cff,#a782ff);color:#fff;border:none;cursor:pointer;font-size:22px;box-shadow:0 4px 16px rgba(136,108,255,0.3);opacity:0;transform:translateY(20px);transition:all 0.3s ease;z-index:998;pointer-events:none;';
        document.body.appendChild(btn);

        window.addEventListener('scroll', function() {
            if (window.scrollY > 600) {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px)';
                btn.style.pointerEvents = 'none';
            }
        }, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1)';
            this.style.boxShadow = '0 8px 24px rgba(136,108,255,0.4)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(136,108,255,0.3)';
        });
    }

    // ============================================
    // 14. Sticky Bottom Mobile CTA Bar
    // ============================================
    function initStickyMobileBar() {
        if (window.innerWidth > 768) return;
        const bar = document.createElement('div');
        bar.id = 'stickyMobileBar';
        bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;padding:10px 12px;display:flex;gap:8px;align-items:center;box-shadow:0 -4px 20px rgba(0,0,0,0.12);z-index:998;transform:translateY(100%);transition:transform 0.3s ease;';
        bar.innerHTML = '<a href="tel:13711533226" style="flex:1;background:#886cff;color:#fff;text-align:center;padding:10px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px;">📞 致电</a><button onclick="showWechatQR()" style="flex:1;background:#07c160;color:#fff;border:none;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">💬 微信</button><a href="contact.html" style="flex:1;background:#f5f5f5;color:#1a1a1a;text-align:center;padding:10px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px;border:1px solid #e0e0e0;">✉️ 留言</a>';
        document.body.appendChild(bar);

        window.addEventListener('scroll', function() {
            if (window.scrollY > 800) {
                bar.style.transform = 'translateY(0)';
            } else {
                bar.style.transform = 'translateY(100%)';
            }
        }, { passive: true });
    }

    // V47: WeChat QR popup for mobile sticky bar
    window.showWechatQR = function() {
        var existing = document.getElementById('wechatQRModal');
        if (existing) { existing.remove(); return; }
        var modal = document.createElement('div');
        modal.id = 'wechatQRModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:28px 24px;text-align:center;max-width:300px;width:100%;position:relative;">' +
            '<button onclick="this.closest(\'#wechatQRModal\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#888;line-height:1;">✕</button>' +
            '<div style="font-size:28px;margin-bottom:10px;">💬</div>' +
            '<h3 style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">添加微信咨询</h3>' +
            '<p style="font-size:12px;color:#888;margin-bottom:16px;">长按识别或搜索微信号</p>' +
            '<img src="images/contact-qrcode.png" alt="领锁微信二维码" style="width:200px;height:200px;border-radius:12px;border:1px solid #eee;margin-bottom:12px;" onerror="this.style.display=\'none\'">' +
            '<div style="background:#f5f7ff;border-radius:8px;padding:10px;font-size:13px;color:#886cff;font-weight:600;">微信号：lock-club</div>' +
            '<div style="margin-top:14px;"><a href="tel:13711533226" style="display:inline-flex;align-items:center;gap:6px;background:#886cff;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">📞 致电 137-1153-3226</a></div>' +
            '</div>';
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    };

    // V47: Desktop floating WeChat button (only on desktop)
    function initFloatingWechatBtn() {
        if (window.innerWidth <= 768) return;
        var btn = document.createElement('div');
        btn.id = 'floatingWechatBtn';
        btn.style.cssText = 'position:fixed;right:24px;bottom:120px;z-index:997;cursor:pointer;transition:all 0.3s;';
        btn.innerHTML = '<div style="width:52px;height:52px;background:linear-gradient(135deg,#07c160,#05903a);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(7,193,96,0.4);font-size:26px;position:relative;" onmouseover="this.parentElement.style.transform=\'translateY(-4px)\'" onmouseout="this.parentElement.style.transform=\'none\'">' +
            '<span style="font-size:28px;">💬</span>' +
            '<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#e74c3c;border-radius:50%;border:2px solid #fff;font-size:9px;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;">1</div>' +
            '</div>';
        btn.onclick = showWechatQR;
        document.body.appendChild(btn);
    }

    // ============================================
    // 15. Contact Form Enhancement
    // ============================================
    function initContactForm() {
        const form = document.querySelector('#contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.style.borderColor = '#22c55e';
                    this.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)';
                } else if (this.value) {
                    this.style.borderColor = '#ff4d4f';
                    this.style.boxShadow = '0 0 0 3px rgba(255,77,79,0.1)';
                } else {
                    this.style.borderColor = '#e8f0fe';
                    this.style.boxShadow = 'none';
                }
            });

            input.addEventListener('focus', function() {
                this.style.borderColor = '#886cff';
                this.style.boxShadow = '0 0 0 3px rgba(136,108,255,0.15)';
            });
        });

        form.addEventListener('submit', function(e) {
            let valid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    valid = false;
                    input.style.borderColor = '#ff4d4f';
                    input.style.boxShadow = '0 0 0 3px rgba(255,77,79,0.1)';
                }
            });
            if (!valid) {
                e.preventDefault();
                const firstInvalid = form.querySelector('input:invalid, textarea:invalid');
                if (firstInvalid) firstInvalid.focus();
            }
        });
    }

    // ============================================
    // 13 (original). Live Counter Animation for Trust Bar
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
    // 16. Comparison Table Row Animation
    // ============================================
    function initCompareTableAnimation() {
        const compareRows = document.querySelectorAll('.compare-row');
        if (!compareRows.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const rows = document.querySelectorAll('.compare-row');
                    rows.forEach((row, index) => {
                        setTimeout(() => {
                            row.style.opacity = '1';
                            row.style.transform = 'translateX(0)';
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
    }

    // ============================================
    // V47: Hero ROI Animated Count-Up
    // ============================================
    function initHeroROICounter() {
        var widget = document.getElementById('heroRoiWidget');
        if (!widget) return;
        var animated = false;

        function animateNum(el, targetVal, prefix, suffix, decimals) {
            var duration = 1200;
            var startTime = performance.now();
            var startVal = 0;

            function update(currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = startVal + (targetVal - startVal) * eased;
                var formatted;
                if (decimals) {
                    formatted = prefix + current.toFixed(decimals) + suffix;
                } else {
                    formatted = prefix + Math.floor(current) + suffix;
                }
                el.textContent = formatted;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        function triggerAnimation() {
            if (animated) return;
            animated = true;
            var flyEl = document.getElementById('hero-roi-fly');
            var elecEl = document.getElementById('hero-roi-elec');
            var netEl = document.getElementById('hero-roi-net');
            if (!flyEl || !elecEl || !netEl) return;

            // Parse current values
            var flyText = flyEl.textContent; // e.g. "¥24.9万"
            var elecText = elecEl.textContent;
            var netText = netEl.textContent;

            var flyMatch = flyText.match(/¥([\d.]+)万/);
            var elecMatch = elecText.match(/¥([\d.]+)万/);
            var netMatch = netText.match(/¥([\d.]+)万/);

            if (flyMatch && elecMatch && netMatch) {
                setTimeout(function() {
                    animateNum(flyEl, parseFloat(flyMatch[1]), '¥', '万', 1);
                }, 200);
                setTimeout(function() {
                    animateNum(elecEl, parseFloat(elecMatch[1]), '¥', '万', 1);
                }, 450);
                setTimeout(function() {
                    animateNum(netEl, parseFloat(netMatch[1]), '¥', '万', 1);
                }, 700);
            }
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    triggerAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(widget);
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
        initDropdownMenu();
        initLazyLoading();
        initSmoothScroll();
        initCardTilt();
        initWhyChooseNumbers();
        initStaggerGrid();
        initLiveCounters();
        initBackToTop();
        initStickyMobileBar();
        initContactForm();
        initCompareTableAnimation();
        initFloatingWechatBtn();
        initHeroROICounter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// Production: no console.log

// task_090: JS Error Monitoring - Simple error tracker
(function() {
    'use strict';
    var errorLog = [];
    var MAX_ERRORS = 20;
    
    function getErrorDetail(error, stack) {
        return {
            msg: error.message || String(error),
            url: location.href,
            line: error.lineno || null,
            col: error.colno || null,
            stack: stack || '',
            ua: navigator.userAgent,
            time: new Date().toISOString()
        };
    }
    
    window.addEventListener('error', function(e) {
        var err = e.error || {};
        var detail = getErrorDetail(err, err.stack || '');
        if (errorLog.length >= MAX_ERRORS) errorLog.shift();
        errorLog.push(detail);
        // Send to server or localStorage for debugging
        try {
            var stored = JSON.parse(localStorage.getItem('lk_errors') || '[]');
            if (stored.length >= MAX_ERRORS) stored.shift();
            stored.push(detail);
            localStorage.setItem('lk_errors', JSON.stringify(stored));
        } catch(e) {}
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        var detail = {
            msg: 'UnhandledPromiseRejection: ' + (e.reason && (e.reason.message || String(e.reason))),
            url: location.href,
            ua: navigator.userAgent,
            time: new Date().toISOString()
        };
        if (errorLog.length >= MAX_ERRORS) errorLog.shift();
        errorLog.push(detail);
        try {
            var stored = JSON.parse(localStorage.getItem('lk_errors') || '[]');
            if (stored.length >= MAX_ERRORS) stored.shift();
            stored.push(detail);
            localStorage.setItem('lk_errors', JSON.stringify(stored));
        } catch(e) {}
    });
    
    window.getLKErrors = function() { return errorLog; };
})();
