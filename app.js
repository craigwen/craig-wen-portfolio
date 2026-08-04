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

/* ---------- Typewriter roles after the name ---------- */

const typed = document.getElementById("typed");
const caret = document.getElementById("caret");

if (typed && caret) {
    const roles = [
        "content designer",
        "content strategist",
        "model designer",
        "content engineer",
        "database manager",
        "autopsy technician",
    ];

    const TYPE = 68; // per character, plus jitter
    const DELETE = 30; // deleting reads faster than typing
    const HOLD = 10000; // time spent showing a finished role
    const BETWEEN = 450; // beat after clearing, before the next role

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // A real cursor holds steady while keys are being pressed.
    const setTyping = (on) => caret.classList.toggle("is-typing", on);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    async function run() {
        let i = 0;
        while (true) {
            const role = ", " + roles[i % roles.length];

            setTyping(true);
            for (let c = 1; c <= role.length; c++) {
                typed.textContent = role.slice(0, c);
                await wait(TYPE + Math.random() * 55);
            }
            setTyping(false);

            await wait(HOLD);

            setTyping(true);
            for (let c = role.length; c >= 0; c--) {
                typed.textContent = role.slice(0, c);
                await wait(DELETE);
            }
            setTyping(false);

            await wait(BETWEEN);
            i++;
        }
    }

    if (reduced.matches) {
        typed.textContent = ", " + roles[0];
    } else {
        run();
    }
}
