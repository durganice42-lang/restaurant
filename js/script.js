/* ==========================================================================
   MAISON DE LA DOUCEUR — LUXURY BAKERY JAVASCRIPT
   GSAP Animations, 3D Canvas Petals, Lightbox, Slider, Cart & Interactive UX
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. INITIALIZE & REGISTER GSAP PLUGINS
    // ----------------------------------------------------------------------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initGSAPAnimations();
    } else {
        console.warn('GSAP or ScrollTrigger CDN failed to load properly.');
    }

    // Refresh ScrollTrigger after all images load
    window.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });

    // ----------------------------------------------------------------------
    // 2. STICKY HEADER & MOBILE NAV TOGGLE
    // ----------------------------------------------------------------------
    const header = document.getElementById('header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Header Observer
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    hamburgerBtn?.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const targetNavLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                targetNavLink?.classList.add('active');
            } else {
                targetNavLink?.classList.remove('active');
            }
        });
    });

    // ----------------------------------------------------------------------
    // 3. CURSOR-RESPONSIVE 3D TILT ON HERO DESSERT IMAGE
    // ----------------------------------------------------------------------
    const heroCard = document.getElementById('hero-3d-card');
    const heroSection = document.getElementById('hero');
    const shineOverlay = document.getElementById('shine-overlay');

    if (heroCard && heroSection && window.innerWidth > 992) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroCard.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;

            // Calculate rotation angles (max 12 deg tilt)
            const rotateX = (-mouseY / (rect.height / 2)) * 12;
            const rotateY = (mouseX / (rect.width / 2)) * 12;

            gsap.to(heroCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out"
            });

            if (shineOverlay) {
                const shineX = 50 + (rotateY * 2);
                const shineY = 50 - (rotateX * 2);
                shineOverlay.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`;
            }
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to(heroCard, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });
            if (shineOverlay) {
                shineOverlay.style.background = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`;
            }
        });
    }

    // ----------------------------------------------------------------------
    // 4. FLOATING PETALS ANIMATION CANVAS
    // ----------------------------------------------------------------------
    initPetalsCanvas();

    // Image Error Failsafe Handler
    const svgFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'%3E%3Crect width='600' height='450' fill='%23f5ece1'/%3E%3Ccircle cx='300' cy='200' r='60' fill='%23f4c4cd'/%3E%3Cpath d='M300 160 C280 130 240 150 260 190 C280 230 300 250 300 250 C300 250 320 230 340 190 C360 150 320 130 300 160 Z' fill='%23c87d85'/%3E%3Ctext x='300' y='320' font-family='Georgia, serif' font-size='22' fill='%236e846c' text-anchor='middle'%3EMaison de la Douceur%3C/text%3E%3Ctext x='300' y='350' font-family='sans-serif' font-size='14' fill='%23a8525b' text-anchor='middle'%3EArtisan Pâtisserie%3C/text%3E%3C/svg%3E";
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (this.src !== svgFallback) {
                this.src = svgFallback;
            }
        });
    });

    // ----------------------------------------------------------------------
    // 5. DESSERT GALLERY LIGHTBOX MODAL
    // ----------------------------------------------------------------------
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    function openLightbox(fullImgUrl, title, desc) {
        lightboxImg.src = fullImgUrl;
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const fullUrl = item.getAttribute('data-full');
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');
            openLightbox(fullUrl, title, desc);
        });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxBackdrop?.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ----------------------------------------------------------------------
    // 6. TESTIMONIAL SLIDER
    // ----------------------------------------------------------------------
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    let currentSlide = 0;
    let sliderTimer = null;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    function nextSlide() {
        let nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    function prevSlide() {
        let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        resetSliderTimer();
    });

    nextBtn?.addEventListener('click', () => {
        nextSlide();
        resetSliderTimer();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showSlide(index);
            resetSliderTimer();
        });
    });

    function startSliderTimer() {
        sliderTimer = setInterval(nextSlide, 5000);
    }

    function resetSliderTimer() {
        clearInterval(sliderTimer);
        startSliderTimer();
    }

    if (slides.length > 0) {
        startSliderTimer();
    }

    // ----------------------------------------------------------------------
    // 7. SHOPPING CART DRAWER & ORDER INTERACTION
    // ----------------------------------------------------------------------
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalPriceEl = document.getElementById('cart-total-price');

    let cartState = [
        { name: "Signature Pancakes", price: 16.50 },
        { name: "Creamy Cheesecakes", price: 14.00 }
    ];

    function updateCartUI() {
        cartCountEl.textContent = cartState.length;
        cartItemsContainer.innerHTML = '';

        if (cartState.length === 0) {
            cartItemsContainer.innerHTML = `<p style="text-align:center; color:#888; margin-top:2rem;">Your sweet bag is empty.</p>`;
            cartTotalPriceEl.textContent = '$0.00';
            return;
        }

        let total = 0;
        cartState.forEach((item, index) => {
            total += item.price;
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item';
            itemRow.innerHTML = `
                <div>
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button style="color:#c87d85; font-size:1.2rem;" onclick="removeCartItem(${index})" aria-label="Remove item">&times;</button>
            `;
            cartItemsContainer.appendChild(itemRow);
        });

        cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
    }

    window.removeCartItem = function(index) {
        cartState.splice(index, 1);
        updateCartUI();
    };

    function addToCart(name, price) {
        cartState.push({ name: name, price: parseFloat(price) });
        updateCartUI();
        cartModal.classList.add('active');
        
        // Bounce cart button
        gsap.fromTo(cartBtn, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    }

    cartBtn?.addEventListener('click', () => cartModal.classList.add('active'));
    cartClose?.addEventListener('click', () => cartModal.classList.remove('active'));
    cartBackdrop?.addEventListener('click', () => cartModal.classList.remove('active'));

    document.querySelectorAll('.btn-discover, .btn-treat-order').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            if (name && price) {
                addToCart(name, price);
            }
        });
    });

    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        alert('Thank you for choosing Maison de la Douceur! Your order has been placed successfully.');
        cartState = [];
        updateCartUI();
        cartModal.classList.remove('active');
    });

    updateCartUI();

    // ----------------------------------------------------------------------
    // 8. NEWSLETTER FORM VALIDATION
    // ----------------------------------------------------------------------
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const formFeedback = document.getElementById('form-feedback');

    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailValue = newsletterEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
            formFeedback.textContent = "Please enter a valid email address.";
            formFeedback.className = "form-feedback error";
        } else {
            formFeedback.textContent = "Welcome to our Sweet Circle! Check your inbox for your welcome voucher.";
            formFeedback.className = "form-feedback success";
            newsletterEmail.value = '';
        }
    });
});

// --------------------------------------------------------------------------
// 9. GSAP ANIMATION SYSTEM IMPLEMENTATION
// --------------------------------------------------------------------------
function initGSAPAnimations() {
    // Hero Entrance Timeline
    const heroTl = gsap.timeline({ 
        defaults: { ease: "power3.out", duration: 1 },
        onComplete: () => {
            gsap.set('.gsap-hero-element, .gsap-hero-image, .floral-corner', { clearProps: "transform,opacity" });
        }
    });

    heroTl.from('.gsap-hero-element', {
        y: 40,
        opacity: 0,
        stagger: 0.18,
        delay: 0.2
    })
    .from('.gsap-hero-image', {
        scale: 0.82,
        opacity: 0,
        rotation: -4,
        duration: 1.2,
        ease: "back.out(1.4)"
    }, "-=0.8")
    .from('.floral-corner', {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        stagger: 0.2
    }, "-=1.0");

    // ScrollTrigger MatchMedia for Desktop vs Mobile
    ScrollTrigger.matchMedia({
        // Desktop & Tablet Animations
        "(min-width: 769px)": function() {
            // Reveal Section Headers
            gsap.utils.toArray('.gsap-reveal').forEach(el => {
                gsap.fromTo(el, 
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 88%",
                            once: true
                        },
                        onComplete: () => gsap.set(el, { clearProps: "transform,opacity" })
                    }
                );
            });

            // Signature Cards Stagger Reveal
            const cards = gsap.utils.toArray('.gsap-card');
            if (cards.length > 0) {
                gsap.fromTo(cards,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.15,
                        duration: 0.9,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: '.signature-grid',
                            start: "top 85%",
                            once: true
                        },
                        onComplete: () => gsap.set(cards, { clearProps: "transform,opacity" })
                    }
                );
            }

            // Special Treats Stagger Reveal
            const treatCards = gsap.utils.toArray('.gsap-treat-card');
            treatCards.forEach((card, index) => {
                gsap.fromTo(card,
                    { x: index % 2 === 0 ? -50 : 50, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 88%",
                            once: true
                        },
                        onComplete: () => gsap.set(card, { clearProps: "transform,opacity" })
                    }
                );
            });

            // Gallery Items Reveal
            const galleryItems = gsap.utils.toArray('.gsap-gallery-item');
            if (galleryItems.length > 0) {
                gsap.fromTo(galleryItems,
                    { scale: 0.88, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        stagger: 0.1,
                        duration: 0.8,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: '.gallery-grid',
                            start: "top 85%",
                            once: true
                        },
                        onComplete: () => gsap.set(galleryItems, { clearProps: "transform,opacity,scale" })
                    }
                );
            }

            // Story Split Reveal
            const storyLeft = document.querySelector('.gsap-reveal-left');
            const storyRight = document.querySelector('.gsap-reveal-right');
            if (storyLeft) {
                gsap.fromTo(storyLeft,
                    { x: -50, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: { trigger: '.story-grid', start: "top 80%", once: true },
                        onComplete: () => gsap.set(storyLeft, { clearProps: "transform,opacity" })
                    }
                );
            }
            if (storyRight) {
                gsap.fromTo(storyRight,
                    { x: 50, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: { trigger: '.story-grid', start: "top 80%", once: true },
                        onComplete: () => gsap.set(storyRight, { clearProps: "transform,opacity" })
                    }
                );
            }
        },

        // Mobile Optimized Animations
        "(max-width: 768px)": function() {
            gsap.utils.toArray('.gsap-reveal, .gsap-card, .gsap-treat-card, .gsap-gallery-item, .gsap-reveal-left, .gsap-reveal-right').forEach(el => {
                gsap.fromTo(el,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        ease: "power2.out",
                        scrollTrigger: { trigger: el, start: "top 92%", once: true },
                        onComplete: () => gsap.set(el, { clearProps: "transform,opacity" })
                    }
                );
            });
        }
    });
}

// --------------------------------------------------------------------------
// 10. REALISTIC ROSE PETALS CANVAS ANIMATION
// --------------------------------------------------------------------------
function initPetalsCanvas() {
    const canvas = document.getElementById('petals-canvas');
    if (!canvas) return;

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const petals = [];
    const petalCount = window.innerWidth < 768 ? 12 : 25;

    class Petal {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height;
            this.size = Math.random() * 12 + 10;
            this.speedY = Math.random() * 1.2 + 0.6;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.color = Math.random() > 0.5 ? '#f4b6c2' : '#f7c5d0';
        }

        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.y * 0.01) * 0.8 + this.speedX;
            this.rotation += this.rotationSpeed;

            if (this.y > height + 20) {
                this.reset();
                this.y = -20;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
            ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }

    function animatePetals() {
        ctx.clearRect(0, 0, width, height);
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        requestAnimationFrame(animatePetals);
    }

    animatePetals();
}
