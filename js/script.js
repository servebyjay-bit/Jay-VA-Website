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


// FAQ ACCORDION (CONV-FIX #4)

document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        const answer = document.getElementById(
            btn.getAttribute("aria-controls")
        );

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
const siteFooter = document.querySelector(".footer");

function toggleFloatingCta() {
    if (!floatingCta || !portfolioSection) return;

    const portfolioTop =
        portfolioSection.getBoundingClientRect().top +
        window.scrollY;

    const pastPortfolio =
        window.scrollY >=
        portfolioTop - window.innerHeight * 0.5;

    // Once the footer starts entering the viewport, hide the CTA so
    // the copyright/legal row stays visible instead of being covered.
    // Scrolling back up moves the footer out of view again, so the
    // same check naturally brings the CTA back.
    let footerInView = false;

    if (siteFooter) {
        footerInView =
            siteFooter.getBoundingClientRect().top <
            window.innerHeight;
    }

    floatingCta.classList.toggle(
        "is-visible",
        pastPortfolio && !footerInView
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

    const prevBtn =
        lightbox.querySelector(".photo-lightbox-prev");

    const nextBtn =
        lightbox.querySelector(".photo-lightbox-next");

    const counter =
        lightbox.querySelector(".photo-lightbox-counter");

    let lastFocused = null;
    let currentGroup = [];
    let currentIndex = 0;

    // Group every clickable gallery item (photo edits, niche mockups,
    // social-media showcases, site screenshots) by its data-lightbox-group
    // so swiping / prev-next stays within that same set of images.
    const groups = {};

    document.querySelectorAll("[data-lightbox-group]").forEach(trigger => {
        const group = trigger.getAttribute("data-lightbox-group");

        if (!groups[group]) {
            groups[group] = [];
        }

        groups[group].push(trigger);
    });

    function triggerImg(trigger) {
        return trigger.tagName === "IMG"
            ? trigger
            : trigger.querySelector("img");
    }

    function show(index) {
        if (!currentGroup.length) return;

        currentIndex =
            (index + currentGroup.length) %
            currentGroup.length;

        const img =
            triggerImg(currentGroup[currentIndex]);

        if (!img) return;

        lightboxImg.src =
            img.currentSrc || img.src;

        lightboxImg.alt =
            img.alt || "";

        const multi =
            currentGroup.length > 1;

        if (prevBtn) {
            prevBtn.hidden = !multi;
        }

        if (nextBtn) {
            nextBtn.hidden = !multi;
        }

        if (counter) {
            counter.hidden = !multi;

            counter.textContent = multi
                ? (currentIndex + 1) +
                  " / " +
                  currentGroup.length
                : "";
        }
    }


    function openLightbox(trigger) {
        lastFocused =
            document.activeElement;

        const groupName =
            trigger.getAttribute(
                "data-lightbox-group"
            ) || "";

        currentGroup =
            groups[groupName] || [trigger];

        const startIndex =
            currentGroup.indexOf(trigger);

        show(
            startIndex === -1
                ? 0
                : startIndex
        );

        lightbox.classList.add(
            "is-active"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

        closeBtn.focus();
    }


    function closeLightbox() {
        lightbox.classList.remove(
            "is-active"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";

        lightboxImg.src = "";

        if (lastFocused) {
            lastFocused.focus();
        }
    }


    document.querySelectorAll(
        "[data-lightbox-group]"
    ).forEach(trigger => {
        trigger.addEventListener(
            "click",
            () => {
                openLightbox(trigger);
            }
        );

        // Keyboard-accessible: these triggers are plain divs/figures with
        // role="button" + tabindex="0" in the markup, so Enter/Space opens
        // them the same way a click would.
        trigger.addEventListener(
            "keydown",
            e => {
                if (
                    e.key === "Enter" ||
                    e.key === " "
                ) {
                    e.preventDefault();
                    openLightbox(trigger);
                }
            }
        );
    });


    if (prevBtn) {
        prevBtn.addEventListener(
            "click",
            e => {
                e.stopPropagation();
                show(currentIndex - 1);
            }
        );
    }

    if (nextBtn) {
        nextBtn.addEventListener(
            "click",
            e => {
                e.stopPropagation();
                show(currentIndex + 1);
            }
        );
    }


    closeBtn.addEventListener(
        "click",
        closeLightbox
    );


    lightbox.addEventListener(
        "click",
        e => {
            if (
                e.target === lightbox ||
                e.target === lightboxImg
            ) {
                closeLightbox();
            }
        }
    );


    document.addEventListener(
        "keydown",
        e => {
            if (
                !lightbox.classList.contains(
                    "is-active"
                )
            ) {
                return;
            }

            if (e.key === "Escape") {
                closeLightbox();
            }

            if (e.key === "ArrowRight") {
                show(currentIndex + 1);
            }

            if (e.key === "ArrowLeft") {
                show(currentIndex - 1);
            }
        }
    );


    // SWIPE - one-finger horizontal drag moves to the next/previous image
    // in the current group; a mostly-vertical drag is ignored so it doesn't
    // fight with the page's own scroll gesture.
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener(
        "touchstart",
        e => {
            if (e.touches.length !== 1) return;

            touchStartX =
                e.touches[0].clientX;

            touchStartY =
                e.touches[0].clientY;
        },
        { passive: true }
    );

    lightbox.addEventListener(
        "touchend",
        e => {
            if (
                !touchStartX &&
                touchStartX !== 0
            ) {
                return;
            }

            const dx =
                e.changedTouches[0].clientX -
                touchStartX;

            const dy =
                e.changedTouches[0].clientY -
                touchStartY;

            if (
                Math.abs(dx) > 45 &&
                Math.abs(dx) >
                    Math.abs(dy)
            ) {
                if (dx < 0) {
                    show(currentIndex + 1);
                } else {
                    show(currentIndex - 1);
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        },
        { passive: true }
    );

})();


// ==========================================
// CONFETTI
// A small, dependency-free canvas burst — no external library,
// no extra network request, respects prefers-reduced-motion.
// ==========================================

const fireConfetti = (function () {
    const canvas =
        document.getElementById(
            "confetti-canvas"
        );

    if (!canvas) {
        return function () {};
    }

    const ctx =
        canvas.getContext("2d");

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const colors = [
        "#0A66C2",
        "#2D7FE0",
        "#4f9cf9",
        "#f5a524",
        "#f78b1f",
        "#ffffff"
    ];

    let particles = [];
    let animationId = null;
    let stopTimer = null;

    function resizeCanvas() {
        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;
    }

    function makeParticle() {
        return {
            x:
                Math.random() *
                canvas.width,

            y:
                -20 -
                Math.random() *
                    canvas.height *
                    0.3,

            size:
                6 +
                Math.random() *
                    6,

            color:
                colors[
                    Math.floor(
                        Math.random() *
                            colors.length
                    )
                ],

            speedY:
                2.5 +
                Math.random() *
                    3.5,

            speedX:
                (Math.random() - 0.5) *
                2.5,

            rotation:
                Math.random() *
                360,

            rotationSpeed:
                (Math.random() - 0.5) *
                10,

            shape:
                Math.random() > 0.5
                    ? "rect"
                    : "circle",

            opacity: 1
        };
    }

    function draw() {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach(p => {
            ctx.save();

            ctx.globalAlpha =
                p.opacity;

            ctx.translate(
                p.x,
                p.y
            );

            ctx.rotate(
                (p.rotation *
                    Math.PI) /
                    180
            );

            ctx.fillStyle =
                p.color;

            if (p.shape === "rect") {
                ctx.fillRect(
                    -p.size / 2,
                    -p.size / 4,
                    p.size,
                    p.size / 2
                );
            } else {
                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    p.size / 2.5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.restore();
        });
    }

    function update() {
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation +=
                p.rotationSpeed;

            if (
                p.y >
                canvas.height * 0.75
            ) {
                p.opacity -= 0.02;
            }
        });

        particles =
            particles.filter(
                p =>
                    p.opacity > 0 &&
                    p.y <
                        canvas.height +
                            40
            );
    }

    function loop() {
        update();
        draw();

        if (particles.length > 0) {
            animationId =
                requestAnimationFrame(
                    loop
                );
        } else {
            cancelAnimationFrame(
                animationId
            );

            animationId = null;

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    }

    return function fireConfetti() {
        if (reduceMotion) return;

        resizeCanvas();

        const burst = [];

        for (let i = 0; i < 140; i++) {
            burst.push(
                makeParticle()
            );
        }

        particles = burst;

        if (!animationId) {
            animationId =
                requestAnimationFrame(
                    loop
                );
        }

        clearTimeout(stopTimer);

        stopTimer =
            setTimeout(() => {
                particles = [];
            }, 3200);
    };

})();


window.addEventListener(
    "resize",
    () => {
        const canvas =
            document.getElementById(
                "confetti-canvas"
            );

        if (canvas) {
            canvas.width =
                window.innerWidth;

            canvas.height =
                window.innerHeight;
        }
    }
);


// ==========================================
// CONTACT FORM + SUCCESS MODAL
// ==========================================

(function () {
    const contactForm =
        document.querySelector(
            ".contact-form"
        );

    const submitBtn =
        document.querySelector(
            ".form-submit"
        );

    const successModal =
        document.getElementById(
            "successModal"
        );

    const closeSuccess =
        document.getElementById(
            "closeSuccess"
        );

    let lastFocusedBeforeModal =
        null;


    // REQUIRED-FIELD GATING

    function updateSubmitState() {
        if (
            !contactForm ||
            !submitBtn
        ) {
            return;
        }

        submitBtn.disabled =
            !contactForm.checkValidity();
    }


    if (
        contactForm &&
        submitBtn
    ) {
        contactForm
            .querySelectorAll(
                "[required]"
            )
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

        successModal.classList.add(
            "show"
        );

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

        successModal.classList.remove(
            "show"
        );

        successModal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            lastFocusedBeforeModal
        ) {
            lastFocusedBeforeModal.focus();
        }
    }


    if (
        contactForm &&
        submitBtn
    ) {
        contactForm.addEventListener(
            "submit",
            async e => {
                e.preventDefault();

                submitBtn.classList.add(
                    "loading"
                );

                submitBtn.disabled =
                    true;

                try {
                    const response =
                        await fetch(
                            contactForm.action,
                            {
                                method:
                                    "POST",

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


    if (
        successModal &&
        closeSuccess
    ) {
        closeSuccess.addEventListener(
            "click",
            closeSuccessModal
        );

        successModal.addEventListener(
            "click",
            e => {
                if (
                    e.target ===
                    successModal
                ) {
                    closeSuccessModal();
                }
            }
        );

        document.addEventListener(
            "keydown",
            e => {
                if (
                    e.key === "Escape" &&
                    successModal.classList.contains(
                        "show"
                    )
                ) {
                    closeSuccessModal();
                }
            }
        );
    }

})();


// ==========================================
// VIDEO LIGHTBOX
// Click any video card in Video Editing to play it full-screen, with
// swipe / prev-next between the videos in that same group. Cards still
// marked .media-pending (no real file uploaded yet) are inert.
// ==========================================

(function () {
    const lightbox =
        document.getElementById(
            "video-lightbox"
        );

    if (!lightbox) return;

    const player =
        lightbox.querySelector(
            ".video-lightbox-player"
        );

    const closeBtn =
        lightbox.querySelector(
            ".video-lightbox-close"
        );

    const prevBtn =
        lightbox.querySelector(
            ".video-lightbox-prev"
        );

    const nextBtn =
        lightbox.querySelector(
            ".video-lightbox-next"
        );

    const counter =
        lightbox.querySelector(
            ".video-lightbox-counter"
        );

    let lastFocused = null;
    let currentGroup = [];
    let currentIndex = 0;

    const groups = {};

    document
        .querySelectorAll(
            "[data-video-group]"
        )
        .forEach(trigger => {
            const group =
                trigger.getAttribute(
                    "data-video-group"
                );

            if (!groups[group]) {
                groups[group] = [];
            }

            groups[group].push(
                trigger
            );
        });

    function sourceOf(trigger) {
        const video =
            trigger.querySelector(
                "video"
            );

        const source =
            video
                ? video.querySelector(
                      "source"
                  )
                : null;

        return {
            src: source
                ? source.src
                : "",

            type: source
                ? source.getAttribute(
                      "type"
                  )
                : "video/mp4",

            poster: video
                ? video.getAttribute(
                      "poster"
                  )
                : ""
        };
    }

    function show(index) {
        if (!currentGroup.length) {
            return;
        }

        currentIndex =
            (index +
                currentGroup.length) %
            currentGroup.length;

        const {
            src,
            type,
            poster
        } = sourceOf(
            currentGroup[
                currentIndex
            ]
        );

        if (!src) return;

        player.pause();
        player.innerHTML = "";

        const source =
            document.createElement(
                "source"
            );

        source.src = src;

        source.type =
            type || "video/mp4";

        player.appendChild(
            source
        );

        if (poster) {
            player.setAttribute(
                "poster",
                poster
            );
        }

        player.load();

        player
            .play()
            .catch(() => {});

        const multi =
            currentGroup.length >
            1;

        if (prevBtn) {
            prevBtn.hidden =
                !multi;
        }

        if (nextBtn) {
            nextBtn.hidden =
                !multi;
        }

        if (counter) {
            counter.hidden =
                !multi;

            counter.textContent =
                multi
                    ? currentIndex +
                      1 +
                      " / " +
                      currentGroup.length
                    : "";
        }
    }


    function openLightbox(trigger) {
        lastFocused =
            document.activeElement;

        const groupName =
            trigger.getAttribute(
                "data-video-group"
            ) || "";

        currentGroup =
            groups[groupName] || [
                trigger
            ];

        const startIndex =
            currentGroup.indexOf(
                trigger
            );

        show(
            startIndex === -1
                ? 0
                : startIndex
        );

        lightbox.classList.add(
            "is-active"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

        closeBtn.focus();
    }


    function closeLightbox() {
        lightbox.classList.remove(
            "is-active"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";

        player.pause();

        player.removeAttribute(
            "src"
        );

        player.innerHTML = "";

        player.load();

        if (lastFocused) {
            lastFocused.focus();
        }
    }


    document
        .querySelectorAll(
            "[data-video-group]"
        )
        .forEach(trigger => {

            // Cards that don't have a real file yet stay inert — no broken
            // player pops up for a "Coming Soon" placeholder.
            if (
                trigger.classList.contains(
                    "media-pending"
                )
            ) {
                return;
            }

            trigger.addEventListener(
                "click",
                () => {
                    openLightbox(
                        trigger
                    );
                }
            );

            trigger.addEventListener(
                "keydown",
                e => {
                    if (
                        e.key ===
                            "Enter" ||
                        e.key === " "
                    ) {
                        e.preventDefault();

                        openLightbox(
                            trigger
                        );
                    }
                }
            );
        });


    if (prevBtn) {
        prevBtn.addEventListener(
            "click",
            e => {
                e.stopPropagation();

                show(
                    currentIndex - 1
                );
            }
        );
    }

    if (nextBtn) {
        nextBtn.addEventListener(
            "click",
            e => {
                e.stopPropagation();

                show(
                    currentIndex + 1
                );
            }
        );
    }


    closeBtn.addEventListener(
        "click",
        closeLightbox
    );

    lightbox.addEventListener(
        "click",
        e => {
            if (
                e.target ===
                lightbox
            ) {
                closeLightbox();
            }
        }
    );


    document.addEventListener(
        "keydown",
        e => {
            if (
                !lightbox.classList.contains(
                    "is-active"
                )
            ) {
                return;
            }

            if (e.key === "Escape") {
                closeLightbox();
            }

            if (
                e.key ===
                "ArrowRight"
            ) {
                show(
                    currentIndex + 1
                );
            }

            if (
                e.key ===
                "ArrowLeft"
            ) {
                show(
                    currentIndex - 1
                );
            }
        }
    );


    // SWIPE — same horizontal-drag gesture as the photo lightbox, ignored
    // on the player's own control bar so scrubbing still works normally.
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener(
        "touchstart",
        e => {
            if (
                e.touches.length !==
                1
            ) {
                return;
            }

            touchStartX =
                e.touches[0].clientX;

            touchStartY =
                e.touches[0].clientY;
        },
        { passive: true }
    );

    lightbox.addEventListener(
        "touchend",
        e => {
            if (
                !touchStartX &&
                touchStartX !== 0
            ) {
                return;
            }

            const dx =
                e.changedTouches[0]
                    .clientX -
                touchStartX;

            const dy =
                e.changedTouches[0]
                    .clientY -
                touchStartY;

            if (
                Math.abs(dx) > 45 &&
                Math.abs(dx) >
                    Math.abs(dy)
            ) {
                if (dx < 0) {
                    show(
                        currentIndex + 1
                    );
                } else {
                    show(
                        currentIndex - 1
                    );
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        },
        { passive: true }
    );

})();