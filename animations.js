// animations.js - FINAL VERSION

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Functions ---
    const applyAnimation = (element, animationName, duration = 400) => {
        return new Promise(resolve => {
            if (!element) return resolve();
            // The element is made visible by the animation itself (which starts at opacity 0)
            element.style.animation = `${animationName} ${duration / 1000}s ease-out forwards`;
            setTimeout(resolve, duration);
        });
    };

    const resetAnimations = (elements) => {
        elements.forEach(el => {
            if (el) {
                el.style.animation = '';
                el.classList.add('anim-element');
                el.style.opacity = '0';
            }
        });
    };
    
    // --- Scroll-triggered animation handler ---
    const initializeScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.anim-element');

        if (animatedElements.length > 0) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Use the existing helper to apply the animation directly
                        entry.target.style.animationDelay = `${index * 100}ms`;
                        applyAnimation(entry.target, 'slide-in-from-bottom', 600);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            // Start observing each animated element
            animatedElements.forEach(element => {
                // Manually trigger animation for elements already in view on page load
                if (element.getBoundingClientRect().top < window.innerHeight) {
                     applyAnimation(element, 'slide-in-from-bottom', 600);
                } else {
                    observer.observe(element);
                }
            });
        }
    };


    // --- Page-specific Animation Sequences ---

    const runLandingPageIntroAnimation = () => {
        const elements = {
            landingPageLinks: document.getElementById('landing-page-links'),
            navButtonsLeft: document.querySelectorAll('.floating-nav-left .nav-button'),
            navButtonsRight: document.querySelectorAll('.floating-nav-right .nav-button'),
            landingContainer: document.getElementById('landing-container'),
            tagline: document.getElementById('tagline'),
            siteFooter: document.getElementById('site-footer')
        };
        
        const allElements = [
            elements.landingContainer, elements.tagline, elements.siteFooter,
            ...elements.navButtonsLeft, ...elements.navButtonsRight
        ];
        
        resetAnimations(allElements);

        if (elements.landingPageLinks) elements.landingPageLinks.classList.remove('hidden');

        elements.navButtonsLeft.forEach((btn, i) => setTimeout(() => { if (btn) { applyAnimation(btn, 'slide-in-from-left'); } }, i * 100));
        elements.navButtonsRight.forEach((btn, i) => setTimeout(() => { if (btn) { applyAnimation(btn, 'slide-in-from-right'); } }, i * 100));
        
        if (elements.tagline) { applyAnimation(elements.tagline, 'slide-in-from-top', 500); }
        if (elements.landingContainer) { applyAnimation(elements.landingContainer, 'slide-in-from-top', 500); }
        if (elements.siteFooter) { applyAnimation(elements.siteFooter, 'slide-in-from-bottom', 500); }
    };

    // --- NEW: Animation sequence for the blog page ---
    const runBlogPageIntroAnimation = () => {
        const blogHeader = document.querySelector('.blog-header');
        if (blogHeader) {
            resetAnimations([blogHeader]);
            applyAnimation(blogHeader, 'slide-in-from-top', 600);
        }
    };

    const runExitLandingPageAnimation = () => {
        const elements = {
            landingPageLinks: document.getElementById('landing-page-links'),
            navButtonsLeft: document.querySelectorAll('.floating-nav-left .nav-button'),
            navButtonsRight: document.querySelectorAll('.floating-nav-right .nav-button'),
            landingContainer: document.getElementById('landing-container'),
            featuresGrid: document.querySelector('.features-grid'),
            tagline: document.getElementById('tagline'),
            siteFooter: document.getElementById('site-footer')
        };

        return new Promise(async resolve => {
            const iconAnims = [
                ...Array.from(elements.navButtonsLeft).map(btn => applyAnimation(btn, 'slide-out-to-left', 300)),
                ...Array.from(elements.navButtonsRight).map(btn => applyAnimation(btn, 'slide-out-to-right', 300))
            ];
            await Promise.all(iconAnims);
            if (elements.landingPageLinks) elements.landingPageLinks.classList.add('hidden');

            const mainAnims = [
                applyAnimation(elements.tagline, 'slide-out-to-top', 400),
                applyAnimation(elements.landingContainer, 'slide-out-to-top', 400),
                applyAnimation(elements.featuresGrid, 'slide-out-to-bottom', 400),
                applyAnimation(elements.siteFooter, 'slide-out-to-bottom', 400)
            ];
            await Promise.all(mainAnims);
            resolve();
        });
    };

    const runWorkspaceIntroAnimation = () => {
        const elements = [
            { el: document.getElementById('player-container'), anim: 'slide-in-from-left' },
            { el: document.getElementById('playback-controls'), anim: 'slide-in-from-left' },
            { el: document.getElementById('speed-controls'), anim: 'slide-in-from-left' },
            { el: document.getElementById('timestamp-viewer'), anim: 'slide-in-from-left' },
            { el: document.querySelector('.right-column'), anim: 'slide-in-from-right' },
            { el: document.getElementById('output-section'), anim: 'slide-in-from-bottom' }
        ];
        resetAnimations(elements.map(item => item.el));
        elements.forEach((item, index) => {
            if (item.el) {
                setTimeout(() => {
                    applyAnimation(item.el, item.anim);
                }, index * 80);
            }
        });
    };

     const runWorkspaceExitAnimation = () => {
        const elements = [
            document.getElementById('player-container'),
            document.getElementById('playback-controls'),
            document.getElementById('speed-controls'),
            document.getElementById('timestamp-viewer'),
            document.querySelector('.right-column'),
            document.getElementById('output-section')
        ];
        return Promise.all(elements.map(el => applyAnimation(el, 'slide-out-to-bottom', 400)));
    };
    
    const runPageContentIntroAnimation = () => {
        const contentWrapper = document.querySelector('.page-content-wrapper');
        if (contentWrapper) {
            resetAnimations([contentWrapper]);
            applyAnimation(contentWrapper, 'slide-in-from-right', 600);
        }
    };

    const runPageContentExitAnimation = () => {
        const contentWrapper = document.querySelector('.page-content-wrapper');
        return contentWrapper ? applyAnimation(contentWrapper, 'slide-out-to-right', 600) : Promise.resolve();
    };

    window.animations = {
        runLandingPageIntroAnimation,
        runExitLandingPageAnimation,
        runWorkspaceIntroAnimation,
        runWorkspaceExitAnimation
    };

    // --- Main Page Initialization ---
    const initializePage = () => {
        document.body.classList.remove('preload-hidden');
        const source = sessionStorage.getItem('transition-source');
        const isLandingPage = document.getElementById('landing-page');
        const isBlogPage = document.querySelector('.blog-header'); // Check if it's the blog page

        if (isLandingPage) {
            runLandingPageIntroAnimation();
        } else if (isBlogPage) { // If it's the blog page, run its specific animation
            runBlogPageIntroAnimation();
        } else {
            if (source === 'landing') {
                runPageContentIntroAnimation();
            } else {
                const contentWrapper = document.querySelector('.page-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.style.opacity = '1';
                }
            }
        }
        sessionStorage.removeItem('transition-source');

        if (isLandingPage) {
            const navLinks = document.querySelectorAll('.floating-nav a[href$=".html"]');
            navLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const destination = link.href;
                    runExitLandingPageAnimation().then(() => {
                        sessionStorage.setItem('transition-source', 'landing');
                        window.location.href = destination;
                    });
                });
            });
        } else {
            const homeLink = document.getElementById('logo');
            if (homeLink) {
                homeLink.style.cursor = 'pointer';
                homeLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    const destination = 'index.html';
                    runPageContentExitAnimation().then(() => {
                        window.location.href = destination;
                    });
                });
            }
        }
        
        initializeScrollAnimations();
    };

    initializePage();
});