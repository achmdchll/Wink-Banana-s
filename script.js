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

    const progressBar = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                
                // Header Scrolled State
                if (scrollTop > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Scroll Progress Bar
                if (progressBar) {
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = (winScroll / height) * 100;
                    progressBar.style.width = scrolled + "%";
                }

                // ScrollSpy - Active Nav Link
                let currentSection = "";
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.clientHeight;
                    if (scrollTop >= sectionTop) {
                        currentSection = section.getAttribute("id");
                    }
                });

                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('active');
                    }
                });

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

    // 4. Smooth Scrolling for Anchor Links & Click Animations
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Click Animation Feedback
                this.classList.add('clicked');
                setTimeout(() => this.classList.remove('clicked'), 400);

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

    // 7. Product Slider Logic (Manual Scroll Only)
    const sliderContainer = document.getElementById('products-slider');
    const btnPrev = document.getElementById('btn-prev-product');
    const btnNext = document.getElementById('btn-next-product');

    // Run slider logic if slider exists. Buttons are optional.
    if (sliderContainer) {
        const scrollAmount = 355; // width of card (320px) + gap (35px)
        const productItems = sliderContainer.querySelectorAll('.product-item-clean');
        
        // Enable smooth scrolling
        sliderContainer.style.scrollBehavior = 'smooth';
        // Add perspective for 3D effect
        sliderContainer.style.perspective = '1000px';

        let lastScrollLeft = 0;
        let scrollDirection = 'right'; // 'right' or 'left'

        // Function to apply sophisticated animation based on visibility and direction
        function updateProductVisibility() {
            const scrollLeft = sliderContainer.scrollLeft;
            const containerWidth = sliderContainer.clientWidth;
            const containerCenter = scrollLeft + containerWidth / 2;
            
            // Determine scroll direction
            if (scrollLeft > lastScrollLeft) {
                scrollDirection = 'right';
            } else if (scrollLeft < lastScrollLeft) {
                scrollDirection = 'left';
            }
            lastScrollLeft = scrollLeft;
            
            productItems.forEach((item, index) => {
                const itemLeft = item.offsetLeft;
                const itemWidth = item.offsetWidth;
                const itemCenter = itemLeft + itemWidth / 2;
                const itemRight = itemLeft + itemWidth;
                
                // Remove all animation classes
                item.classList.remove('fade-in-right', 'fade-out-left', 'fade-in-left', 'fade-out-right', 'scale-down', 'scale-up', 'active');
                
                // Calculate distance from center (for parallax effect)
                const distanceFromCenter = Math.abs(itemCenter - containerCenter);
                const maxDistance = containerWidth;
                const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
                
                // Check if item is completely in viewport
                const isFullyVisible = (itemRight > scrollLeft + 50) && (itemLeft < scrollLeft + containerWidth - 50);
                
                // Check if item is partially visible
                const isPartiallyVisible = (itemRight > scrollLeft) && (itemLeft < scrollLeft + containerWidth);
                
                // Check if item is to the right or left
                const isToTheRight = itemLeft >= scrollLeft + containerWidth;
                const isToTheLeft = itemRight <= scrollLeft;
                
                if (isFullyVisible) {
                    // Item is fully visible - apply scale up and active
                    item.classList.add('scale-up', 'active');
                    item.style.opacity = '1';
                } else if (isPartiallyVisible) {
                    // Item is partially visible - apply scale down
                    item.classList.add('scale-down');
                } else if (isToTheRight) {
                    // Item is to the right
                    if (scrollDirection === 'right') {
                        item.classList.add('fade-in-right');
                    } else {
                        item.classList.add('fade-in-left');
                    }
                } else if (isToTheLeft) {
                    // Item is to the left
                    if (scrollDirection === 'right') {
                        item.classList.add('fade-out-left');
                    } else {
                        item.classList.add('fade-out-right');
                    }
                }
            });
        }

        // Attach click handlers only if buttons exist
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                // Add click feedback
                btnNext.style.filter = 'brightness(0.8)';
                setTimeout(() => {
                    btnNext.style.filter = 'brightness(1)';
                }, 150);
                
                lastScrollLeft = sliderContainer.scrollLeft;
                sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                
                // Update visibility with slight delay for smooth effect
                setTimeout(() => updateProductVisibility(), 100);
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                // Add click feedback
                btnPrev.style.filter = 'brightness(0.8)';
                setTimeout(() => {
                    btnPrev.style.filter = 'brightness(1)';
                }, 150);
                
                lastScrollLeft = sliderContainer.scrollLeft;
                sliderContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                
                // Update visibility with slight delay for smooth effect
                setTimeout(() => updateProductVisibility(), 100);
            });
        }

        // Add scroll event listener for real-time animation
        let scrollTimeout;
        sliderContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            updateProductVisibility();
            
            scrollTimeout = setTimeout(() => {
                updateProductVisibility();
            }, 50);
        }, { passive: true });
        
        // Initial visibility update
        updateProductVisibility();
    }

    // 8. Translation Logic
    const translations = {
        id: {
            "nav-beranda": "Beranda",
            "nav-keunggulan": "Keunggulan",
            "nav-produk": "Produk",
            "nav-tentang": "Tentang",
            "nav-lokasi": "Lokasi",
            "loader-subtitle": "Sedang Menyiapkan...",
            "hero-title": 'Sensasi <span class="highlight-clean">Renyah</span><br>di Setiap Gigitan!',
            "hero-desc": "Nikmati kelezatan keripik pisang asli pilihan dengan perpaduan bumbu rahasia yang bikin nagih. Tersedia berbagai rasa favoritmu.",
            "hero-btn": "Lihat Produk",
            "features-subtitle": "Keunggulan Kami",
            "features-title": "Mengapa Memilih Wink Banana's?",
            "features-desc": "Kami menyajikan keripik pisang dengan kualitas terbaik: bahan pilihan, proses higienis, dan rasa yang konsisten. Cocok untuk cemilan sehari-hari maupun oleh-oleh spesial.",
            "feature-1-title": "100% Organik",
            "feature-1-desc": "Bahan alami tanpa campuran bahan kimia.",
            "feature-2-title": "Tanpa Pengawet",
            "feature-2-desc": "Aman dikonsumsi setiap hari untuk keluarga.",
            "feature-3-title": "Minyak Kelapa",
            "feature-3-desc": "Digoreng menggunakan minyak kelapa premium.",
            "feature-4-title": "Kemasan Praktis",
            "feature-4-desc": "Dilengkapi zip-lock menjaga kerenyahan.",
            "feature-5-title": "Varian Rasa",
            "feature-5-desc": "Banyak pilihan rasa favorit yang lezat.",
            "feature-6-title": "Renyah & Gurih",
            "feature-6-desc": "Tekstur sempurna di setiap kepingannya.",
            "feature-7-title": "Harga Terjangkau",
            "feature-7-desc": "Kualitas premium dengan harga pas di kantong.",
            "feature-8-title": "Kualitas Premium",
            "feature-8-desc": "Diproses dengan standar higienis tinggi.",
            "products-subtitle": "Koleksi Eksklusif",
            "products-title": "Varian Rasa Premium Kami",
            "product-1-title": "Manis Gurih (Original)",
            "product-1-desc": "Rasa asli pisang berpadu dengan sedikit rasa gurih. Sederhana namun bikin kangen.",
            "product-2-title": "Cokelat Lumer",
            "product-2-desc": "Balutan bubuk cokelat premium tebal yang lumer di mulut. Favorit anak muda!",
            "product-3-title": "Matcha Greentea",
            "product-3-desc": "Balutan bubuk teh hijau matcha asli Jepang yang harum dan lumer merata di setiap gigitan.",
            "product-4-title": "Tiramisu Delight",
            "product-4-desc": "Perpaduan rasa kopi espresso dan krim lembut khas Italia yang membangkitkan selera.",
            "product-5-title": "Sweet Taro",
            "product-5-desc": "Rasa ubi ungu taro manis dan creamy yang sangat populer, cocok untuk teman bersantai.",
            "about-subtitle": "Tentang Wink Banana's",
            "about-title": "Camilan Tradisional dengan Sentuhan Modern & Premium.",
            "about-desc-1": "Wink Banana's bermula dari resep keluarga turun-temurun yang kami kembangkan agar bisa dinikmati oleh semua kalangan. Kami hanya menggunakan pisang kepok berkualitas tinggi yang dipanen langsung dari petani lokal pilihan.",
            "about-desc-2": "Diproses dengan standar higienis tinggi dan digoreng menggunakan minyak kelapa premium, memastikan setiap keping keripik memiliki tekstur yang renyah sempurna tanpa rasa berminyak berlebih.",
            "location-subtitle": "Kunjungi Kami",
            "location-title": "Lokasi Toko",
            "location-desc": "Temukan lokasi toko Wink Banana's terdekat dan nikmati keripik pisang favoritmu langsung.",
            "footer-tagline": "Keripik Pisang Premium",
            "footer-desc": "Camilan keripik pisang premium nomor 1 di kotamu. Hadir menemani setiap momen bahagiamu bersama keluarga dan teman tercinta.",
            "footer-links-title": "Tautan Cepat",
            "footer-contact-title": "Hubungi Kami",
            "footer-address-label": "Alamat",
            "footer-address-value": "Jl. Bunder Jetis, Curahdami<br>Bondowoso, Jawa Timur",
            "footer-phone-label": "Telepon",
            "footer-copy": "&copy; 2026 Wink Banana's. Dibuat dengan cinta untuk Indonesia."
        },
        en: {
            "nav-beranda": "Home",
            "nav-keunggulan": "Features",
            "nav-produk": "Products",
            "nav-tentang": "About",
            "nav-lokasi": "Location",
            "loader-subtitle": "Preparing...",
            "hero-title": 'Sensational <span class="highlight-clean">Crunchiness</span><br>in Every Bite!',
            "hero-desc": "Enjoy the deliciousness of selected original banana chips with a addictive secret spice blend. Various favorite flavors available.",
            "hero-btn": "View Products",
            "features-subtitle": "Our Advantages",
            "features-title": "Why Choose Wink Banana's?",
            "features-desc": "We serve banana chips with the best quality: selected ingredients, hygienic process, and consistent taste. Perfect for daily snacks or special gifts.",
            "feature-1-title": "100% Organic",
            "feature-1-desc": "Natural ingredients without chemical additives.",
            "feature-2-title": "No Preservatives",
            "feature-2-desc": "Safe for daily consumption for the whole family.",
            "feature-3-title": "Coconut Oil",
            "feature-3-desc": "Fried using premium coconut oil.",
            "feature-4-title": "Practical Packaging",
            "feature-4-desc": "Equipped with zip-lock to maintain crunchiness.",
            "feature-5-title": "Flavor Variants",
            "feature-5-desc": "Many delicious favorite flavor choices.",
            "feature-6-title": "Crunchy & Savory",
            "feature-6-desc": "Perfect texture in every single piece.",
            "feature-7-title": "Affordable Price",
            "feature-7-desc": "Premium quality with a price that fits your pocket.",
            "feature-8-title": "Premium Quality",
            "feature-8-desc": "Processed with high hygienic standards.",
            "products-subtitle": "Exclusive Collection",
            "products-title": "Our Premium Flavor Variants",
            "product-1-title": "Sweet & Savory (Original)",
            "product-1-desc": "The original taste of banana combined with a touch of savory. Simple yet addictive.",
            "product-2-title": "Melting Chocolate",
            "product-2-desc": "Coated with thick premium chocolate powder that melts in your mouth. Youth's favorite!",
            "product-3-title": "Matcha Greentea",
            "product-3-desc": "Coated with original Japanese matcha green tea powder that is fragrant and melts evenly in every bite.",
            "product-4-title": "Tiramisu Delight",
            "product-4-desc": "A blend of espresso coffee and typical Italian soft cream flavor that awakens the appetite.",
            "product-5-title": "Sweet Taro",
            "product-5-desc": "Sweet and creamy purple taro flavor that is very popular, perfect for relaxing.",
            "about-subtitle": "About Wink Banana's",
            "about-title": "Traditional Snack with a Modern & Premium Touch.",
            "about-desc-1": "Wink Banana's started from a hereditary family recipe that we developed so it can be enjoyed by everyone. We only use high-quality Kepok bananas harvested directly from selected local farmers.",
            "about-desc-2": "Processed with high hygienic standards and fried using premium coconut oil, ensuring every chip has a perfect crunchy texture without excess oiliness.",
            "location-subtitle": "Visit Us",
            "location-title": "Store Location",
            "location-desc": "Find the nearest Wink Banana's store location and enjoy your favorite banana chips directly.",
            "footer-tagline": "Premium Banana Chips",
            "footer-desc": "The number 1 premium banana chips snack in your city. Here to accompany every happy moment with your beloved family and friends.",
            "footer-links-title": "Quick Links",
            "footer-contact-title": "Contact Us",
            "footer-address-label": "Address",
            "footer-address-value": "Jl. Bunder Jetis, Curahdami<br>Bondowoso, East Java",
            "footer-phone-label": "Phone",
            "footer-copy": "&copy; 2026 Wink Banana's. Made with love for Indonesia."
        }
    };

    const langBtns = document.querySelectorAll('.lang-btn');
    const i18nElements = document.querySelectorAll('[data-i18n]');

    function setLanguage(lang) {
        // Update active button
        langBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content
        i18nElements.forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Update html lang attribute
        document.documentElement.lang = lang;
        
        // Save preference
        localStorage.setItem('preferredLang', lang);
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });

    // Load saved language or default to ID
    const savedLang = localStorage.getItem('preferredLang') || 'id';
    setLanguage(savedLang);
});
