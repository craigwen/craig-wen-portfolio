// Shared behaviour for the homepage and the case study pages.
// Every block guards for its own markup, so this file is safe on any page.

/* ---------- Experience: rail marks which job you're reading ---------- */

const rail = document.querySelector(".exp-rail");

if (rail) {
    const items = [...rail.querySelectorAll(".rail-item")];
    const jobs = items.map((a) => document.querySelector(a.getAttribute("href")));
    const OFFSET = 96; // sticky header (71px) plus breathing room

    let ticking = false;

    // "Last job whose top has crossed the line" stays predictable when a job is
    // taller than the viewport, or when two are on screen at once.
    const sync = () => {
        let idx = 0;
        jobs.forEach((job, i) => {
            if (job && job.getBoundingClientRect().top <= OFFSET + 8) idx = i;
        });

        // The last job sits too close to the end of the page for its top to
        // ever reach the line, so bottoming out has to select it explicitly.
        const doc = document.documentElement;
        if (Math.ceil(scrollY + innerHeight) >= doc.scrollHeight - 2) {
            idx = jobs.length - 1;
        }

        items.forEach((a, i) => {
            a.classList.toggle("is-active", i === idx);
            if (i === idx) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
        });
        ticking = false;
    };

    addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(sync);
            }
        },
        { passive: true },
    );

    addEventListener("resize", sync, { passive: true });
    sync();
}

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
