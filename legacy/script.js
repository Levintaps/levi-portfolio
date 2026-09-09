document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. SPIDER WEB BACKGROUND
    // ============================================================
    class SpiderWeb {
        constructor() {
            this.canvas = document.getElementById('canvas-container');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.mouseX = 0;
            this.mouseY = 0;
            this.nodes = [];
            this.particles = [];
            this.nodesCount = Math.floor(window.innerWidth * window.innerHeight / 20000);
            this.connectionDistance = Math.min(window.innerWidth, window.innerHeight) / 4;
            this.colors = { blue: '#00f3ff', purple: '#9d00ff', green: '#00ff9d' };
            this.createNodes();
            window.addEventListener('resize', () => this.handleResize());
            document.addEventListener('mousemove', (e) => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
            this.lastFrame = 0;
            this.animate(0);
        }

        createNodes() {
            this.nodes = [];
            for (let i = 0; i < this.nodesCount; i++) {
                this.nodes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    radius: Math.random() * 1.5 + 1,
                    vx: Math.random() * 0.5 - 0.25,
                    vy: Math.random() * 0.5 - 0.25,
                    color: this.getRandomColor()
                });
            }
        }

        getRandomColor() {
            const colors = [this.colors.blue, this.colors.purple, this.colors.green];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        handleResize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.nodesCount = Math.floor(window.innerWidth * window.innerHeight / 20000);
            this.connectionDistance = Math.min(window.innerWidth, window.innerHeight) / 4;
            this.createNodes();
        }

        createParticle(nodeA, nodeB) {
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            return {
                x: nodeA.x, y: nodeA.y,
                targetX: nodeB.x, targetY: nodeB.y,
                speed: 1 + Math.random(),
                color: nodeA.color,
                progress: 0,
                distance: Math.sqrt(dx * dx + dy * dy)
            };
        }

        animate(timestamp) {
            if (timestamp - this.lastFrame < 16.67) {
                requestAnimationFrame((t) => this.animate(t));
                return;
            }
            this.lastFrame = timestamp;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.lineWidth = 0.7;

            for (let i = 0; i < this.nodes.length; i++) {
                const nodeA = this.nodes[i];
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const nodeB = this.nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.connectionDistance) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = nodeA.color;
                        this.ctx.globalAlpha = 0.5 * (1 - distance / this.connectionDistance);
                        this.ctx.moveTo(nodeA.x, nodeA.y);
                        this.ctx.lineTo(nodeB.x, nodeB.y);
                        this.ctx.stroke();
                        const mouseDist = Math.sqrt(
                            Math.pow((nodeA.x + nodeB.x) / 2 - this.mouseX, 2) +
                            Math.pow((nodeA.y + nodeB.y) / 2 - this.mouseY, 2)
                        );
                        if (mouseDist < 100 && Math.random() < 0.02 && this.particles.length < 20) {
                            this.particles.push(this.createParticle(nodeA, nodeB));
                        }
                    }
                }

                nodeA.x += nodeA.vx;
                nodeA.y += nodeA.vy;
                if (nodeA.x < 0 || nodeA.x > this.canvas.width) nodeA.vx = -nodeA.vx;
                if (nodeA.y < 0 || nodeA.y > this.canvas.height) nodeA.vy = -nodeA.vy;

                this.ctx.beginPath();
                this.ctx.fillStyle = nodeA.color;
                this.ctx.globalAlpha = 0.7;
                this.ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
                this.ctx.fill();

                const mouseDistance = Math.sqrt(
                    Math.pow(nodeA.x - this.mouseX, 2) +
                    Math.pow(nodeA.y - this.mouseY, 2)
                );
                if (mouseDistance < 80) {
                    const angle = Math.atan2(nodeA.y - this.mouseY, nodeA.x - this.mouseX);
                    const force = (80 - mouseDistance) / 2000;
                    nodeA.vx += Math.cos(angle) * force;
                    nodeA.vy += Math.sin(angle) * force;
                }

                const speed = Math.sqrt(nodeA.vx * nodeA.vx + nodeA.vy * nodeA.vy);
                if (speed > 2) {
                    nodeA.vx = (nodeA.vx / speed) * 2;
                    nodeA.vy = (nodeA.vy / speed) * 2;
                }
            }

            this.ctx.globalAlpha = 0.8;
            this.particles = this.particles.filter(p => p.progress < 1);
            for (const particle of this.particles) {
                particle.progress += particle.speed / particle.distance;
                particle.x += (particle.targetX - particle.x) * (particle.speed / particle.distance);
                particle.y += (particle.targetY - particle.y) * (particle.speed / particle.distance);
                this.ctx.beginPath();
                this.ctx.fillStyle = particle.color;
                this.ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }

            requestAnimationFrame((t) => this.animate(t));
        }
    }

    new SpiderWeb();

    // ============================================================
    // 2. TYPED.JS
    // Must initialise BEFORE GSAP animates anything so the cursor
    // element exists in the DOM. The .hero-role-line wrapper is
    // intentionally NOT animated by GSAP so the text is always visible.
    // ============================================================
    if (document.querySelector('.title')) {
        new Typed('.title', {
            strings: [
                'Full Stack Developer',
                'UI/UX Designer',
                'Problem Solver',
                'Creative Thinker',
                'Web & Mobile Developer',
                'Game Developer',
                'Professional Chess Player',
                'System Administrator',
                'API Security Specialist',
                'Secure Coding Advocate'
            ],
            typeSpeed: 80,
            backSpeed: 30,
            backDelay: 1500,
            startDelay: 300,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true
        });
    }

    // ============================================================
    // 3. GSAP HERO ANIMATION
    // NOTE: .hero-role-line is excluded — Typed.js owns it.
    // ============================================================
    gsap.registerPlugin(ScrollTrigger);

    function animateHeroSection() {
        const targets = [
            '.hero-greeting', '.hero-name', '.hero-desc',
            '.hero-cta', '.hero-stats', '.profile-frame', '.hero-socials'
        ];

        // Set all to invisible first
        gsap.set(targets, { opacity: 0, y: 30 });

        // Then animate in sequentially
        gsap.timeline({ delay: 0.15 })
            .to('.profile-frame',  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
            .to('.hero-greeting',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
            .to('.hero-name',      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero-desc',      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
            .to('.hero-cta',       { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
            .to('.hero-stats',     { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
            .to('.hero-socials',   { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
    }

    // ============================================================
    // 4. GSAP SCROLL ANIMATIONS
    // ============================================================
    function animateSkillsSection() {
        gsap.from('#skills .skill-card', {
            scrollTrigger: { trigger: '#skills', start: 'top 80%' },
            opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out'
        });
        gsap.from('#skills .stag', {
            scrollTrigger: { trigger: '#skills', start: 'top 70%' },
            opacity: 0, scale: 0.8, duration: 0.4, stagger: 0.04, ease: 'back.out(1.7)'
        });
    }

    function animateProjectsSection() {
        // Only animate filter bar & featured card — project cards are handled by updateProjects()
        gsap.from('#projects .filter-btn', {
            scrollTrigger: { trigger: '#projects', start: 'top 85%' },
            opacity: 0, y: 15, duration: 0.5, stagger: 0.06, ease: 'power3.out'
        });
        gsap.from('#projects .project-featured', {
            scrollTrigger: { trigger: '#projects .project-featured', start: 'top 90%' },
            opacity: 0, y: 30, duration: 0.8, ease: 'power3.out'
        });
    }

    function animateFeedbackSection() {
        gsap.from('#feedback .chatbox-container, #feedback .rating-panel', {
            scrollTrigger: { trigger: '#feedback', start: 'top 80%' },
            opacity: 0, y: 30, duration: 0.7, stagger: 0.2, ease: 'power3.out'
        });
    }

    // Section title fade-ins
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target.querySelector('.section-title');
                if (title) {
                    gsap.from(title, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
                }
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));

    // Run all animations
    animateHeroSection();
    animateSkillsSection();
    animateProjectsSection();
    animateFeedbackSection();

    // ============================================================
    // 5. CV REQUEST MODAL
    // ============================================================
    const viewCvBtn      = document.getElementById('view-cv-btn');
    const cvRequestModal = document.getElementById('cv-request-modal');
    const closeCvModal   = document.getElementById('close-cv-modal');
    const cvRequestForm  = document.getElementById('cv-request-form');
    const cvFormMessage  = document.getElementById('cv-form-message');

    if (viewCvBtn && cvRequestModal) {
        viewCvBtn.addEventListener('click', () => { cvRequestModal.style.display = 'block'; });
    }
    if (closeCvModal && cvRequestModal) {
        closeCvModal.addEventListener('click', () => {
            cvRequestModal.style.display = 'none';
            if (cvRequestForm)  cvRequestForm.reset();
            if (cvFormMessage)  cvFormMessage.textContent = '';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === cvRequestModal) {
            cvRequestModal.style.display = 'none';
            if (cvRequestForm)  cvRequestForm.reset();
            if (cvFormMessage)  cvFormMessage.textContent = '';
        }
    });

    if (cvRequestForm && cvFormMessage) {
        cvRequestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = cvRequestForm.querySelector('.form-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const name    = document.getElementById('cv-name').value;
            const email   = document.getElementById('cv-email').value;
            const message = document.getElementById('cv-message').value || 'Requested CV access';
            const time    = new Date().toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: 'numeric', minute: 'numeric',
                second: 'numeric', hour12: true
            });

            emailjs.send('service_onojbso', 'template_h1p4pz9', {
                name,
                from_email: email,
                time,
                message,
                to_email: 'levintaps@gmail.com'
            }).then(() => {
                cvFormMessage.textContent = 'Request sent! I will review and follow up soon.';
                cvFormMessage.className = 'form-message success';
                cvRequestForm.reset();
            }).catch(() => {
                cvFormMessage.textContent = 'Failed to send. Please try again later.';
                cvFormMessage.className = 'form-message error';
            }).finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Request';
            });
        });
    }

    // ============================================================
    // 6. ABOUT ME MODAL
    // ============================================================
    const seeMoreBtn            = document.querySelector('.see-more-btn');
    const aboutModal            = document.getElementById('about-modal');
    const aboutCloseBtn         = aboutModal ? aboutModal.querySelector('.close-btn') : null;
    const chessCareerBtn        = document.querySelector('.chess-career-btn');
    const chessCareerSection    = document.querySelector('.chess-career');
    const ingameProfileBtn      = document.querySelector('.ingame-profile-btn');
    const ingameProfilesSection = document.querySelector('.ingame-profiles');
    const aboutModalContent     = aboutModal ? aboutModal.querySelector('.modal-content') : null;

    if (seeMoreBtn && aboutModal) {
        seeMoreBtn.addEventListener('click', () => {
            aboutModal.style.display = 'block';
            if (aboutModalContent) aboutModalContent.scrollTop = 0;
            gsap.fromTo(aboutModal,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
            );
        });
    }

    function closeAboutModal() {
        if (!aboutModal) return;
        gsap.to(aboutModal, {
            opacity: 0, scale: 0.9, duration: 0.3, ease: 'power3.in',
            onComplete: () => {
                aboutModal.style.display = 'none';
                if (chessCareerSection)    chessCareerSection.style.display = 'none';
                if (ingameProfilesSection) ingameProfilesSection.style.display = 'none';
            }
        });
    }

    if (aboutCloseBtn) aboutCloseBtn.addEventListener('click', closeAboutModal);
    window.addEventListener('click', (e) => { if (e.target === aboutModal) closeAboutModal(); });

    if (chessCareerBtn && chessCareerSection) {
        chessCareerBtn.addEventListener('click', () => {
            if (ingameProfilesSection) ingameProfilesSection.style.display = 'none';
            const isVisible = chessCareerSection.style.display === 'block';
            if (!isVisible) {
                chessCareerSection.style.display = 'block';
                gsap.fromTo(chessCareerSection,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
                );
                chessCareerSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                gsap.to(chessCareerSection, {
                    opacity: 0, y: 20, duration: 0.3, ease: 'power3.in',
                    onComplete: () => { chessCareerSection.style.display = 'none'; }
                });
            }
        });
    }

    if (ingameProfileBtn && ingameProfilesSection) {
        ingameProfileBtn.addEventListener('click', () => {
            if (chessCareerSection) chessCareerSection.style.display = 'none';
            const isVisible = ingameProfilesSection.style.display === 'block';
            if (!isVisible) {
                ingameProfilesSection.style.display = 'block';
                gsap.fromTo(ingameProfilesSection,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
                );
                ingameProfilesSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                gsap.to(ingameProfilesSection, {
                    opacity: 0, y: 20, duration: 0.3, ease: 'power3.in',
                    onComplete: () => { ingameProfilesSection.style.display = 'none'; }
                });
            }
        });
    }

    // ============================================================
    // 7. PROJECT FILTER
    // ============================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards  = document.querySelectorAll('.project-card');
    let activeFilters   = ['all'];

    // Guarantee all cards are fully visible on fresh page load
    projectCards.forEach(card => {
        card.classList.remove('hidden');
        card.style.opacity = '1';
        card.style.display = '';
    });

    const updateProjects = () => {
        projectCards.forEach(card => {
            const tech    = card.getAttribute('data-tech').split(',');
            const showAll = activeFilters.includes('all') || activeFilters.length === 0;
            const matches = showAll || activeFilters.some(f => tech.includes(f));

            if (matches) {
                card.classList.remove('hidden');
                card.style.display = '';
                gsap.to(card, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
            } else {
                gsap.to(card, {
                    opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
                    onComplete: () => {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            }
        });
        applyMobileCollapse();
    };

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            if (filter === 'all') {
                activeFilters = ['all'];
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                activeFilters = activeFilters.filter(f => f !== 'all');
                filterButtons.forEach(b => {
                    if (b.getAttribute('data-filter') === 'all') b.classList.remove('active');
                });
                if (activeFilters.includes(filter)) {
                    activeFilters = activeFilters.filter(f => f !== filter);
                    btn.classList.remove('active');
                } else {
                    activeFilters.push(filter);
                    btn.classList.add('active');
                }
                if (activeFilters.length === 0) {
                    activeFilters = ['all'];
                    filterButtons.forEach(b => {
                        if (b.getAttribute('data-filter') === 'all') b.classList.add('active');
                    });
                }
            }
            updateProjects();
        });
    });

    // Run filter on load to establish correct initial state
    updateProjects();

    // ============================================================
    // 8. SHOW MORE / LESS (mobile project collapse)
    // ============================================================
    const MOBILE_SHOW  = 3;
    const projectsGrid = document.querySelector('.projects-grid');
    const showMoreBtn  = document.getElementById('show-more-btn');

    function applyMobileCollapse() {
        if (!projectsGrid || !showMoreBtn) return;
        const gridCards  = Array.from(projectsGrid.querySelectorAll('.project-card'));
        const isMobile   = window.innerWidth <= 768;
        const isExpanded = showMoreBtn.getAttribute('data-expanded') === 'true';

        if (isMobile) {
            const visibleCards = gridCards.filter(c => !c.classList.contains('hidden'));
            visibleCards.forEach((card, i) => {
                card.style.display = (!isExpanded && i >= MOBILE_SHOW) ? 'none' : '';
            });
            const hasMore = visibleCards.length > MOBILE_SHOW;
            showMoreBtn.style.display = hasMore ? 'flex' : 'none';
        } else {
            gridCards.forEach(card => {
                if (!card.classList.contains('hidden')) card.style.display = '';
            });
            showMoreBtn.style.display = 'none';
        }
    }

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            const isExpanded = showMoreBtn.getAttribute('data-expanded') === 'true';
            showMoreBtn.setAttribute('data-expanded', String(!isExpanded));
            showMoreBtn.innerHTML = !isExpanded
                ? '<i class="fas fa-chevron-up"></i> Show Less'
                : '<i class="fas fa-chevron-down"></i> Show More Projects';
            applyMobileCollapse();
        });
    }

    applyMobileCollapse();
    window.addEventListener('resize', applyMobileCollapse);

    // ============================================================
    // 9. EMAILJS CONTACT FORM
    // ============================================================
    emailjs.init('hBDKAmiJZfb8xdSSq');

    const contactForm  = document.getElementById('contactForm');
    const formMessage  = document.getElementById('formMessage');

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.form-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            emailjs.sendForm('service_pkftg5g', 'template_m32bbot', contactForm)
                .then(() => {
                    formMessage.textContent = 'Message sent! I will get back to you soon.';
                    formMessage.className = 'form-message success';
                    contactForm.reset();
                })
                .catch(() => {
                    formMessage.textContent = 'There was an error. Please try again later.';
                    formMessage.className = 'form-message error';
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                });
        });
    }

    // ============================================================
    // 10. MOBILE MENU
    // ============================================================
    const mobileMenuBtn   = document.querySelector('.mobile-menu-btn');
    const mobileMenu      = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu .nav-link');

    function closeMobileMenu() {
        if (!mobileMenu || !mobileMenuBtn) return;
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.querySelector('span:first-child').style.transform = 'none';
        mobileMenuBtn.querySelector('span:nth-child(2)').style.opacity  = '1';
        mobileMenuBtn.querySelector('span:last-child').style.transform  = 'none';
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open', isOpen);
            mobileMenuBtn.querySelector('span:first-child').style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none';
            mobileMenuBtn.querySelector('span:nth-child(2)').style.opacity  = isOpen ? '0' : '1';
            mobileMenuBtn.querySelector('span:last-child').style.transform  = isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
        });
    }

    mobileMenuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

    const mobileContactBtn = document.getElementById('open-contact-modal-mobile');
    if (mobileContactBtn) mobileContactBtn.addEventListener('click', closeMobileMenu);

});