// animations.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections for Animations ---
    const floatingNavLeft = document.querySelector('.floating-nav-left');
    const floatingNavRight = document.querySelector('.floating-nav-right');
    const navButtonsLeft = document.querySelectorAll('.floating-nav-left .nav-button');
    const navButtonsRight = document.querySelectorAll('.floating-nav-right .nav-button');
    const landingContainer = document.getElementById('landing-container');
    const featuresGrid = document.querySelector('.features-grid');
    const tagline = document.getElementById('tagline');
    const siteFooter = document.getElementById('site-footer');

    const playerContainer = document.getElementById('player-container');
    const playbackControls = document.getElementById('playback-controls');
    const speedControls = document.getElementById('speed-controls');
    const timestampViewer = document.getElementById('timestamp-viewer');
    const rightColumn = document.querySelector('.right-column');
    const outputSection = document.getElementById('output-section');

    const allWorkspaceElements = [
        playerContainer, playbackControls, speedControls,
        timestampViewer, rightColumn, outputSection
    ];

    // --- Animation Functions ---

    const applyAnimation = (element, animationName, duration = 400) => {
        return new Promise(resolve => {
            if (element) {
                element.style.animation = `${animationName} ${duration / 1000}s ease-out forwards`;
                setTimeout(resolve, duration);
            } else {
                resolve();
            }
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

    const runLandingPageIntroAnimation = () => {
        const allNavButtons = [...navButtonsLeft, ...navButtonsRight];
        resetAnimations([...allWorkspaceElements, landingContainer, featuresGrid, ...allNavButtons, siteFooter, tagline]);

        // --- THE FIX IS HERE ---
        // Explicitly make the nav containers visible before animating the buttons
        if (floatingNavLeft) floatingNavLeft.classList.remove('anim-hidden');
        if (floatingNavRight) floatingNavRight.classList.remove('anim-hidden');
        // --- END FIX ---

        navButtonsLeft.forEach((btn, index) => {
            setTimeout(() => {
                if (btn) {
                    btn.style.opacity = '1';
                    applyAnimation(btn, 'slide-in-from-left', 400);
                }
            }, index * 100);
        });

        navButtonsRight.forEach((btn, index) => {
            setTimeout(() => {
                if (btn) {
                    btn.style.opacity = '1';
                    applyAnimation(btn, 'slide-in-from-right', 400);
                }
            }, index * 100);
        });

        if (landingContainer) {
            landingContainer.style.opacity = '1';
            applyAnimation(landingContainer, 'slide-in-from-top', 500);
        }
        
        if (featuresGrid) {
            featuresGrid.style.opacity = '1';
            applyAnimation(featuresGrid, 'slide-in-from-bottom', 500);
        }

        if (siteFooter) {
            siteFooter.style.opacity = '1';
            applyAnimation(siteFooter, 'slide-in-from-bottom', 500);
        }

        if (tagline) {
            tagline.style.opacity = '1';
            applyAnimation(tagline, 'slide-in-from-top', 500);
        }
    };

    const runExitLandingPageAnimation = () => {
        return new Promise(async resolve => {
            const leftButtonAnimations = Array.from(navButtonsLeft).map(btn => applyAnimation(btn, 'slide-out-to-left', 300));
            const rightButtonAnimations = Array.from(navButtonsRight).map(btn => applyAnimation(btn, 'slide-out-to-right', 300));
            
            await Promise.all([...leftButtonAnimations, ...rightButtonAnimations]);

            if (floatingNavLeft) floatingNavLeft.classList.add('anim-hidden');
            if (floatingNavRight) floatingNavRight.classList.add('anim-hidden');

            const landingContainerAnim = applyAnimation(landingContainer, 'slide-out-to-top', 400);
            const featuresAnim = applyAnimation(featuresGrid, 'slide-out-to-bottom', 400);
            const footerAnim = applyAnimation(siteFooter, 'slide-out-to-bottom', 400);
            const taglineAnim = applyAnimation(tagline, 'slide-out-to-top', 400);
            
            await Promise.all([landingContainerAnim, featuresAnim, footerAnim, taglineAnim]);
            resolve();
        });
    };

    const runWorkspaceIntroAnimation = () => {
        const elementsToAnimate = [
            { el: playerContainer, anim: 'slide-in-from-left' },
            { el: playbackControls, anim: 'slide-in-from-left' },
            { el: speedControls, anim: 'slide-in-from-left' },
            { el: timestampViewer, anim: 'slide-in-from-left' },
            { el: rightColumn, anim: 'slide-in-from-right' },
            { el: outputSection, anim: 'slide-in-from-bottom' }
        ];

        elementsToAnimate.forEach((item, index) => {
            if (item.el) {
                setTimeout(() => {
                    item.el.style.opacity = '1';
                    applyAnimation(item.el, item.anim);
                }, index * 80);
            }
        });
    };

    window.animations = {
        runLandingPageIntroAnimation,
        runExitLandingPageAnimation,
        runWorkspaceIntroAnimation,
        resetAnimations
    };

    runLandingPageIntroAnimation();
});