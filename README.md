# VideoCC - Free YouTube Timestamp & Chapter Generator

**Live Webpage**: **[videocaptioncreator.pages.dev](https://videocaptioncreator.pages.dev/)**

Welcome to **VideoCC**, a powerful, single-page web application designed to make creating timestamps, chapters, and subtitles for YouTube videos effortless. Built with a sleek, modern interface, it provides content creators, students, and researchers with the tools they need to quickly annotate and navigate video content without leaving the browser.

## ✨ Core Features

This tool is packed with features designed for efficiency and a great user experience.

### 🎬 Video & Playback Controls

-   **Load Any YouTube Video**: Simply paste a YouTube video URL to instantly load it into the player.
    
-   **Variable Playback Speed**: Watch videos at `0.5x`, `1x`, `1.5x`, or `2x` speed to match your note-taking pace.
    
-   **Precise Seeking**: Jump forward or backward with fine-grained controls (`±2s`, `±5s`, `±30s`).
    
-   **Hover-to-Control Hotkeys**:
    
    -   **Spacebar**: Play or pause the video instantly just by hovering over the player.
        
    -   **Arrow Keys**: Seek forward or backward. The seek interval defaults to 5 seconds.
        
-   **Selectable Seek Interval**: Click any seek button (e.g., `-30s`) to make it the active interval for the arrow key hotkeys, allowing for customized seeking.
    

### 🖋️ Annotation & Captioning

-   **Dual-Mode Annotation**:
    
    -   **Bookmark Mode**: Create single-point timestamps with descriptions, perfect for generating YouTube video chapters.
        
    -   **Subtitle Mode**: Define entries with both a **start time** and an **end time**, ideal for creating `.srt` subtitle files.
        
-   **Smart Autofill**: The app learns from your previous notes and provides intelligent suggestions to speed up repetitive text entry.
    
-   **One-Click Timestamping**: Use the `Insert` key to instantly add a new bookmark or subtitle at the video's current time, pausing the video for accuracy.
    

### 💻 UI & User Experience

-   **Modern & Responsive Design**: The entire interface is built to be intuitive and visually appealing on any device, from large desktop monitors to mobile phones.
    
-   **Resizable Panels**: On desktop, click and drag the central resizer bar to adjust the width of the video and notes panels to your preference.
    
-   **Adaptive Mobile View**: On smaller screens, the layout stacks vertically with a scrollable notes panel to ensure full functionality without compromising usability.
    
-   **Auto-Scroll & Highlight**: As the video plays, the currently active bookmark or subtitle is automatically highlighted and scrolled into view in the notes panel.
    
-   **Polished Animations**: Smooth, subtle animations like the "shine" effect on buttons and the animated text gradient provide a premium user experience.
    

### 💾 Data Management & Export

-   **Auto-Save**: All your work is automatically saved to your browser's local storage on a per-video basis, so you won't lose it if you refresh the page.
    
-   **Scoped Undo/Redo**:
    
    -   The **Undo/Redo buttons** manage the addition and deletion of **entire bookmark/subtitle entries**.
        
    -   **Ctrl+Z / Ctrl+Y** keyboard shortcuts are reserved for **text editing** within the input fields (including the main YouTube link field) and do not affect the entry list.
        
-   **Flexible Export Options**:
    
    -   **Generate for YouTube**: Automatically formats your bookmarks into a list ready to be pasted into a YouTube video description.
        
    -   **Generate SRT**: Formats your subtitles into the standard `.srt` file format.
        
    -   **Copy or Save**: Copy the generated output to your clipboard or save it directly as a `.txt` or `.srt` file.
        

## 🚀 How to Use

1.  **Paste Link**: Copy a YouTube video URL and paste it into the input field on the landing page.
    
2.  **Load Video**: Click the "Load Video" button.
    
3.  **Choose Mode**: Use the dropdown above the right panel to select either "Bookmark" or "Subtitle" mode.
    
4.  **Add Entries**: Play the video. When you reach an important moment, press the `Insert` key or click the "Add a bookmark/subtitle" button.
    
5.  **Edit Details**: Adjust the timestamp if needed and type your description in the text field.
    
6.  **Generate & Export**: Once you're finished, scroll down to the "Generate" section. Click the "Generate" button to format your notes, then either "Copy" or "Save As" to export your work.
    

## 🛠️ Technical Stack

-   **HTML5**: Semantic and accessible structure.
    
-   **CSS3**: Modern styling with CSS Variables, Flexbox, Grid, and Keyframe animations.
    
-   **JavaScript (ES6+)**: All application logic is handled with vanilla JavaScript, organized into modular, independent files for maintainability.
    
-   **YouTube IFrame Player API**: For embedding and controlling the YouTube video player.
    

## 📂 File Structure

The project is organized with a focus on modularity and separation of concerns:

```
.
├── .vscode/
│   └── settings.json
├── logo/
│   ├── about-us.jpg
│   ├── post-autofill-fix.jpg
│   ├── post-huge.jpg
│   ├── post-seo.jpg
│   ├── post-walk.jpg
│   ├── your-logo-filename.jpg
│   └── your-logo-filename.png
├── index.html                  # Main application page
├── about.html                  # About page
├── blog.html                   # Blog index page
├── privacy.html                # Privacy policy
├── post-autofill-fix.html      # Blog post
├── post-huge-update.html       # Blog post
├── post-seo-bookmarks.html     # Blog post
├── post-walkthrough.html       # Blog post
├── style.css                   # Core application styles
├── animations.css              # Animation keyframes and classes
├── autofill_toggle.css         # Styles for the autofill toggle switch
├── blog.css                    # Styles specific to the blog pages
├── floating_nav.css            # Styles for the floating navigation buttons
├── mobile_ux.css               # Responsive styles for mobile devices
├── resizer.css                 # Styles for the resizable panel divider
├── selectable_seek.css         # Styles for the selectable seek buttons
├── slider_controls.css         # Styles for the slider controls
├── app.js                      # Main application logic
├── animations.js               # Handles all animations and page transitions
├── autofill_toggle.js          # Logic for the autofill toggle switch
├── feature_cards.js            # Defines the feature cards on the landing page
├── feedback.js                 # Handles the feedback form submission
├── player_hotkeys.js           # Implements keyboard shortcuts for the video player
├── resizer.js                  # Logic for the resizable panel divider
├── selectable_seek.js          # Logic for the selectable seek buttons
├── slider_controls.js          # Logic for the slider controls
├── text_undo_redo.js           # Manages undo/redo for text input fields
├── toc.js                      # Generates the table of contents for blog posts
├── ads.txt                     # Google Adsense configuration
└── README.md                   # This file

```
