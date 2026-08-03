// Shared behaviour for the homepage and the case study pages.
// Every block guards for its own markup, so this file is safe on any page.

/* ---------- Experience: logo grid toggles (homepage only) ---------- */

const tiles = document.querySelectorAll(".company-tile");
const placeholder = document.querySelector(".job-placeholder");

tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
        const target = document.getElementById(tile.dataset.target);
        const isOpen = tile.getAttribute("aria-expanded") === "true";

        tiles.forEach((t) => {
            t.setAttribute("aria-expanded", "false");
            t.classList.remove("is-active");
        });
        document.querySelectorAll(".job").forEach((job) => {
            job.hidden = true;
        });
        if (placeholder) placeholder.hidden = true;

        if (!isOpen) {
            tile.setAttribute("aria-expanded", "true");
            tile.classList.add("is-active");
            target.hidden = false;
            target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (placeholder) {
            placeholder.hidden = false;
        }
    });
});

/* ---------- Copy email to clipboard ---------- */

const toast = document.getElementById("toast");
let toastTimer;

document.querySelectorAll(".copy-email").forEach((link) => {
    link.addEventListener("click", (e) => {
        if (!navigator.clipboard || !toast) return;
        e.preventDefault();
        navigator.clipboard
            .writeText(link.dataset.email)
            .then(() => {
                toast.textContent = "Copied — say hello anytime";
                toast.classList.add("is-visible");
                clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    toast.classList.remove("is-visible");
                }, 2200);
            })
            .catch(() => {
                window.location.href = link.href;
            });
    });
});

/* ---------- Coffee cup that fills as you read ---------- */

const brew = document.getElementById("brew");

if (brew) {
    // The cup body is reused as both the outline and the clip for the liquid.
    const cup = "M4 7.5 h12 v7.5 a6 6 0 0 1 -6 6 h0 a6 6 0 0 1 -6 -6 z";

    // The clip lives on an untransformed <g>: a transform on the liquid itself
    // would drag its clip along with it and the fill would escape the cup.
    brew.innerHTML = `
        <svg viewBox="0 0 26 24" aria-hidden="true">
          <defs><clipPath id="brewClip"><path d="${cup}" /></clipPath></defs>
          <g clip-path="url(#brewClip)">
            <rect class="brew-liquid" x="4" y="7.5" width="12" height="13.5" />
          </g>
          <path class="brew-cup" d="${cup}" />
          <path class="brew-handle" d="M16.5 10 a3.5 3.5 0 0 1 0 7" />
        </svg>`;

    let ticking = false;

    const updateBrew = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const progress = max > 0 ? Math.min(scrollY / max, 1) : 1;
        brew.style.setProperty("--fill", progress.toFixed(3));
        brew.classList.toggle("is-full", progress > 0.995);
        ticking = false;
    };

    addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateBrew);
            }
        },
        { passive: true },
    );

    addEventListener("resize", updateBrew, { passive: true });
    updateBrew();
}
