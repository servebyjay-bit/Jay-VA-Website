// SCROLL REVEAL

const reveals = document.querySelectorAll(".reveal");

// Reads (getBoundingClientRect) and writes (classList.add) are batched
// into two separate passes instead of interleaved per-section — reading
// layout right after writing it forces a synchronous reflow on every
// iteration, so all measurements happen first, then all DOM writes.
function revealSections() {
    const triggerPoint = window.innerHeight * 0.85;
    const toActivate = [];

    reveals.forEach(section => {
        if (section.getBoundingClientRect().top < triggerPoint) {
            toActivate.push(section);
        }
    });

    toActivate.forEach(section => section.classList.add("active"));
}

// HEADER SCROLL STATE

const header = document.querySelector(".header");

function toggleHeaderScrolled() {
    if (window.scrollY > 20) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}

// MOBILE NAV (HAMBURGER)

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

function setMenuOpen(open) {
    hamburger.classList.toggle("active", open);
    navLinks.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
}

hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.contains("active");
    setMenuOpen(!isOpen);
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => setMenuOpen(false));
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
        setMenuOpen(false);
    }
});

// PORTFOLIO SERVICE TOGGLES

document.querySelectorAll(".service-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");

        const label = btn.querySelector("span:first-child");
        if (label) {
            label.textContent = isOpen ? "View Featured Works" : "Hide Featured Works";
        }
    });
});

// RESULTS COUNTER

const resultsSection = document.querySelector(".results");
let resultsAnimated = false;

function animateCounters() {
    if (!resultsSection || resultsAnimated) return;

    const top = resultsSection.getBoundingClientRect().top;
    const trigger = window.innerHeight * 0.8;

    if (top < trigger) {
        resultsAnimated = true;

        document.querySelectorAll(".counter").forEach(counter => {
            const target = parseInt(counter.dataset.target, 10);
            const suffix = counter.dataset.suffix || "+";
            let current = 0;
            const increment = Math.ceil(target / 100);

            const update = () => {
                current += increment;

                if (current >= target) {
                    current = target;
                }

                if (target >= 1000) {
                    counter.textContent = (current / 1000).toFixed(0) + "K" + suffix;
                } else {
                    counter.textContent = current + suffix;
                }

                if (current < target) {
                    requestAnimationFrame(update);
                }
            };

            update();
        });
    }
}

// SCROLL PERFORMANCE
// All three scroll-driven functions above (revealSections, toggleHeaderScrolled,
// animateCounters) are batched into a single rAF-throttled, passive scroll
// listener instead of three independent unthrottled ones — this keeps scrolling
// smooth by doing at most one layout read/paint pass per animation frame.

let scrollTicking = false;

function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
        revealSections();
        toggleHeaderScrolled();
        animateCounters();
        toggleFloatingCta();
        scrollTicking = false;
    });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll);

// FLOATING CTA
// Hidden until the visitor scrolls roughly halfway into the Portfolio
// section, then stays visible for the rest of the page (hides again if
// they scroll back above that point). Folded into the existing rAF
// scroll loop below rather than a separate listener.

const floatingCta = document.querySelector(".floating-cta");
const portfolioSection = document.getElementById("portfolio");

function toggleFloatingCta() {
    if (!floatingCta || !portfolioSection) return;

    const portfolioTop = portfolioSection.getBoundingClientRect().top + window.scrollY;
    const shouldShow = window.scrollY >= portfolioTop - window.innerHeight * 0.5;

    floatingCta.classList.toggle("is-visible", shouldShow);
}

// Hide any tool icon that fails to load instead of showing a broken-image glyph
document.querySelectorAll(".tool-card img").forEach(img => {
    img.addEventListener("error", () => {
        img.style.display = "none";
    });
});

// ==========================================
// PHOTO LIGHTBOX
// ==========================================

(function () {
    const lightbox = document.getElementById('photo-lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.photo-lightbox-img');
    const closeBtn = lightbox.querySelector('.photo-lightbox-close');
    let lastFocused = null;

    function openLightbox(imgEl) {
        lastFocused = document.activeElement;
        lightboxImg.src = imgEl.src;
        lightboxImg.alt = imgEl.alt || '';
        lightbox.classList.add('is-active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightboxImg.src = '';
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.photo-card').forEach((card) => {
        const img = card.querySelector('img');
        const zoomBtn = card.querySelector('.photo-zoom-btn');

        card.addEventListener('click', () => openLightbox(img));
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(img);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) closeLightbox();
    });
})();

// ==========================================
// CONTACT FORM + SUCCESS MODAL
// ==========================================

(function () {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".form-submit");
    const successModal = document.getElementById("successModal");
    const closeSuccess = document.getElementById("closeSuccess");

    let lastFocusedBeforeModal = null;

    // REQUIRED-FIELD GATING
    // "Send Message" stays disabled until First Name, Last Name, Email,
    // and Message all have valid values. Phone Number has no "required"
    // attribute, so it never factors into checkValidity() here.
    function updateSubmitState() {
        if (!contactForm || !submitBtn) return;
        submitBtn.disabled = !contactForm.checkValidity();
    }

    if (contactForm && submitBtn) {
        contactForm.querySelectorAll("[required]").forEach(field => {
            field.addEventListener("input", updateSubmitState);
            field.addEventListener("blur", updateSubmitState);
        });

        updateSubmitState();
    }

    function openSuccessModal() {
        if (!successModal) return;
        lastFocusedBeforeModal = document.activeElement;
        successModal.classList.add("show");
        successModal.setAttribute("aria-hidden", "false");
        if (closeSuccess) closeSuccess.focus();
    }

    function closeSuccessModal() {
        if (!successModal) return;
        successModal.classList.remove("show");
        successModal.setAttribute("aria-hidden", "true");
        if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
    }

    if (contactForm && submitBtn) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            submitBtn.classList.add("loading");
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { Accept: "application/json" }
                });

                if (response.ok) {
                    contactForm.reset();
                    openSuccessModal();
                } else {
                    alert("Something went wrong. Please try again.");
                }
            } catch {
                alert("Unable to send your message.");
            }

            submitBtn.classList.remove("loading");
            updateSubmitState();
        });
    }

    if (successModal && closeSuccess) {
        closeSuccess.addEventListener("click", closeSuccessModal);

        successModal.addEventListener("click", (e) => {
            if (e.target === successModal) closeSuccessModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && successModal.classList.contains("show")) {
                closeSuccessModal();
            }
        });
    }
})();