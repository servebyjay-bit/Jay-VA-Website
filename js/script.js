// SCROLL REVEAL

const reveals = document.querySelectorAll(".reveal");

function revealSections() {
    reveals.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight * 0.85;

        if (sectionTop < triggerPoint) {
            section.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealSections);
window.addEventListener("load", revealSections);

// HEADER SCROLL STATE

const header = document.querySelector(".header");

function toggleHeaderScrolled() {
    if (window.scrollY > 20) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}

window.addEventListener("scroll", toggleHeaderScrolled);
window.addEventListener("load", toggleHeaderScrolled);

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

// FAQ ACCORDION

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");

        faqItems.forEach(other => {
            other.classList.remove("active");
            other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
            item.classList.add("active");
            question.setAttribute("aria-expanded", "true");
        }
    });
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

window.addEventListener("scroll", animateCounters);
window.addEventListener("load", animateCounters);

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
})();/* ==========================================
   CONTACT FORM
========================================== */

const contactForm = document.getElementById("contact-form");
const submitBtn = document.querySelector(".form-submit");
const successModal = document.getElementById("successModal");
const closeSuccess = document.getElementById("closeSuccess");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        submitBtn.classList.add("loading");
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        try {

            const response = await fetch(contactForm.action, {

                method:"POST",

                body:formData,

                headers:{
                    Accept:"application/json"
                }

            });

            if(response.ok){

                contactForm.reset();

                successModal.classList.add("show");

            }else{

                alert("Something went wrong. Please try again.");

            }

        }catch{

            alert("Unable to send your message.");

        }

        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;

    });

}

if(closeSuccess){

    closeSuccess.addEventListener("click",()=>{

        successModal.classList.remove("show");

    });

}