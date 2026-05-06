// Force scroll to top on refresh/load
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Show loader a bit, but reduce delay on small screens for faster UX
        const mobileDelay = window.innerWidth <= 600 ? 700 : 3000;
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600); // fade-out duration
        }, mobileDelay);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar Effect (Optimized for performance)
    const header = document.querySelector('.header');
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon between bars and times (X)
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 3. Scroll Reveal Animation using Intersection Observer (Optimized)
    // Select all elements that should be animated on scroll
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -20px 0px" // Trigger slightly before it hits the bottom
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Extra Rame Interactions (tuned for performance & accessibility) ---
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1) Spawn tiny particles in hero area for visual 'rame' effect — disabled when user prefers reduced motion
    const heroArea = document.querySelector('.hero-clean') || document.querySelector('.hero');
    if (heroArea && !prefersReduced) {
        let activeParticles = 0;
        function spawnParticle(x, y) {
            if (activeParticles >= 6) return; // cap concurrent particles
            activeParticles++;
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = (x - 5) + 'px';
            p.style.top = (y - 5) + 'px';
            p.style.background = `hsl(${Math.random() * 40 + 300}, 80%, ${50 + Math.random()*8}%)`;
            heroArea.appendChild(p);
            p.addEventListener('animationend', () => {
                p.remove();
                activeParticles = Math.max(0, activeParticles - 1);
            }, { once: true });
        }

        // gentle continuous spawn at random positions (reduced frequency)
        const particleInterval = setInterval(() => {
            const rect = heroArea.getBoundingClientRect();
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height * 0.7 + 20;
            spawnParticle(x + rect.left, y + rect.top);
        }, 900);

        // parallax effect on mouse move (reduced magnitude)
        const heroImage = heroArea.querySelector('.hero-image-clean img') || heroArea.querySelector('.hero-image img');
        heroArea.addEventListener('mousemove', (e) => {
            if (!heroImage) return;
            const rect = heroArea.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            // smaller transform for comfort
            heroImage.style.transform = `translate(${px * 6}px, ${py * 5}px) rotate(${px * 1}deg)`;
        }, { passive: true });
        heroArea.addEventListener('mouseleave', () => {
            if (heroImage) heroImage.style.transform = '';
        });
    }

    // 2) Confetti effect when CTA is clicked — reduce count and respect reduced motion
    document.querySelectorAll('.btn-primary, .pulse-btn-rame').forEach(btn => {
        btn.classList.add('pulse-strong');
        btn.addEventListener('click', (e) => {
            if (prefersReduced) return; // do not show confetti
            const rect = btn.getBoundingClientRect();
            const pieces = 6; // reduced pieces
            for (let i = 0; i < pieces; i++) {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = (rect.left + Math.random() * rect.width) + 'px';
                c.style.top = (rect.top + Math.random() * rect.height) + 'px';
                c.style.background = `linear-gradient(45deg, hsl(${Math.random()*60+30},80%,60%), hsl(${Math.random()*40+300},80%,60%))`;
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 900 + Math.random() * 600);
            }
        });
    });

    // 5. Add staggered delay to feature, product cards, and testimonials
    const featureCards = document.querySelectorAll('.features-grid .feature-card-clean');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${(index % 4) * 0.1}s`;
    });

    const productCards = document.querySelectorAll('.products-grid-clean .product-item-clean');
    productCards.forEach((card, index) => {
        card.style.transitionDelay = `${(index % 3) * 0.1}s`;
    });

    const testimonialCards = document.querySelectorAll('.testimonial-grid .testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.transitionDelay = `${(index % 3) * 0.15}s`;
    });

    // 6. Comment Modal Logic
    const btnTulisUlasan = document.getElementById('btn-tulis-ulasan');
    const commentModal = document.getElementById('comment-modal');
    const closeModal = document.querySelector('.close-modal');
    const commentForm = document.getElementById('comment-form');
    const commentSuccess = document.getElementById('comment-success');
    const testimonialGrid = document.querySelector('.testimonial-grid');

    // Admin check
    const isAdmin = window.location.search.includes('admin=true');

    // Load comments from localStorage
    function loadComments() {
        const savedComments = JSON.parse(localStorage.getItem('userComments') || '[]');

        savedComments.forEach(comment => {
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                if (i < comment.rating) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }

            const newCard = document.createElement('div');
            newCard.className = 'testimonial-card reveal active';
            newCard.dataset.id = comment.id; // Save ID for deletion

            let deleteBtnHtml = '';
            if (isAdmin) {
                deleteBtnHtml = `<button class="btn-delete-comment" onclick="deleteComment('${comment.id}')" title="Hapus Ulasan"><i class="fas fa-trash"></i></button>`;
            }

            newCard.innerHTML = `
                <div class="testimonial-content">
                    <i class="fas fa-quote-left"></i>
                    <p>"${comment.text}"</p>
                </div>
                <div class="testimonial-author" style="position: relative;">
                    <div class="author-avatar">
                        <span>${comment.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="author-info">
                        <h4>${comment.name}</h4>
                        <p>Pelanggan</p>
                        <div class="rating">
                            ${starsHtml}
                        </div>
                    </div>
                    ${deleteBtnHtml}
                </div>
            `;

            if (testimonialGrid) {
                testimonialGrid.prepend(newCard);
            }
        });
    }

    // Initialize comments on load
    loadComments();

    // Make delete function global
    window.deleteComment = function (id) {
        if (confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
            let savedComments = JSON.parse(localStorage.getItem('userComments') || '[]');
            savedComments = savedComments.filter(c => c.id !== id);
            localStorage.setItem('userComments', JSON.stringify(savedComments));

            // Remove from DOM
            const card = document.querySelector(`.testimonial-card[data-id="${id}"]`);
            if (card) {
                card.remove();
            }
        }
    };

    if (btnTulisUlasan && commentModal) {
        // Check if already commented
        if (localStorage.getItem('hasCommented') && !isAdmin) {
            btnTulisUlasan.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Anda sudah memberikan ulasan';
            btnTulisUlasan.disabled = true;
            btnTulisUlasan.style.opacity = '0.7';
            btnTulisUlasan.style.cursor = 'not-allowed';
            btnTulisUlasan.style.backgroundColor = '#f0f0f0';
            btnTulisUlasan.style.color = '#888';
            btnTulisUlasan.style.borderColor = '#ddd';
        }

        // Open Modal
        btnTulisUlasan.addEventListener('click', () => {
            if (localStorage.getItem('hasCommented') && !isAdmin) return;

            commentModal.classList.add('show');
            commentForm.style.display = 'block';
            commentSuccess.style.display = 'none';
            commentForm.reset();

            // Reset stars
            document.querySelectorAll('.star-rating-input i').forEach(s => s.classList.add('active'));
            document.getElementById('comment-rating').value = 5;
        });

        // Close Modal
        closeModal.addEventListener('click', () => {
            commentModal.classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === commentModal) {
                commentModal.classList.remove('show');
            }
        });

        // Star Rating Logic
        const stars = document.querySelectorAll('.star-rating-input i');
        const ratingInput = document.getElementById('comment-rating');

        stars.forEach(star => {
            star.addEventListener('click', function () {
                const rating = this.getAttribute('data-rating');
                ratingInput.value = rating;

                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-rating')) <= parseInt(rating)) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });

        // Form Submit Simulation
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate network request
            const submitBtn = commentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Mengirim...';
            submitBtn.disabled = true;

            const nameInput = document.getElementById('comment-name').value;
            const textInput = document.getElementById('comment-text').value;
            const ratingInput = document.getElementById('comment-rating').value;

            setTimeout(() => {
                commentForm.style.display = 'none';
                commentSuccess.style.display = 'block';
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;

                // Save to localStorage
                const newComment = {
                    id: 'comment_' + Date.now(),
                    name: nameInput,
                    text: textInput,
                    rating: ratingInput,
                    date: new Date().toISOString()
                };

                const savedComments = JSON.parse(localStorage.getItem('userComments') || '[]');
                savedComments.push(newComment);
                localStorage.setItem('userComments', JSON.stringify(savedComments));

                // Mark user as commented
                if (!isAdmin) {
                    localStorage.setItem('hasCommented', 'true');
                    btnTulisUlasan.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Anda sudah memberikan ulasan';
                    btnTulisUlasan.disabled = true;
                    btnTulisUlasan.style.opacity = '0.7';
                    btnTulisUlasan.style.cursor = 'not-allowed';
                    btnTulisUlasan.style.backgroundColor = '#f0f0f0';
                    btnTulisUlasan.style.color = '#888';
                    btnTulisUlasan.style.borderColor = '#ddd';
                }

                // Add new testimonial to grid
                if (testimonialGrid) {
                    let starsHtml = '';
                    for (let i = 0; i < 5; i++) {
                        if (i < ratingInput) {
                            starsHtml += '<i class="fas fa-star"></i>';
                        } else {
                            starsHtml += '<i class="far fa-star"></i>';
                        }
                    }

                    let deleteBtnHtml = '';
                    if (isAdmin) {
                        deleteBtnHtml = `<button class="btn-delete-comment" onclick="deleteComment('${newComment.id}')" title="Hapus Ulasan"><i class="fas fa-trash"></i></button>`;
                    }

                    const newCard = document.createElement('div');
                    newCard.className = 'testimonial-card reveal active';
                    newCard.dataset.id = newComment.id;
                    newCard.innerHTML = `
                        <div class="testimonial-content">
                            <i class="fas fa-quote-left"></i>
                            <p>"${textInput}"</p>
                        </div>
                        <div class="testimonial-author" style="position: relative;">
                            <div class="author-avatar">
                                <span>${nameInput.charAt(0).toUpperCase()}</span>
                            </div>
                            <div class="author-info">
                                <h4>${nameInput}</h4>
                                <p>Pelanggan</p>
                                <div class="rating">
                                    ${starsHtml}
                                </div>
                            </div>
                            ${deleteBtnHtml}
                        </div>
                    `;

                    testimonialGrid.prepend(newCard); // Insert at the beginning
                }

                // Close modal automatically after 3 seconds
                setTimeout(() => {
                    commentModal.classList.remove('show');
                }, 3000);
            }, 1000);
        });
    }

    // 7. Product Slider Logic
    const sliderContainer = document.getElementById('products-slider');
    const btnPrev = document.getElementById('btn-prev-product');
    const btnNext = document.getElementById('btn-next-product');

    // Run slider logic if slider exists. Buttons are optional.
    if (sliderContainer) {
        const scrollAmount = 355; // width of card (320px) + gap (35px)
        
        // Clone items for seamless loop
        const originalItems = [...sliderContainer.children];
        // Append 2 extra sets to guarantee enough width for seamless scrolling
        for (let i = 0; i < 2; i++) {
            originalItems.forEach(item => {
                const clone = item.cloneNode(true);
                sliderContainer.appendChild(clone);
            });
        }

        let isInteracting = false;
        
        // Continuous smooth scroll
        let currentScrollPos = sliderContainer.scrollLeft;
        
        function autoScroll() {
            if (!isInteracting) {
                currentScrollPos += 2; // Speed multiplier (2 is twice as fast as before)
                sliderContainer.scrollLeft = currentScrollPos;
                
                // If we've scrolled past one full original set, loop back seamlessly
                const singleSetWidth = originalItems.length * scrollAmount;
                if (currentScrollPos >= singleSetWidth) {
                    currentScrollPos -= singleSetWidth;
                    sliderContainer.scrollLeft = currentScrollPos;
                }
            } else {
                // Keep variable synced if user manually scrolls/clicks
                currentScrollPos = sliderContainer.scrollLeft;
            }
            requestAnimationFrame(autoScroll);
        }
        requestAnimationFrame(autoScroll);

        // Do not pause on mouse hover — keep continuous scrolling when cursor is over the area.
        // Keep touch handlers so mobile users can still interact.
        sliderContainer.addEventListener('touchstart', () => isInteracting = true);
        sliderContainer.addEventListener('touchend', () => isInteracting = false);

        // Attach click handlers only if buttons exist
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                sliderContainer.style.scrollBehavior = 'smooth';
                sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                setTimeout(() => sliderContainer.style.scrollBehavior = 'auto', 400);
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                sliderContainer.style.scrollBehavior = 'smooth';
                sliderContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                setTimeout(() => sliderContainer.style.scrollBehavior = 'auto', 400);
            });
        }
    }
});
