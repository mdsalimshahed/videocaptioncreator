// This function is called by the YouTube API when it's ready.
// We need it in the global scope.
function onYouTubeIframeAPIReady() {
    // The app object will handle initialization from here.
}

/**
 * Encapsulate the entire application in a single object to avoid polluting the global scope.
 */
const app = {
    // --- STATE PROPERTIES ---
    player: null,
    currentVideoId: null,
    bookmarks: { 1: [], 2: [] },
    activeBookmarkPanel: 1,
    selectedSubtitleIndex: -1,
    suggestionsContainer: null,
    timeUpdateInterval: null, 
    isHoveringBookmarks: false,
    isHoveringPlayer: false,
    history: { 1: [], 2: [] },
    historyPointer: { 1: -1, 2: -1 },
    timestampAnimationId: null,
    subtitlePlaybackId: null,
    subtitleGlowTimeoutId: null,
    isViewerLocked: false,
    featureInterval: null,
    currentFeatureIndex: 0,
    selectedSeekInterval: null,
    featureMouseLeaveTimeout: null,
    isGlobalAutofillEnabled: false,

    // --- DOM ELEMENT REFERENCES ---
    initDOMElements() {
        this.logo = document.getElementById('logo');
        this.loadVideoBtn = document.getElementById('load-video-btn');
        this.videoUrlInput = document.getElementById('video-url');
        this.mainContent = document.getElementById('main-content');
        this.landingPage = document.getElementById('landing-page');
        this.addBookmarkBtn = document.getElementById('add-bookmark-btn');
        this.addSubtitleBtn = document.getElementById('add-subtitle-btn');
        this.bookmarksListContainer = document.getElementById('bookmarks-list');
        this.generateDescBtn = document.getElementById('generate-desc-btn');
        this.copyDescBtn = document.getElementById('copy-desc-btn');
        this.youtubeOutput = document.getElementById('youtube-output');
        this.workspace = document.getElementById('workspace');
        this.leftColumn = document.querySelector('.left-column');
        this.rightColumn = document.querySelector('.right-column');
        this.speedControls = document.getElementById('speed-controls');
        this.playbackControls = document.getElementById('playback-controls');
        this.playerContainer = document.getElementById('player-container');
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        this.bookmarksTitle = document.getElementById('bookmarks-title');
        this.bookmarksDropdown = document.querySelector('.bookmarks-dropdown');
        this.currentTimeDisplay = document.getElementById('current-time-display');
        this.setStartBtn = document.getElementById('set-start-btn');
        this.setEndBtn = document.getElementById('set-end-btn');
        this.outputTitle = document.getElementById('output-title');
        this.outputDescription = document.getElementById('output-description');
        this.bookmarkPanelControls = document.getElementById('bookmark-panel-controls');
        this.subtitlePanelControls = document.getElementById('subtitle-panel-controls');
        this.saveAsBtnContainer = document.getElementById('save-as-btn-container');
        this.saveAsBtn = document.getElementById('save-as-btn');
        this.saveAsDropdown = document.getElementById('save-as-dropdown');
        this.featuresGrid = document.querySelector('.features-grid');
    },

    // --- INITIALIZATION ---
    init() {
        this.initDOMElements();
        this.addEventListeners();
        this.startFeatureCycle();
    },

    addEventListeners() {
        this.logo.addEventListener('click', this.startOver.bind(this));
        this.loadVideoBtn.addEventListener('click', this.loadVideo.bind(this));
        this.addBookmarkBtn.addEventListener('click', this.addBookmark.bind(this));
        this.addSubtitleBtn.addEventListener('click', this.addBookmark.bind(this));
        this.generateDescBtn.addEventListener('click', this.generateDescription.bind(this));
        this.undoBtn.addEventListener('click', this.undo.bind(this));
        this.redoBtn.addEventListener('click', this.redo.bind(this));
        this.copyDescBtn.addEventListener('click', this.copyDescription.bind(this));
        this.videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadVideo();
        });
        this.bookmarksListContainer.addEventListener('click', this.handleBookmarkListClick.bind(this));
        this.bookmarksListContainer.addEventListener('keyup', this.handleAutofill.bind(this));
        this.bookmarksListContainer.addEventListener('keydown', this.handleSuggestionKeys.bind(this));
        this.bookmarksListContainer.addEventListener('input', this.handleInputChange.bind(this));
        this.bookmarksListContainer.addEventListener('change', this.handleInputCommit.bind(this));
        this.bookmarksListContainer.addEventListener('focusout', () => setTimeout(() => this.hideSuggestions(), 150));
        this.speedControls.addEventListener('click', this.handleSpeedControl.bind(this));
        this.playbackControls.addEventListener('click', this.handlePlaybackControl.bind(this));
        this.bookmarksListContainer.addEventListener('mouseenter', this.handleBookmarksMouseEnter.bind(this));
        this.bookmarksListContainer.addEventListener('mouseleave', this.handleBookmarksMouseLeave.bind(this));
        this.playerContainer.addEventListener('mouseenter', () => { this.isHoveringPlayer = true; });
        this.playerContainer.addEventListener('mouseleave', () => { this.isHoveringPlayer = false; });
        document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
        this.bookmarksDropdown.addEventListener('click', this.switchActivePanel.bind(this));
        this.setStartBtn.addEventListener('click', this.setSubtitleStart.bind(this));
        this.setEndBtn.addEventListener('click', this.setSubtitleEnd.bind(this));
        this.saveAsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveAsDropdown.classList.toggle('visible');
        });
        this.saveAsDropdown.addEventListener('click', this.handleSaveAs.bind(this));
        window.addEventListener('click', () => {
            if (this.saveAsDropdown.classList.contains('visible')) {
                this.saveAsDropdown.classList.remove('visible');
            }
        });
        window.addEventListener('resize', this.startFeatureCycle.bind(this));
    },

    // --- VIDEO & PLAYER LOGIC ---
    extractVideoID(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    },
    
    loadVideo() {
        const url = this.videoUrlInput.value;
        const videoId = this.extractVideoID(url);

        if (!videoId) {
            this.showMessage("Invalid URL. Please provide a valid video link.");
            return;
        }

        const setupPlayer = () => {
            this.currentVideoId = videoId;
            if (this.player) {
                this.player.loadVideoById(videoId);
            } else {
                this.player = new YT.Player('player', {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: { 'playsinline': 1, 'iv_load_policy': 3 },
                    events: { 
                        'onReady': this.onPlayerReady.bind(this),
                        'onStateChange': this.onPlayerStateChange.bind(this)
                    }
                });
            }
            this.loadAndRenderBookmarks();
        };

        if (window.animations && typeof window.animations.runExitLandingPageAnimation === 'function') {
            window.animations.runExitLandingPageAnimation().then(() => {
                this.logo.classList.remove('animating');
                this.landingPage.classList.add('hidden');
                this.mainContent.classList.remove('hidden');

                if (window.animations && typeof window.animations.runWorkspaceIntroAnimation === 'function') {
                    window.animations.runWorkspaceIntroAnimation();
                }
                setupPlayer();
            });
        } else {
            this.logo.classList.remove('animating');
            this.landingPage.classList.add('hidden');
            this.mainContent.classList.remove('hidden');
            setupPlayer();
        }
    },

    onPlayerReady() {
        this.loadAndRenderBookmarks();
        this.syncTimestamp();
        this.startPolling(); 
    },
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isViewerLocked = false;
            this.stopPolling(); 
            this.startTimestampLoop();
        } else {
            this.stopTimestampLoop();
            this.startPolling();
            if (event.data === YT.PlayerState.PAUSED) {
                this.syncTimestamp();
            }
        }
    },

    // --- TIME FORMATTING & PARSING ---
    formatTimeForViewer(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
        const seconds = Math.floor(totalSeconds);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const milliseconds = Math.floor((totalSeconds - seconds) * 1000);

        const paddedH = h.toString().padStart(2, '0');
        const paddedM = m.toString().padStart(2, '0');
        const paddedS = s.toString().padStart(2, '0');
        const paddedMs = milliseconds.toString().padStart(3, '0');

        return `${paddedH}:${paddedM}:${paddedS},${paddedMs}`;
    },

    formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
        const seconds = Math.floor(totalSeconds);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        const paddedS = s.toString().padStart(2, '0');
        const paddedM = m.toString().padStart(2, '0');

        return (h > 0) ? `${h}:${paddedM}:${paddedS}` : `${m.toString().padStart(2, '0')}:${paddedS}`;
    },
    
    parseChapterTime(timeString) {
        const parts = String(timeString).split(':').map(Number).reverse();
        let seconds = 0;
        if (parts.length > 0) seconds += parts[0];
        if (parts.length > 1) seconds += parts[1] * 60;
        if (parts.length > 2) seconds += parts[2] * 3600;
        return seconds;
    },

    parseSrtTime(timeString) {
        const parts = String(timeString).split(/[:.,]/).map(Number).reverse();
        let seconds = 0;
        if (parts.length > 0) seconds += parts[0] / 1000;
        if (parts.length > 1) seconds += parts[1];
        if (parts.length > 2) seconds += parts[2] * 60;
        if (parts.length > 3) seconds += parts[3] * 3600;
        return seconds;
    },

    // --- BOOKMARK & SUBTITLE MANAGEMENT ---
    addBookmark() {
        if (!this.player || typeof this.player.getCurrentTime !== 'function') {
            this.showMessage("Player is not ready.");
            return;
        }

        if(this.player.getPlayerState() === YT.PlayerState.PLAYING) {
            this.player.pauseVideo();
        }
        this.syncTimestamp(); 

        const currentTime = this.player.getCurrentTime();
        
        let newEntry;
        if (this.activeBookmarkPanel == 1) {
            newEntry = { time: Math.floor(currentTime), description: '' };
        } else {
            newEntry = {
                startTime: this.formatTimeForViewer(currentTime),
                endTime: this.formatTimeForViewer(currentTime + 1),
                description: ''
            };
            this.currentTimeDisplay.textContent = newEntry.startTime;
            this.isViewerLocked = true;
        }

        this.bookmarks[this.activeBookmarkPanel].push(newEntry);
        this.sortAndSaveBookmarks(true);
        const newIndex = this.bookmarks[this.activeBookmarkPanel].findIndex(bm => bm === newEntry);

        if (this.activeBookmarkPanel == 2) {
            this.selectedSubtitleIndex = newIndex;
        }

        this.renderBookmarks();

        const newBookmarkInput = this.bookmarksListContainer.querySelector(`.bookmark-item:nth-child(${newIndex + 1}) .bookmark-desc`);
        if (newBookmarkInput) {
            newBookmarkInput.focus();
        }
    },

    renderBookmarks() {
        this.bookmarksListContainer.innerHTML = '';
        const currentList = this.bookmarks[this.activeBookmarkPanel];

        currentList.forEach((bookmark, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.dataset.index = index;

            if (this.activeBookmarkPanel == 1) {
                item.innerHTML = `
                    <span class="bookmark-counter">${index + 1}.</span>
                    <button class="seek-btn" data-index="${index}" tabindex="-1">▶</button>
                    <input type="text" class="bookmark-time" value="${this.formatTime(bookmark.time)}" data-index="${index}">
                    <textarea class="bookmark-desc" data-index="${index}" placeholder="Enter note...">${bookmark.description}</textarea>
                    <button class="delete-btn" data-index="${index}" aria-label="Delete bookmark">X</button>
                `;
            } else {
                 if (index === this.selectedSubtitleIndex) {
                    item.classList.add('selected-subtitle');
                }
                item.innerHTML = `
                    <span class="bookmark-counter">${index + 1}.</span>
                    <button class="seek-btn" data-index="${index}" tabindex="-1">▶</button>
                    <div class="subtitle-time-fields">
                        <input type="text" class="bookmark-time subtitle-time" value="${bookmark.startTime}" data-index="${index}" data-time-type="start">
                        <input type="text" class="bookmark-time subtitle-time" value="${bookmark.endTime}" data-index="${index}" data-time-type="end">
                    </div>
                    <textarea class="bookmark-desc" data-index="${index}" placeholder="Enter subtitle...">${bookmark.description}</textarea>
                    <button class="delete-btn" data-index="${index}" aria-label="Delete subtitle">X</button>
                `;
            }
            this.bookmarksListContainer.appendChild(item);
        });
        
        document.querySelectorAll('.bookmark-desc').forEach(this.adjustTextareaHeight);
        document.querySelectorAll('.bookmark-time').forEach(this.adjustTimeInputWidth);
    },
    
    playBookmarkSegment(index) {
        const bookmark = this.bookmarks[1][index];
        if (!bookmark) return;

        const bookmarkTime = bookmark.time;
        this.player.seekTo(bookmarkTime, true);
    },

    highlightBookmark(index) {
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.classList.remove('active-bookmark');
        });
        const targetItem = this.bookmarksListContainer.querySelector(`.bookmark-item[data-index="${index}"]`);
        if (targetItem) {
            targetItem.classList.add('active-bookmark');
        }
    },

    playSubtitleSegment(index) {
        if (this.subtitlePlaybackId) {
            cancelAnimationFrame(this.subtitlePlaybackId);
            this.subtitlePlaybackId = null;
        }

        const subtitle = this.bookmarks[2][index];
        if (!subtitle) return;

        const startTime = this.parseSrtTime(subtitle.startTime);
        const endTime = this.parseSrtTime(subtitle.endTime);

        this.player.seekTo(startTime, true);
        this.player.playVideo();

        const monitorPlayback = () => {
            if (this.player && typeof this.player.getCurrentTime === 'function' && this.player.getCurrentTime() >= endTime) {
                this.player.pauseVideo();
                this.currentTimeDisplay.textContent = subtitle.endTime;
                this.isViewerLocked = true;
                this.subtitlePlaybackId = null;
            } else {
                this.subtitlePlaybackId = requestAnimationFrame(monitorPlayback);
            }
        };
        this.subtitlePlaybackId = requestAnimationFrame(monitorPlayback);
    },

    // --- UI & EVENT HANDLERS ---
    handleBookmarkListClick(e) {
        const target = e.target;
        const bookmarkItem = target.closest('.bookmark-item');
        if (!bookmarkItem) return;

        const index = parseInt(bookmarkItem.dataset.index);
        if (isNaN(index)) return;

        if (target.closest('.seek-btn')) {
            if (this.activeBookmarkPanel == 1) this.playBookmarkSegment(index);
            else this.playSubtitleSegment(index);
            return; 
        }
        
        if (target.closest('.delete-btn')) {
            this.bookmarks[this.activeBookmarkPanel].splice(index, 1);
            if (this.activeBookmarkPanel == 2 && this.selectedSubtitleIndex === index) {
                this.selectedSubtitleIndex = -1;
                if(this.subtitleGlowTimeoutId) clearTimeout(this.subtitleGlowTimeoutId);
            }
            this.sortAndSaveBookmarks(true);
            this.renderBookmarks();
            return;
        }

        if (this.activeBookmarkPanel == 2) {
            this.selectedSubtitleIndex = index;
            document.querySelectorAll('.bookmark-item').forEach(item => item.classList.remove('selected-subtitle'));
            bookmarkItem.classList.add('selected-subtitle');
            if(this.subtitleGlowTimeoutId) clearTimeout(this.subtitleGlowTimeoutId);
        }
    },

    handleInputChange(event) {
        const target = event.target;
        const index = parseInt(target.dataset.index);
        if (isNaN(index)) return;

        if (target.classList.contains('bookmark-time')) {
            this.adjustTimeInputWidth(target);
        } else if (target.classList.contains('bookmark-desc')) {
            this.bookmarks[this.activeBookmarkPanel][index].description = target.value;
            this.saveBookmarks(false);
            this.adjustTextareaHeight(target);
        }
    },

    handleInputCommit(event) {
        const target = event.target;
        const index = parseInt(target.dataset.index);
        if (isNaN(index) || !this.bookmarks[this.activeBookmarkPanel][index]) return;

        if (target.classList.contains('bookmark-time')) {
            const parseFunc = this.activeBookmarkPanel == 1 ? this.parseChapterTime : this.parseSrtTime;
            const newTimeInSeconds = parseFunc(target.value);
            const timeType = target.dataset.timeType;
            const entry = this.bookmarks[this.activeBookmarkPanel][index];
            
            let originalTime;
            if (this.activeBookmarkPanel == 1) {
                originalTime = entry.time;
            } else {
                originalTime = parseFunc((timeType === 'start') ? entry.startTime : entry.endTime);
            }

            if (!isNaN(newTimeInSeconds)) {
                if (this.activeBookmarkPanel == 1) {
                    entry.time = newTimeInSeconds;
                } else {
                    if (timeType === 'start') {
                        entry.startTime = this.formatTimeForViewer(newTimeInSeconds);
                        if (this.parseSrtTime(entry.startTime) > this.parseSrtTime(entry.endTime)) {
                            entry.endTime = entry.startTime;
                        }
                    } else {
                        const newEndTime = Math.max(newTimeInSeconds, this.parseSrtTime(entry.startTime));
                        entry.endTime = this.formatTimeForViewer(newEndTime);
                    }
                }
                this.sortAndSaveBookmarks(true);
                this.renderBookmarks();
            } else {
                target.value = (this.activeBookmarkPanel == 1) ? this.formatTime(originalTime) : this.formatTimeForViewer(originalTime);
                this.adjustTimeInputWidth(target);
            }
        } else if (target.classList.contains('bookmark-desc')) {
            const trimmedValue = target.value.trim();
            const originalDesc = this.bookmarks[this.activeBookmarkPanel][index].description;

            if (trimmedValue !== originalDesc) {
                this.bookmarks[this.activeBookmarkPanel][index].description = trimmedValue;
                target.value = trimmedValue; 
                this.saveBookmarks(true);
            }
            this.adjustTextareaHeight(target);
        }
    },

    handleSpeedControl(e) {
        if (e.target.classList.contains('speed-btn')) {
            const speed = parseFloat(e.target.dataset.speed);
            if (this.player && typeof this.player.setPlaybackRate === 'function') {
                this.player.setPlaybackRate(speed);
                document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                e.target.blur(); 
            }
        }
    },

    handlePlaybackControl(e) {
        if (!this.player || typeof this.player.getCurrentTime !== 'function') return;
        const target = e.target;
        if (target.classList.contains('seek-control-btn')) {
            this.isViewerLocked = false;
            const seekTime = parseInt(target.dataset.seek);
            const currentTime = this.player.getCurrentTime();
            this.player.seekTo(currentTime + seekTime, true);
            target.blur();
        }
    },

    handleGlobalKeyDown(e) {
        if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault(); this.undo();
        }
        if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault(); this.redo();
        }

        if (e.key === ' ' && this.isHoveringPlayer) {
            e.preventDefault();
            if (this.player) {
                const playerState = this.player.getPlayerState();
                if (playerState === YT.PlayerState.PLAYING) {
                    this.player.pauseVideo();
                    this.syncTimestamp();
                } else {
                    this.player.playVideo();
                }
            }
        }

        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return; 
        
        if (e.key === 'Insert') {
             e.preventDefault(); this.addBookmark();
        }
    },

    // --- AUTOFILL SUGGESTIONS ---
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.remove();
            this.suggestionsContainer = null;
        }
    },

    showSuggestions(input) {
        this.hideSuggestions();
        const currentVal = input.value;
        const cursorPosition = input.selectionStart;
        const textBeforeCursor = currentVal.substring(0, cursorPosition);

        if (textBeforeCursor.length < 1) return;

        const currentIndex = parseInt(input.dataset.index);
        let otherNotes = [];

        if (this.isGlobalAutofillEnabled) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('yt_bookmarks_')) {
                    try {
                        const storedData = JSON.parse(localStorage.getItem(key));
                        if (Array.isArray(storedData)) {
                            storedData.forEach(item => {
                                if (item.description) {
                                    otherNotes.push(item.description);
                                }
                            });
                        }
                    } catch (e) {}
                }
            }
        } else {
            otherNotes = this.bookmarks[this.activeBookmarkPanel]
                .filter((bm, index) => index !== currentIndex && bm.description)
                .map(bm => bm.description);
        }

        let matches = [...new Set(otherNotes)].filter(note => 
            note.toLowerCase().startsWith(textBeforeCursor.toLowerCase()) && note.toLowerCase() !== textBeforeCursor.toLowerCase()
        );
        let suggestionType = 'full_phrase';

        if (matches.length === 0) {
            const lastSpace = textBeforeCursor.lastIndexOf(' ');
            const currentWord = textBeforeCursor.substring(lastSpace + 1);

            if (currentWord.length > 0) {
                const potentialMatches = new Set();
                otherNotes.forEach(note => {
                    const words = note.split(/\s+/);
                    words.forEach((word, index) => {
                        if (word.toLowerCase().startsWith(currentWord.toLowerCase())) {
                            const restOfPhrase = words.slice(index).join(' ');
                            potentialMatches.add(restOfPhrase);
                        }
                    });
                });
                matches = [...potentialMatches];
                suggestionType = 'partial_phrase';
            }
        }
        
        const cleanedMatches = matches.filter(match => match.trim() !== '' && match.toLowerCase() !== textBeforeCursor.toLowerCase());

        if (cleanedMatches.length === 0) return;

        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'autofill-suggestions';
        this.suggestionsContainer.dataset.suggestionType = suggestionType;
        
        cleanedMatches.slice(0, 10).forEach((match, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = match;
            if (index === 0) item.classList.add('active');

            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.applySuggestion(input, match, this.suggestionsContainer.dataset.suggestionType);
                this.hideSuggestions();
            });
            this.suggestionsContainer.appendChild(item);
        });

        const inputRect = input.getBoundingClientRect();
        this.suggestionsContainer.style.left = `${inputRect.left + window.scrollX}px`;
        this.suggestionsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
        this.suggestionsContainer.style.width = `${inputRect.width}px`;

        document.body.appendChild(this.suggestionsContainer);
    },
    
    applySuggestion(input, suggestion, type) {
        const textBeforeCursor = input.value.substring(0, input.selectionStart);
        
        if (type === 'full_phrase') {
            input.value = suggestion;
        } else {
            const lastSpace = textBeforeCursor.lastIndexOf(' ');
            const valueBefore = textBeforeCursor.substring(0, lastSpace + 1);
            input.value = valueBefore + suggestion + ' ';
        }
        
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    },

    handleSuggestionKeys(event) {
        const input = event.target;
        if (!input.classList.contains('bookmark-desc') || !this.suggestionsContainer) return;

        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        let activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if(activeIndex > -1) items[activeIndex].classList.remove('active');
            const nextIndex = (activeIndex + 1) % items.length;
            items[nextIndex].classList.add('active');
            items[nextIndex].scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if(activeIndex > -1) items[activeIndex].classList.remove('active');
            const prevIndex = (activeIndex - 1 + items.length) % items.length;
            items[prevIndex].classList.add('active');
            items[prevIndex].scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'Enter' || event.key === 'Tab') {
            if (this.suggestionsContainer) {
                event.preventDefault();
                const activeItem = this.suggestionsContainer.querySelector('.suggestion-item.active');
                if (activeItem) {
                    const suggestionType = this.suggestionsContainer.dataset.suggestionType;
                    this.applySuggestion(input, activeItem.textContent, suggestionType);
                }
                this.hideSuggestions();
            }
        } else if (event.key === 'Escape') {
            this.hideSuggestions();
        }
    },

    handleAutofill(event) {
        const input = event.target;
        if (!input.classList.contains('bookmark-desc')) return;
        
        const controlKeys = ['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'];
        if (controlKeys.includes(event.key)) return;

        this.showSuggestions(input);
    },

    // --- DATA OUTPUT & SAVING ---
    generateDescription() {
        const currentList = this.bookmarks[this.activeBookmarkPanel];
        this.youtubeOutput.readOnly = false;

        if (currentList.length === 0) {
            this.youtubeOutput.value = "No entries added yet.";
            this.youtubeOutput.classList.remove('hidden');
            this.copyDescBtn.classList.add('hidden');
            this.saveAsBtnContainer.classList.add('hidden');
            return;
        }
        
        if (!this.player || typeof this.player.getVideoData !== 'function') {
            this.showMessage("Player is not ready or video data is unavailable.");
            return;
        }

        let output = "";
        if (this.activeBookmarkPanel == 1) {
            const videoTitle = this.player.getVideoData().title;
            output = `${videoTitle}\n\n`;
            if (currentList.length === 0 || currentList[0].time > 0) {
                output += "00:00 Intro\n";
            }
            currentList.forEach(bookmark => {
                const desc = bookmark.description || "Untitled";
                output += `${this.formatTime(bookmark.time)} ${desc.replace(/\n/g, ' ')}\n`;
            });

            const lastBookmark = currentList[currentList.length - 1];
            const promoTime = lastBookmark.time + 1;
            const formattedPromoTime = this.formatTime(promoTime);
            output += `${formattedPromoTime} Video Chapters created on videocaptioncreator.pages.dev\n`;

        } else {
            currentList.forEach((subtitle, index) => {
                output += `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.description || ""}\n\n`;
            });
            
            const lastSubtitle = currentList[currentList.length - 1];
            const videoDuration = this.player.getDuration();
            const lastEndTime = this.parseSrtTime(lastSubtitle.endTime);
            const promoStartTime = lastEndTime + 1;
            const promoEndTime = videoDuration;

            if (promoStartTime < promoEndTime) {
                const promoIndex = currentList.length + 1;
                const formattedStartTime = this.formatTimeForViewer(promoStartTime);
                const formattedEndTime = this.formatTimeForViewer(promoEndTime);
                const promoDescription = "Subtitles created on  videocaptioncreator.pages.dev";
                if (!output.endsWith('\n\n')) {
                    output += '\n';
                }
                output += `${promoIndex}\n${formattedStartTime} --> ${formattedEndTime}\n${promoDescription}\n\n`;
            }
        }

        this.youtubeOutput.value = output.trim();
        this.youtubeOutput.classList.remove('hidden');
        this.copyDescBtn.classList.remove('hidden');
        this.saveAsBtnContainer.classList.remove('hidden');
        this.updateSaveAsOptions();
    },
    
    copyDescription() {
        navigator.clipboard.writeText(this.youtubeOutput.value).then(() => {
            this.copyDescBtn.textContent = 'Copied!';
            setTimeout(() => { this.copyDescBtn.textContent = 'Copy'; }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showMessage('Failed to copy text. Please try again or copy manually.');
        });
    },

    // --- TIMESTAMP SYNCING & POLLING ---
    syncTimestamp() {
        if (this.isViewerLocked || !this.player || typeof this.player.getCurrentTime !== 'function') return;

        const currentTime = this.player.getCurrentTime();
        this.currentTimeDisplay.textContent = this.activeBookmarkPanel == 1 ? this.formatTime(currentTime) : this.formatTimeForViewer(currentTime);

        let activeIndex = -1;
        const currentList = this.bookmarks[this.activeBookmarkPanel];
        
        for (let i = currentList.length - 1; i >= 0; i--) {
            const itemTime = (this.activeBookmarkPanel == 1) ? currentList[i].time : this.parseSrtTime(currentList[i].startTime);
            const comparisonTime = (this.activeBookmarkPanel == 1) ? Math.floor(currentTime) : currentTime;

            if (comparisonTime >= itemTime) {
                activeIndex = i;
                break;
            }
        }

        document.querySelectorAll('.bookmark-item').forEach((item, index) => {
            if (index === activeIndex) {
                if (!item.classList.contains('active-bookmark')) {
                    item.classList.add('active-bookmark');
                    if (!this.isHoveringBookmarks) {
                        const container = this.bookmarksListContainer;
                        // Center the item within the container
                        const scrollPosition = item.offsetTop - container.offsetTop - (container.clientHeight / 2) + (item.clientHeight / 2);
                        container.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            } else {
                item.classList.remove('active-bookmark');
            }
        });
    },

    startTimestampLoop() {
        if (this.timestampAnimationId === null) {
            const loop = () => {
                this.syncTimestamp();
                this.timestampAnimationId = requestAnimationFrame(loop);
            }
            this.timestampAnimationId = requestAnimationFrame(loop);
        }
    },

    stopTimestampLoop() {
        if (this.timestampAnimationId !== null) {
            cancelAnimationFrame(this.timestampAnimationId);
            this.timestampAnimationId = null;
        }
        this.syncTimestamp();
    },

    startPolling() {
        if (this.timeUpdateInterval === null) {
            this.timeUpdateInterval = setInterval(() => this.syncTimestamp(), 500);
        }
    },

    stopPolling() {
        if (this.timeUpdateInterval !== null) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    },

    // --- DATA PERSISTENCE & HISTORY ---
    sortAndSaveBookmarks(shouldSaveHistory) {
        const timeProp = (this.activeBookmarkPanel == 1) ? 'time' : 'startTime';
        const parseFunc = (this.activeBookmarkPanel == 1) ? this.parseChapterTime : this.parseSrtTime;
        this.bookmarks[this.activeBookmarkPanel].sort((a, b) => {
            const aTime = (this.activeBookmarkPanel == 1) ? a[timeProp] : parseFunc(a[timeProp]);
            const bTime = (this.activeBookmarkPanel == 1) ? b[timeProp] : parseFunc(b[timeProp]);
            return aTime - bTime;
        });
        this.saveBookmarks(shouldSaveHistory);
    },

    saveBookmarks(shouldSaveHistory) {
        if (this.currentVideoId) {
            localStorage.setItem(`yt_bookmarks_${this.currentVideoId}_${this.activeBookmarkPanel}`, JSON.stringify(this.bookmarks[this.activeBookmarkPanel]));
        }
        if (shouldSaveHistory) {
            this.saveState();
        }
    },

    loadAndRenderBookmarks() {
        if (this.currentVideoId) {
            for (let panel in this.bookmarks) {
                const storedBookmarks = localStorage.getItem(`yt_bookmarks_${this.currentVideoId}_${panel}`);
                this.bookmarks[panel] = storedBookmarks ? JSON.parse(storedBookmarks) : [];
                this.history[panel] = [JSON.parse(JSON.stringify(this.bookmarks[panel]))];
                this.historyPointer[panel] = 0;
            }
            this.updateUndoRedoButtons();
            this.renderBookmarks();
        }
    },

    saveState() {
        let currentHistory = this.history[this.activeBookmarkPanel];
        let currentPointer = this.historyPointer[this.activeBookmarkPanel];

        if (currentPointer < currentHistory.length - 1) {
            this.history[this.activeBookmarkPanel] = currentHistory.slice(0, currentPointer + 1);
        }
        this.history[this.activeBookmarkPanel].push(JSON.parse(JSON.stringify(this.bookmarks[this.activeBookmarkPanel])));
        this.historyPointer[this.activeBookmarkPanel]++;
        this.updateUndoRedoButtons();
    },

    undo() {
        if (this.historyPointer[this.activeBookmarkPanel] > 0) {
            this.historyPointer[this.activeBookmarkPanel]--;
            this.bookmarks[this.activeBookmarkPanel] = JSON.parse(JSON.stringify(this.history[this.activeBookmarkPanel][this.historyPointer[this.activeBookmarkPanel]]));
            localStorage.setItem(`yt_bookmarks_${this.currentVideoId}_${this.activeBookmarkPanel}`, JSON.stringify(this.bookmarks[this.activeBookmarkPanel]));
            this.renderBookmarks();
            this.updateUndoRedoButtons();
        }
    },

    redo() {
        if (this.historyPointer[this.activeBookmarkPanel] < this.history[this.activeBookmarkPanel].length - 1) {
            this.historyPointer[this.activeBookmarkPanel]++;
            this.bookmarks[this.activeBookmarkPanel] = JSON.parse(JSON.stringify(this.history[this.activeBookmarkPanel][this.historyPointer[this.activeBookmarkPanel]]));
            localStorage.setItem(`yt_bookmarks_${this.currentVideoId}_${this.activeBookmarkPanel}`, JSON.stringify(this.bookmarks[this.activeBookmarkPanel]));
            this.renderBookmarks();
            this.updateUndoRedoButtons();
        }
    },

    updateUndoRedoButtons() {
        this.undoBtn.disabled = this.historyPointer[this.activeBookmarkPanel] <= 0;
        this.redoBtn.disabled = this.historyPointer[this.activeBookmarkPanel] >= this.history[this.activeBookmarkPanel].length - 1;
    },
    
    // --- UI HELPERS & UTILITIES ---
    showMessage(message) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: '1001'
        });

        const messageBox = document.createElement('div');
        Object.assign(messageBox.style, {
            backgroundColor: 'var(--secondary-bg)', padding: '25px', borderRadius: '12px',
            border: '1px solid var(--border-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            textAlign: 'center', maxWidth: '80%'
        });

        const text = document.createElement('p');
        text.textContent = message;
        text.style.margin = '0 0 20px 0';
        text.style.color = 'var(--text-color)';
        messageBox.appendChild(text);

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.onclick = () => document.body.removeChild(overlay);
        messageBox.appendChild(okButton);

        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    },

    startOver() {
        this.stopPolling();
        this.stopTimestampLoop();
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        this.logo.classList.add('animating');
        this.currentVideoId = null;
        this.bookmarks = { 1: [], 2: [] };
        this.history = { 1: [], 2: [] };
        this.historyPointer = { 1: -1, 2: -1 };
        this.activeBookmarkPanel = 1;
        this.bookmarksTitle.innerHTML = 'Bookmark <span class="dropdown-arrow">▼</span>';
        this.videoUrlInput.value = '';
        this.youtubeOutput.value = '';
        this.youtubeOutput.classList.add('hidden');
        this.copyDescBtn.classList.add('hidden');
        this.saveAsBtnContainer.classList.add('hidden');
        this.mainContent.classList.add('hidden');
        this.landingPage.classList.remove('hidden');
        this.currentTimeDisplay.textContent = this.formatTime(0);

        // if (window.animations && typeof window.animations.runLandingPageIntroAnimation === 'function') {
        window.animations.runLandingPageIntroAnimation();
        // }
    },

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    },

    adjustTimeInputWidth(input) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = getComputedStyle(input).font;
        const textWidth = context.measureText(input.value).width;
        input.style.width = `${textWidth + 20}px`;
    },
    
    switchActivePanel(e) {
        e.preventDefault();
        if (e.target.tagName !== 'A') return;
        const panelId = e.target.dataset.panel;
        if (panelId && panelId != this.activeBookmarkPanel) {
            this.activeBookmarkPanel = panelId;
            this.bookmarksTitle.innerHTML = `${e.target.textContent} <span class="dropdown-arrow">▼</span>`;
            
            this.bookmarkPanelControls.classList.toggle('hidden', this.activeBookmarkPanel != 1);
            this.subtitlePanelControls.classList.toggle('hidden', this.activeBookmarkPanel != 2);

            this.outputTitle.textContent = (this.activeBookmarkPanel == 1) ? "Generate Description" : "Generate Subtitles (SRT)";
            this.outputDescription.textContent = (this.activeBookmarkPanel == 1) 
                ? "Click to format your bookmarks to create chapters."
                : "Click to format your subtitles in SRT format for use in video players.";
            this.selectedSubtitleIndex = -1;
            
            this.youtubeOutput.value = '';
            this.youtubeOutput.classList.add('hidden');
            this.copyDescBtn.classList.add('hidden');
            this.saveAsBtnContainer.classList.add('hidden');
            
            this.isViewerLocked = false; 
            this.syncTimestamp(); 
            this.renderBookmarks();
            this.updateUndoRedoButtons();
        }
    },

    setSubtitleStart() {
        if (this.selectedSubtitleIndex > -1 && this.player) {
            if(this.player.getPlayerState() === YT.PlayerState.PLAYING) this.player.pauseVideo();
            this.syncTimestamp(); 
            const subtitle = this.bookmarks[2][this.selectedSubtitleIndex];
            subtitle.startTime = this.formatTimeForViewer(this.player.getCurrentTime());
            if (this.parseSrtTime(subtitle.startTime) > this.parseSrtTime(subtitle.endTime)) {
                subtitle.endTime = subtitle.startTime;
            }
            this.sortAndSaveBookmarks(true);
            this.renderBookmarks();
        }
    },

    setSubtitleEnd() {
        if (this.selectedSubtitleIndex > -1 && this.player) {
            if(this.player.getPlayerState() === YT.PlayerState.PLAYING) this.player.pauseVideo();
            this.syncTimestamp();
            const subtitle = this.bookmarks[2][this.selectedSubtitleIndex];
            const newEndTime = Math.max(this.player.getCurrentTime(), this.parseSrtTime(subtitle.startTime));
            subtitle.endTime = this.formatTimeForViewer(newEndTime);
            this.sortAndSaveBookmarks(true);
            this.renderBookmarks();
        }
    },

    handleBookmarksMouseEnter() {
        this.isHoveringBookmarks = true;
        if (this.activeBookmarkPanel == 2 && this.selectedSubtitleIndex !== -1) {
            if (this.subtitleGlowTimeoutId) clearTimeout(this.subtitleGlowTimeoutId);
        }
    },

    handleBookmarksMouseLeave() {
        this.isHoveringBookmarks = false;
        if (this.activeBookmarkPanel == 2 && this.selectedSubtitleIndex !== -1) {
            if (this.subtitleGlowTimeoutId) clearTimeout(this.subtitleGlowTimeoutId);
            this.subtitleGlowTimeoutId = setTimeout(() => {
                const selectedItem = this.bookmarksListContainer.querySelector('.bookmark-item.selected-subtitle');
                if (selectedItem) selectedItem.classList.remove('selected-subtitle');
                this.selectedSubtitleIndex = -1;
            }, 5000);
        }
    },

    updateSaveAsOptions() {
        this.saveAsDropdown.innerHTML = '';
        
        const txtOption = document.createElement('a');
        txtOption.href = '#'; txtOption.textContent = 'Save as .txt'; txtOption.dataset.format = 'txt';
        this.saveAsDropdown.appendChild(txtOption);

        if (this.activeBookmarkPanel == 2) {
            const srtOption = document.createElement('a');
            srtOption.href = '#'; srtOption.textContent = 'Save as .srt'; srtOption.dataset.format = 'srt';
            this.saveAsDropdown.appendChild(srtOption);
        }
    },

    handleSaveAs(e) {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const format = e.target.dataset.format;
            this.saveFile(format);
        }
    },

    saveFile(format) {
        const content = this.youtubeOutput.value;
        const videoTitle = this.player.getVideoData().title.replace(/[<>:"/\\|?*]+/g, '');
        const filename = `${videoTitle}_${this.activeBookmarkPanel == 1 ? 'chapters' : 'subtitles'}.${format}`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // --- LANDING PAGE FEATURES ---
    async cycleFeatures() {
        if (!this.featuresGrid || typeof featureData === 'undefined') return;
    
        const FADE_DURATION = 500; // ms
        const STAGGER_DELAY = 150; // ms
    
        // 1. Fade out existing cards
        const existingCards = this.featuresGrid.querySelectorAll('.feature-card');
        if (existingCards.length > 0) {
            existingCards.forEach(card => {
                card.style.animation = `card-fade-out ${FADE_DURATION / 1000}s ease-in forwards`;
            });
            await new Promise(resolve => setTimeout(resolve, FADE_DURATION));
        }
    
        // 2. Clear grid and create new cards
        this.featuresGrid.innerHTML = '';
        const cardsPerView = window.innerWidth < 600 ? 1 : 2;
        const newCards = [];
    
        for (let i = 0; i < cardsPerView; i++) {
            const index = (this.currentFeatureIndex + i) % featureData.length;
            const data = featureData[index];
    
            const card = document.createElement('div');
            card.className = 'feature-card';
            card.innerHTML = `${data.icon}<h3>${data.title}</h3><p>${data.text}</p>`;
            this.featuresGrid.appendChild(card);
            newCards.push(card);
        }
    
        // 3. Fade in new cards with a stagger effect
        if (newCards[0]) {
            newCards[0].style.animation = `card-fade-in ${FADE_DURATION / 1000}s ease-out forwards`;
        }
        if (newCards[1]) {
            setTimeout(() => {
                newCards[1].style.animation = `card-fade-in ${FADE_DURATION / 1000}s ease-out forwards`;
            }, STAGGER_DELAY);
        }
    
        // 4. Update index for the next cycle
        this.currentFeatureIndex = (this.currentFeatureIndex + cardsPerView) % featureData.length;
    },
    
    startFeatureCycle() {
        if (!this.featuresGrid) return;
        clearInterval(this.featureInterval);
        
        this.cycleFeatures(); // Run the first cycle immediately
    
        const VISIBLE_DURATION = 3000;
        const FADE_OUT_DURATION = 500;
        this.featureInterval = setInterval(this.cycleFeatures.bind(this), VISIBLE_DURATION + FADE_OUT_DURATION);
    
        this.featuresGrid.onmouseenter = () => {
            clearInterval(this.featureInterval);
            if (this.featureMouseLeaveTimeout) {
                clearTimeout(this.featureMouseLeaveTimeout);
            }
        };
    
        this.featuresGrid.onmouseleave = () => {
            this.featureMouseLeaveTimeout = setTimeout(() => {
                this.startFeatureCycle();
            }, 2000); // Restart after a 2-second delay
        };
    }
};

// Initialize the application once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

