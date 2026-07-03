(function () {
    const body = document.body;
    const langToggle = document.getElementById("lang-toggle");
    const translatableNodes = document.querySelectorAll("[data-en]");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const projectCards = document.querySelectorAll(".project-card");

    function applyLanguage(lang) {
        body.dataset.lang = lang;
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

        translatableNodes.forEach((node) => {
            const copy = node.dataset[lang];
            if (copy) {
                node.textContent = copy;
            }
        });

        langToggle.textContent = lang === "zh" ? "EN" : "中文";
        localStorage.setItem("portfolio-language", lang);
    }

    function setFilter(filter) {
        filterButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.filter === filter);
        });

        projectCards.forEach((card) => {
            const categories = card.dataset.category.split(" ");
            card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
        });
    }

    langToggle.addEventListener("click", () => {
        applyLanguage(body.dataset.lang === "zh" ? "en" : "zh");
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => setFilter(button.dataset.filter));
    });

    applyLanguage(localStorage.getItem("portfolio-language") || "zh");
    setFilter("all");
})();
