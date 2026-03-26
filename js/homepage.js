(function () {
    const body = document.body;
    const langToggle = document.getElementById("lang-toggle");
    const translatableNodes = document.querySelectorAll("[data-en][data-zh]");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const projectCards = document.querySelectorAll(".project-card");
    const projectGrid = document.querySelector(".project-grid");
    const audienceButtons = document.querySelectorAll("[data-view-target]");
    const modeButtons = document.querySelectorAll("[data-mode-target]");
    const focusCopy = document.getElementById("focus-copy");
    const modeCopy = document.getElementById("mode-copy");

    const audienceMessages = {
        recruiter: {
            en: "Start with the selected work section to see role fit, technical range, and evidence of execution.",
            zh: "建议先看精选项目区，能最快判断岗位匹配度、技术跨度与执行证据。"
        },
        collaborator: {
            en: "Jump between About, Skills, and the project cards to understand how I communicate, document, and collaborate across media.",
            zh: "可以重点查看关于我、技能区与项目卡，了解我如何沟通、整理流程并跨媒介协作。"
        },
        explorer: {
            en: "Browse more freely and use filters to see the side of the portfolio you care about most.",
            zh: "可以更自由地浏览，并用筛选按钮找到你最感兴趣的项目类型。"
        }
    };

    const modeMessages = {
        design: {
            en: "Design mode brings visual communication, audience experience, and polished presentation closer to the front.",
            zh: "设计模式会把视觉表达、观众体验与呈现完成度放到更前面。"
        },
        tech: {
            en: "Tech mode raises system thinking, implementation evidence, and tool-chain depth.",
            zh: "技术模式会强化系统思维、实现证据与工具链深度。"
        }
    };

    const getSavedLanguage = () => localStorage.getItem("portfolio-language") || "en";
    const getSavedMode = () => localStorage.getItem("portfolio-mode") || "design";
    const getSavedAudience = () => localStorage.getItem("portfolio-audience") || "recruiter";

    function updateHelperCopy() {
        const lang = body.dataset.lang;
        const audience = body.dataset.audience;
        const mode = body.dataset.mode;

        focusCopy.textContent = audienceMessages[audience][lang];
        modeCopy.textContent = modeMessages[mode][lang];
    }

    function applyLanguage(lang) {
        body.dataset.lang = lang;
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

        translatableNodes.forEach((node) => {
            node.textContent = node.dataset[lang];
        });

        updateHelperCopy();
        localStorage.setItem("portfolio-language", lang);
    }

    function setAudience(view) {
        body.dataset.audience = view;
        audienceButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.viewTarget === view);
        });
        updateHelperCopy();
        localStorage.setItem("portfolio-audience", view);
    }

    function setMode(mode) {
        body.dataset.mode = mode;
        modeButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.modeTarget === mode);
        });

        const cards = Array.from(projectCards);
        const key = mode === "tech" ? "priorityTech" : "priorityDesign";
        cards
            .sort((a, b) => Number(a.dataset[key]) - Number(b.dataset[key]))
            .forEach((card) => projectGrid.appendChild(card));

        updateHelperCopy();
        localStorage.setItem("portfolio-mode", mode);
    }

    function setFilter(filter) {
        filterButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.filter === filter);
        });

        projectCards.forEach((card) => {
            const categories = card.dataset.category.split(" ");
            const shouldShow = filter === "all" || categories.includes(filter);
            card.classList.toggle("is-hidden", !shouldShow);
        });
    }

    langToggle.addEventListener("click", () => {
        const nextLang = body.dataset.lang === "en" ? "zh" : "en";
        applyLanguage(nextLang);
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => setFilter(button.dataset.filter));
    });

    audienceButtons.forEach((button) => {
        button.addEventListener("click", () => setAudience(button.dataset.viewTarget));
    });

    modeButtons.forEach((button) => {
        button.addEventListener("click", () => setMode(button.dataset.modeTarget));
    });

    body.dataset.audience = getSavedAudience();
    body.dataset.mode = getSavedMode();
    applyLanguage(getSavedLanguage());
    setAudience(getSavedAudience());
    setMode(getSavedMode());
    setFilter("all");
})();
