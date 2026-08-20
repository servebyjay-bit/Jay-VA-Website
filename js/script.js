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

        btn.setAttribute(
            "aria-expanded",
            isOpen ? "false" : "true"
        );

        const label = btn.querySelector("span:first-child");

        if (label) {
            label.textContent = isOpen
                ? "View Featured Works"
                : "Hide Featured Works";
        }
    });
});


// FAQ ACCORDION (CONV-FIX #4)

document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        const answer = document.getElementById(btn.getAttribute("aria-controls"));

        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");

        if (answer) {
            answer.classList.toggle("is-open", !isOpen);
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
                    counter.textContent =
                        (current / 1000).toFixed(0) + "K" + suffix;
                } else {
                    counter.textContent =
                        current + suffix;
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
// All scroll-driven functions are batched into a single
// requestAnimationFrame-throttled passive listener.

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

window.addEventListener("scroll", onScroll, {
    passive: true
});

window.addEventListener("load", onScroll);


// FLOATING CTA

const floatingCta = document.querySelector(".floating-cta");
const portfolioSection = document.getElementById("portfolio");

function toggleFloatingCta() {
    if (!floatingCta || !portfolioSection) return;

    const portfolioTop =
        portfolioSection.getBoundingClientRect().top +
        window.scrollY;

    const shouldShow =
        window.scrollY >=
        portfolioTop - window.innerHeight * 0.5;

    floatingCta.classList.toggle(
        "is-visible",
        shouldShow
    );
}


// Hide any tool icon that fails to load instead of showing
// a broken-image glyph.

document.querySelectorAll(".tool-card img").forEach(img => {
    img.addEventListener("error", () => {
        img.style.display = "none";
    });
});


// ==========================================
// PHOTO LIGHTBOX
// ==========================================

(function () {
    const lightbox =
        document.getElementById("photo-lightbox");

    if (!lightbox) return;

    const lightboxImg =
        lightbox.querySelector(".photo-lightbox-img");

    const closeBtn =
        lightbox.querySelector(".photo-lightbox-close");

    let lastFocused = null;


    function openLightbox(imgEl) {
        lastFocused = document.activeElement;

        lightboxImg.src = imgEl.src;
        lightboxImg.alt = imgEl.alt || "";

        lightbox.classList.add("is-active");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";

        closeBtn.focus();
    }


    function closeLightbox() {
        lightbox.classList.remove("is-active");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

        lightboxImg.src = "";

        if (lastFocused) {
            lastFocused.focus();
        }
    }


    document.querySelectorAll(".photo-card").forEach(card => {
        const img = card.querySelector("img");
        const zoomBtn = card.querySelector(".photo-zoom-btn");

        card.addEventListener("click", () => {
            openLightbox(img);
        });

        zoomBtn.addEventListener("click", e => {
            e.stopPropagation();
            openLightbox(img);
        });
    });


    closeBtn.addEventListener(
        "click",
        closeLightbox
    );


    lightbox.addEventListener("click", e => {
        if (
            e.target === lightbox ||
            e.target === lightboxImg
        ) {
            closeLightbox();
        }
    });


    document.addEventListener("keydown", e => {
        if (
            e.key === "Escape" &&
            lightbox.classList.contains("is-active")
        ) {
            closeLightbox();
        }
    });

})();


// ==========================================
// CONFETTI
// A small, dependency-free canvas burst — no external library,
// no extra network request, respects prefers-reduced-motion.
// ==========================================

const fireConfetti = (function () {

    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return function () {};

    const ctx = canvas.getContext("2d");

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const colors = [
        "#0A66C2", "#2D7FE0", "#4f9cf9",
        "#f5a524", "#f78b1f", "#ffffff"
    ];

    let particles = [];
    let animationId = null;
    let stopTimer = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function makeParticle() {
        return {
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.3,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: 2.5 + Math.random() * 3.5,
            speedX: (Math.random() - 0.5) * 2.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: Math.random() > 0.5 ? "rect" : "circle",
            opacity: 1
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;

            if (p.shape === "rect") {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    function update() {
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            if (p.y > canvas.height * 0.75) {
                p.opacity -= 0.02;
            }
        });

        particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 40);
    }

    function loop() {
        update();
        draw();

        if (particles.length > 0) {
            animationId = requestAnimationFrame(loop);
        } else {
            cancelAnimationFrame(animationId);
            animationId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    return function fireConfetti() {

        if (reduceMotion) return;

        resizeCanvas();

        const burst = [];
        for (let i = 0; i < 140; i++) {
            burst.push(makeParticle());
        }
        particles = burst;

        if (!animationId) {
            animationId = requestAnimationFrame(loop);
        }

        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
            particles = [];
        }, 3200);
    };

})();

window.addEventListener("resize", () => {
    const canvas = document.getElementById("confetti-canvas");
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});


// ==========================================
// CONTACT FORM + SUCCESS MODAL
// ==========================================

(function () {

    const contactForm =
        document.getElementById("contact-form");

    const submitBtn =
        document.querySelector(".form-submit");

    const successModal =
        document.getElementById("successModal");

    const closeSuccess =
        document.getElementById("closeSuccess");

    let lastFocusedBeforeModal = null;


    // REQUIRED-FIELD GATING

    function updateSubmitState() {

        if (!contactForm || !submitBtn) return;

        submitBtn.disabled =
            !contactForm.checkValidity();
    }


    if (contactForm && submitBtn) {

        contactForm
            .querySelectorAll("[required]")
            .forEach(field => {

                field.addEventListener(
                    "input",
                    updateSubmitState
                );

                field.addEventListener(
                    "blur",
                    updateSubmitState
                );

            });

        updateSubmitState();
    }


    function openSuccessModal() {

        if (!successModal) return;

        lastFocusedBeforeModal =
            document.activeElement;

        successModal.classList.add("show");

        successModal.setAttribute(
            "aria-hidden",
            "false"
        );

        // Fires in the same moment the modal appears, not after,
        // so the celebration and the confirmation land together.
        fireConfetti();

        if (closeSuccess) {
            closeSuccess.focus();
        }
    }


    function closeSuccessModal() {

        if (!successModal) return;

        successModal.classList.remove("show");

        successModal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (lastFocusedBeforeModal) {
            lastFocusedBeforeModal.focus();
        }
    }


    if (contactForm && submitBtn) {

        contactForm.addEventListener(
            "submit",
            async e => {

                e.preventDefault();

                submitBtn.classList.add("loading");

                submitBtn.disabled = true;


                try {

                    const response = await fetch(
                        contactForm.action,
                        {
                            method: "POST",

                            body:
                                new FormData(
                                    contactForm
                                ),

                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                    if (response.ok) {

                        contactForm.reset();

                        openSuccessModal();

                    } else {

                        alert(
                            "Something went wrong. Please try again."
                        );
                    }

                } catch {

                    alert(
                        "Unable to send your message."
                    );
                }


                submitBtn.classList.remove(
                    "loading"
                );

                updateSubmitState();

            }
        );
    }


    if (successModal && closeSuccess) {

        closeSuccess.addEventListener(
            "click",
            closeSuccessModal
        );


        successModal.addEventListener(
            "click",
            e => {

                if (e.target === successModal) {
                    closeSuccessModal();
                }

            }
        );


        document.addEventListener(
            "keydown",
            e => {

                if (
                    e.key === "Escape" &&
                    successModal.classList.contains("show")
                ) {
                    closeSuccessModal();
                }

            }
        );
    }

})();


// ==========================================
// RATES & PACKAGES → CONTACT FORM WIRING
// Two independent selections (social media package +
// website/landing service) so a visitor can pick one of
// each — every group gets its own hidden form field and
// its own "Selected ..." box in the contact form.
// ==========================================

(function () {

    const contactForm =
        document.getElementById(
            "contact-form"
        );

    function escapeHtml(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    function wirePackageGroup(config) {

        const radios =
            document.querySelectorAll(
                `input[name="${config.radioName}"]`
            );

        if (!radios.length) return;


        const hiddenField =
            document.getElementById(config.hiddenFieldId);

        const statusText =
            config.statusTextId ?
                document.getElementById(config.statusTextId) :
                null;

        const addToMessageBtn =
            config.addToMessageBtnId ?
                document.getElementById(config.addToMessageBtnId) :
                null;

        const box =
            document.getElementById(config.boxId);

        const display =
            document.getElementById(config.displayId);

        const status =
            document.getElementById(config.statusId);


        function getSelectedRadio() {

            return document.querySelector(
                `input[name="${config.radioName}"]:checked`
            );

        }


        function sync() {

            const selected =
                getSelectedRadio();


            if (!selected) {

                if (hiddenField) {
                    hiddenField.value = "";
                }

                if (statusText) {
                    statusText.textContent =
                        config.emptyStatusText;
                }

                if (status) {
                    status.textContent =
                        "Not selected";
                }

                if (display) {

                    display.innerHTML =
                        `<span class="selected-package-placeholder">${config.emptyPlaceholder}</span>`;

                }

                if (box) {
                    box.classList.remove(
                        "has-selection"
                    );
                }

                if (addToMessageBtn) {
                    addToMessageBtn.disabled = true;
                }

                return;
            }


            const name =
                selected.dataset.packageName ||
                config.defaultName;

            const price =
                selected.dataset.packagePrice ||
                "";

            const details =
                selected.dataset.packageDetails ||
                `${name} — ${price}`;


            // Keep each selection completely separate
            // from the visitor's main message.

            if (hiddenField) {
                hiddenField.value = details;
            }


            if (statusText) {

                statusText.textContent =
                    `${name} selected`;

            }


            if (status) {

                status.textContent =
                    "Selected";

            }


            if (display) {

                display.innerHTML = `

                    <div class="selected-package-value">

                        <span class="selected-package-name">
                            ${escapeHtml(name)}
                        </span>

                        <span class="selected-package-price">
                            ${escapeHtml(price)}
                        </span>

                        <span class="selected-package-description">
                            ${config.confirmationText}
                        </span>

                    </div>

                `;
            }


            if (box) {
                box.classList.add(
                    "has-selection"
                );
            }


            if (addToMessageBtn) {
                addToMessageBtn.disabled = false;
            }

        }


        radios.forEach(radio => {

            radio.addEventListener(
                "change",
                sync
            );

        });


        // "Continue to Inquiry" moves the visitor
        // to the contact form without modifying
        // the Message field.

        if (addToMessageBtn) {

            addToMessageBtn.addEventListener(
                "click",
                () => {

                    const selected =
                        getSelectedRadio();

                    if (!selected) return;


                    sync();


                    const contactSection =
                        document.getElementById(
                            "contact"
                        );


                    if (contactSection) {

                        contactSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }


        // Synchronize this group immediately before
        // form submission.

        if (contactForm) {

            contactForm.addEventListener(
                "submit",
                sync,
                true
            );

        }


        // Initialize this group's state.

        sync();

    }


    // SOCIAL MEDIA MONTHLY PACKAGE

    wirePackageGroup({
        radioName: "package",
        hiddenFieldId: "selectedPackageField",
        statusTextId: "pricing-selected-text",
        addToMessageBtnId: "pricingAddToMessage",
        boxId: "selectedPackageBox",
        displayId: "selectedPackageDisplay",
        statusId: "selectedPackageStatus",
        defaultName: "Selected Package",
        emptyStatusText: "Select a package to continue.",
        emptyPlaceholder: "No package selected yet",
        confirmationText: "This package will be submitted separately from your project message."
    });


    // WEBSITE / LANDING PAGE SERVICE

    wirePackageGroup({
        radioName: "website-package",
        hiddenFieldId: "selectedWebsitePackageField",
        boxId: "selectedWebsitePackageBox",
        displayId: "selectedWebsitePackageDisplay",
        statusId: "selectedWebsitePackageStatus",
        defaultName: "Selected Service",
        emptyStatusText: "Select a service to continue.",
        emptyPlaceholder: "No service selected yet",
        confirmationText: "This service will be submitted separately from your project message."
    });

})();