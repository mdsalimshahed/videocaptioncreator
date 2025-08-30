// toc.js - Table of Contents Sidebar Logic (with all fixes)

document.addEventListener('DOMContentLoaded', () => {
    const tocSidebar = document.getElementById('toc-sidebar');
    const postBody = document.querySelector('.post-body');

    if (!tocSidebar || !postBody) {
        return;
    }

    const headings = postBody.querySelectorAll('h2');
    if (headings.length === 0) {
        tocSidebar.style.display = 'none';
        return;
    }

    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'On this page';
    tocSidebar.appendChild(tocTitle);

    const tocList = document.createElement('ul');

    headings.forEach(heading => {
        const text = heading.textContent;
        
        // --- FIX: Add a 'section-' prefix to ensure the ID is always valid ---
        const id = 'section-' + text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        heading.id = id;

        const listItem = document.createElement('li');
        listItem.classList.add('anim-element');
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = text;
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    tocSidebar.appendChild(tocList);

    const allTocItems = tocSidebar.querySelectorAll('li');
    allTocItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 75);
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const tocLink = tocSidebar.querySelector(`a[href="#${id}"]`);
            
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                tocSidebar.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                if(tocLink) {
                    tocLink.classList.add('active');
                    
                    tocLink.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }
        });
    }, { rootMargin: '0px 0px -80% 0px', threshold: 0.5 });

    headings.forEach(heading => observer.observe(heading));

    window.addEventListener('scroll', () => {
        const isAtBottom = (window.innerHeight + Math.ceil(window.scrollY)) >= document.body.offsetHeight;
        
        if (isAtBottom && headings.length > 0) {
            const lastHeading = headings[headings.length - 1];
            const lastLinkId = lastHeading.getAttribute('id');
            const lastTocLink = tocSidebar.querySelector(`a[href="#${lastLinkId}"]`);
            
            if (lastTocLink && !lastTocLink.classList.contains('active')) {
                tocSidebar.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                lastTocLink.classList.add('active');
                lastTocLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});