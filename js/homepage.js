(function () {
    const body = document.body;
    const langToggle = document.getElementById("lang-toggle");
    const langToggleLabel = document.getElementById("lang-toggle-label");
    const translatableNodes = document.querySelectorAll("[data-en]");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const projectCards = document.querySelectorAll(".project-card");
    const projectGrid = document.querySelector(".project-grid");
    const audienceButtons = document.querySelectorAll("[data-view-target]");
    const modeButtons = document.querySelectorAll("[data-mode-target]");
    const focusCopy = document.getElementById("focus-copy");
    const modeCopy = document.getElementById("mode-copy");

    const zh = {
        "About": "\u5173\u4e8e\u6211",
        "Projects": "\u9879\u76ee",
        "Experience": "\u7ecf\u5386",
        "Archive": "\u89c6\u89c9\u6863\u6848",
        "Contact": "\u8054\u7cfb",
        "Multimedia design portfolio": "\u591a\u5a92\u4f53\u8bbe\u8ba1\u6c42\u804c\u4f5c\u54c1\u96c6",
        "Designing interactive stories across game, VR, AI, and data.": "\u7528\u6e38\u620f\u3001VR\u3001AI \u4e0e\u6570\u636e\u53ef\u89c6\u5316\uff0c\u8bbe\u8ba1\u53ef\u4e92\u52a8\u7684\u53d9\u4e8b\u4f53\u9a8c\u3002",
        "I am Yu Fan, a bilingual multimedia designer and creative technologist building projects that connect visual design, interactive systems, playful learning, and technical execution.": "\u6211\u662f\u4fde\u5e06\uff0c\u4e00\u540d\u53cc\u8bed\u591a\u5a92\u4f53\u8bbe\u8ba1\u4e0e\u521b\u610f\u6280\u672f\u5b9e\u8df5\u8005\uff0c\u6b63\u5728\u6784\u5efa\u8fde\u63a5\u89c6\u89c9\u8bbe\u8ba1\u3001\u4ea4\u4e92\u7cfb\u7edf\u3001\u6e38\u620f\u5316\u5b66\u4e60\u548c\u6280\u672f\u5b9e\u73b0\u7684\u9879\u76ee\u3002",
        "Multimedia Design": "\u591a\u5a92\u4f53\u8bbe\u8ba1",
        "Creative Technology": "\u521b\u610f\u6280\u672f",
        "Game & VR": "\u6e38\u620f\u4e0e VR",
        "Data Visualization": "\u6570\u636e\u53ef\u89c6\u5316",
        "View selected work": "\u67e5\u770b\u7cbe\u9009\u9879\u76ee",
        "Contact me": "\u8054\u7cfb\u6211",
        "Pixel Nihongo video": "Pixel Nihongo \u89c6\u9891",
        "AI tools notes": "AI \u5de5\u5177\u6587\u6863",
        "Full video folder": "\u5b8c\u6574\u89c6\u9891\u8d44\u6599\u5939",
        "Now studying at PolyU IME": "\u76ee\u524d\u5c31\u8bfb\u4e8e\u6e2f\u7406\u5de5 IME",
        "OpenXR, MetaSDK, UE Blueprint, ComfyUI, Tableau": "OpenXR\u3001MetaSDK\u3001UE \u84dd\u56fe\u3001ComfyUI\u3001Tableau",
        "Choose your path": "\u9009\u62e9\u4f60\u7684\u6d4f\u89c8\u8def\u5f84",
        "Recruiter": "\u62db\u8058\u8005",
        "Collaborator": "\u5408\u4f5c\u65b9",
        "Explorer": "\u540c\u884c / \u8bbf\u5ba2",
        "Toggle the lens": "\u5207\u6362\u89c2\u770b\u89c6\u89d2",
        "Design mode": "\u8bbe\u8ba1\u6a21\u5f0f",
        "Tech mode": "\u6280\u672f\u6a21\u5f0f",
        "A profile built for stable job applications, but still personal.": "\u4e00\u4e2a\u66f4\u9002\u5408\u6b63\u5f0f\u6c42\u804c\uff0c\u540c\u65f6\u4fdd\u7559\u4e2a\u4eba\u98ce\u683c\u7684\u4f5c\u54c1\u4e3b\u9875\u3002",
        "Current positioning": "\u5f53\u524d\u5b9a\u4f4d",
        "I focus on multimedia design roles between visual storytelling, interactive systems, and technical implementation. My work spans Unity XR, UE Blueprint, generative workflows, visual design, and data storytelling.": "\u6211\u4e3b\u8981\u9762\u5411\u4f4d\u4e8e\u89c6\u89c9\u53d9\u4e8b\u3001\u4ea4\u4e92\u7cfb\u7edf\u4e0e\u6280\u672f\u5b9e\u73b0\u4ea4\u53c9\u70b9\u4e0a\u7684\u591a\u5a92\u4f53\u8bbe\u8ba1\u5c97\u4f4d\u3002\u6211\u7684\u5b9e\u8df5\u8986\u76d6 Unity XR\u3001UE \u84dd\u56fe\u3001\u751f\u6210\u5f0f\u6d41\u7a0b\u3001\u89c6\u89c9\u8bbe\u8ba1\uff0c\u4ee5\u53ca\u6570\u636e\u53d9\u4e8b\u3002",
        "Education": "\u6559\u80b2\u80cc\u666f",
        "Strengths": "\u4f18\u52bf\u5173\u952e\u8bcd",
        "Bilingual communication in Mandarin and English, with Japanese learning experience": "\u4e2d\u82f1\u53cc\u8bed\u6c9f\u901a\uff0c\u5e76\u5177\u5907\u65e5\u8bed\u5b66\u4e60\u4e0e\u9879\u76ee\u7ecf\u9a8c",
        "Comfortable moving from concept sketches to implementation details": "\u80fd\u4ece\u6982\u5ff5\u6784\u60f3\u5230\u5b9e\u9645\u5b9e\u73b0\u6301\u7eed\u63a8\u8fdb",
        "Interested in educational play, culture, and viewer interaction": "\u957f\u671f\u5173\u6ce8\u6e38\u620f\u5316\u5b66\u4e60\u3001\u6587\u5316\u8868\u8fbe\u4e0e\u89c2\u4f17\u4e92\u52a8",
        "Selected work": "\u7cbe\u9009\u9879\u76ee",
        "A portfolio shaped around creative technology and interactive media.": "\u56f4\u7ed5\u521b\u610f\u6280\u672f\u4e0e\u4e92\u52a8\u5a92\u4f53\u7ec4\u7ec7\u7684\u9879\u76ee\u9009\u96c6\u3002",
        "All": "\u5168\u90e8",
        "Game": "\u6e38\u620f",
        "AI tools": "AI \u5de5\u5177",
        "Data vis": "\u6570\u636e\u53ef\u89c6\u5316",
        "Design": "\u8bbe\u8ba1",
        "Volunteer project": "\u5fd7\u613f\u9879\u76ee",
        "PolyU VR development support": "PolyU VR \u5f00\u53d1\u652f\u6301",
        "Research-center volunteer work exploring ceramic-themed interaction, OpenXR pipelines, MetaSDK integration, and scene setup in VR environments.": "\u5728\u7814\u7a76\u4e2d\u5fc3\u5fd7\u613f\u9879\u76ee\u4e2d\u63a2\u7d22\u4e0e\u9676\u74f7\u4e3b\u9898\u7ed3\u5408\u7684\u4ea4\u4e92\u3001OpenXR \u6d41\u7a0b\u3001MetaSDK \u63a5\u5165\u4e0e VR \u573a\u666f\u642d\u5efa\u3002",
        "Open scene shot": "\u67e5\u770b\u573a\u666f\u622a\u56fe",
        "View rigging detail": "\u67e5\u770b\u7ed1\u5b9a\u7ec6\u8282",
        "Interactive systems": "\u4ea4\u4e92\u7cfb\u7edf",
        "Blueprint piano experiments": "\u84dd\u56fe\u94a2\u7434\u4ea4\u4e92\u5b9e\u9a8c",
        "A set of Unreal Engine studies focusing on Blueprint logic, piano interaction, readable node-based workflows, and early-level learning outcomes.": "\u4e00\u7ec4 Unreal Engine \u5b66\u4e60\u5b9e\u9a8c\uff0c\u91cd\u70b9\u5c55\u793a Blueprint \u903b\u8f91\u3001\u94a2\u7434\u4ea4\u4e92\u3001\u53ef\u8bfb\u6027\u8f83\u5f3a\u7684\u8282\u70b9\u6d41\u7a0b\uff0c\u4ee5\u53ca\u672c\u79d1\u9636\u6bb5\u7684\u9636\u6bb5\u6027\u6210\u679c\u3002",
        "View key interaction shot": "\u67e5\u770b\u6309\u952e\u4ea4\u4e92\u622a\u56fe",
        "Watch UE learning demo": "\u89c2\u770b UE \u5b66\u4e60\u6210\u54c1",
        "Capstone": "\u6bd5\u4e1a\u8bbe\u8ba1",
        "Game-based learning": "\u6e38\u620f\u5316\u5b66\u4e60",
        "An undergraduate capstone for Japanese language learning through adventure gameplay, answer-based combat, and pronunciation practice in a Unity-built world.": "\u4e00\u4e2a\u4ee5\u65e5\u8bed\u5b66\u4e60\u4e3a\u76ee\u6807\u7684\u672c\u79d1\u6bd5\u4e1a\u8bbe\u8ba1\uff0c\u7ed3\u5408\u5192\u9669\u73a9\u6cd5\u3001\u7b54\u9898\u6218\u6597\u4e0e\u53d1\u97f3\u7ec3\u4e60\uff0c\u5e76\u4ee5 Unity \u4e16\u754c\u89c2\u627f\u8f7d\u5b66\u4e60\u4f53\u9a8c\u3002",
        "Watch Pixel Nihongo demo": "\u89c2\u770b Pixel Nihongo \u6f14\u793a",
        "Documentation": "\u8fc7\u7a0b\u6587\u6863",
        "Vibe coding and ComfyUI notes": "Vibe Coding \u4e0e ComfyUI \u5b9e\u9a8c",
        "A process-focused project combining generative workflows, tool experimentation, and reflective documentation for creative production.": "\u4e00\u4e2a\u5f3a\u8c03\u8fc7\u7a0b\u7684\u65b9\u6cd5\u578b\u9879\u76ee\uff0c\u7ed3\u5408\u751f\u6210\u5f0f\u5de5\u4f5c\u6d41\u3001\u5de5\u5177\u5b9e\u9a8c\u4e0e\u521b\u4f5c\u53cd\u601d\u6587\u6863\u3002",
        "Read documentation": "\u9605\u8bfb\u6587\u6863",
        "INFOSCI301 poster": "INFOSCI301 \u6d77\u62a5",
        "A poster-format data visualization project documented as a final PDF.": "\u4ee5\u6700\u7ec8 PDF \u5448\u73b0\u7684\u6570\u636e\u53ef\u89c6\u5316\u6d77\u62a5\u9879\u76ee\u3002",
        "Data visualization": "\u6570\u636e\u53ef\u89c6\u5316",
        "Poster format": "\u6d77\u62a5\u5f62\u5f0f",
        "INFOSCI301 poster and data story": "INFOSCI301 \u6d77\u62a5\u4e0e\u6570\u636e\u53d9\u4e8b",
        "A final poster project combining data collection, visualization, and narrative framing. The PDF is included directly as project evidence.": "\u4e00\u4e2a\u7ed3\u5408\u6570\u636e\u6536\u96c6\u3001\u53ef\u89c6\u5316\u4e0e\u53d9\u4e8b\u7ed3\u6784\u7684\u8bfe\u7a0b\u6700\u7ec8\u6d77\u62a5\u9879\u76ee\uff0cPDF \u76f4\u63a5\u4f5c\u4e3a\u9879\u76ee\u8bc1\u636e\u5448\u73b0\u3002",
        "Open PDF": "\u6253\u5f00 PDF",
        "Visual design": "\u89c6\u89c9\u8bbe\u8ba1",
        "Student worker": "\u5b66\u751f\u52a9\u7406",
        "Japanese course sticker system": "\u65e5\u8bed\u8bfe\u7a0b\u8d34\u7eb8\u7cfb\u7edf",
        "Sticker and promotional material design for DKU Japanese courses, balancing educational motivation with cultural references and print decisions.": "\u4e3a DKU \u65e5\u8bed\u8bfe\u7a0b\u8bbe\u8ba1\u8d34\u7eb8\u4e0e\u5ba3\u4f20\u7269\u6599\uff0c\u5728\u5b66\u4e60\u6fc0\u52b1\u3001\u65e5\u672c\u6587\u5316\u5143\u7d20\u4e0e\u5370\u5237\u9009\u62e9\u4e4b\u95f4\u505a\u5e73\u8861\u3002",
        "Skills": "\u6280\u80fd",
        "Switching between design intent and technical execution.": "\u5728\u8bbe\u8ba1\u610f\u56fe\u4e0e\u6280\u672f\u5b9e\u73b0\u4e4b\u95f4\u5207\u6362\uff0c\u662f\u6211\u6700\u7a33\u5b9a\u7684\u5de5\u4f5c\u65b9\u5f0f\u3002",
        "Design & creative tools": "\u8bbe\u8ba1\u4e0e\u521b\u610f\u5de5\u5177",
        "Programming & technical stack": "\u7f16\u7a0b\u4e0e\u6280\u672f\u6808",
        "Hybrid strengths": "\u590d\u5408\u80fd\u529b",
        "ComfyUI workflows, game-based learning, visual communication, process documentation, and bilingual presentation.": "ComfyUI \u5de5\u4f5c\u6d41\u3001\u6e38\u620f\u5316\u5b66\u4e60\u3001\u89c6\u89c9\u8868\u8fbe\u3001\u8fc7\u7a0b\u6587\u6863\u6574\u7406\uff0c\u4ee5\u53ca\u53cc\u8bed\u5c55\u793a\u80fd\u529b\u3002",
        "Timeline": "\u7ecf\u5386\u65f6\u95f4\u7ebf",
        "Education, projects, and signals of growth.": "\u628a\u6559\u80b2\u3001\u9879\u76ee\u548c\u80fd\u529b\u589e\u957f\u4fe1\u53f7\u653e\u5728\u540c\u4e00\u6761\u65f6\u95f4\u7ebf\u4e0a\u3002",
        "MSc in Innovative Multimedia Entertainment.": "\u521b\u65b0\u591a\u5a92\u4f53\u5a31\u4e50\u7406\u5b66\u7855\u58eb\u3002",
        "VR development volunteer": "VR \u5f00\u53d1\u5fd7\u613f\u8005",
        "Worked with VR interaction, ceramic-themed scenes, OpenXR setup, and MetaSDK-related implementation.": "\u53c2\u4e0e VR \u4ea4\u4e92\u3001\u9676\u74f7\u4e3b\u9898\u573a\u666f\u3001OpenXR \u6d41\u7a0b\u4e0e MetaSDK \u76f8\u5173\u5b9e\u73b0\u3002",
        "Pixel Nihongo capstone": "Pixel Nihongo \u6bd5\u4e1a\u8bbe\u8ba1",
        "Designed a playful learning loop that turns language progress into game interaction.": "\u8bbe\u8ba1\u4e86\u4e00\u4e2a\u5c06\u8bed\u8a00\u8fdb\u6b65\u8f6c\u5316\u4e3a\u6e38\u620f\u4ea4\u4e92\u53cd\u9988\u7684\u5b66\u4e60\u5faa\u73af\u3002",
        "Creative video and visual design work": "\u521b\u610f\u89c6\u9891\u4e0e\u89c6\u89c9\u8bbe\u8ba1\u5de5\u4f5c",
        "Led student video production tasks and designed sticker materials for course communication.": "\u8d1f\u8d23\u5b66\u751f\u89c6\u9891\u5236\u4f5c\u534f\u4f5c\uff0c\u5e76\u4e3a\u8bfe\u7a0b\u4f20\u64ad\u8bbe\u8ba1\u8d34\u7eb8\u7269\u6599\u3002",
        "Signals of growth": "\u6210\u957f\u4fe1\u53f7",
        "Dean's List, scholarship support, TOEFL 96, CET-4 618, Tencent game-art related learning.": "\u9662\u957f\u540d\u5f55\u3001\u5956\u5b66\u91d1\u652f\u6301\u3001TOEFL 96\u3001\u56db\u7ea7 618\uff0c\u4ee5\u53ca\u817e\u8baf\u6e38\u620f\u7f8e\u672f\u76f8\u5173\u5b66\u4e60\u7ecf\u5386\u3002",
        "Visual archive": "\u89c6\u89c9\u6863\u6848",
        "Earlier materials that still show texture, atmosphere, and range.": "\u4e00\u4e9b\u66f4\u65e9\u671f\u7684\u7d20\u6750\uff0c\u4ecd\u7136\u80fd\u8bf4\u660e\u6211\u7684\u98ce\u683c\u3001\u6c1b\u56f4\u611f\u548c\u8de8\u5ea6\u3002",
        "Mood and atmosphere": "\u6c1b\u56f4\u4e0e\u57fa\u8c03",
        "I use older cityscape, texture, and environment images here to show the visual atmosphere that often informs my newer work.": "\u6211\u628a\u65e9\u671f\u7684\u57ce\u5e02\u3001\u7eb9\u7406\u548c\u73af\u5883\u7c7b\u56fe\u50cf\u653e\u5728\u8fd9\u91cc\uff0c\u4f5c\u4e3a\u540e\u6765\u9879\u76ee\u6c14\u8d28\u548c\u89c6\u89c9\u504f\u597d\u7684\u6765\u6e90\u3002",
        "3D and object thinking": "3D \u4e0e\u7269\u4ef6\u601d\u7ef4",
        "The mascot render and Arduino project photos remain useful as evidence of earlier making, prototyping, and playful object-based thinking.": "\u5409\u7965\u7269\u6e32\u67d3\u548c Arduino \u9879\u76ee\u7167\u7247\u4ecd\u7136\u80fd\u4f5c\u4e3a\u6211\u65e9\u671f\u5236\u4f5c\u3001\u539f\u578b\u5b9e\u8df5\u548c\u7269\u4ef6\u601d\u7ef4\u7684\u8bc1\u636e\u3002",
        "Open to multimedia design, creative technology, and interactive media opportunities.": "\u6b63\u5728\u5bfb\u627e\u591a\u5a92\u4f53\u8bbe\u8ba1\u3001\u521b\u610f\u6280\u672f\u4e0e\u4e92\u52a8\u5a92\u4f53\u76f8\u5173\u673a\u4f1a\u3002",
        "Direct contact": "\u76f4\u63a5\u8054\u7cfb",
        "Suzhou / Hong Kong": "\u82cf\u5dde / \u4e2d\u56fd\u9999\u6e2f",
        "Portfolio trail": "\u4f5c\u54c1\u5165\u53e3",
        "Browse archived art page": "\u67e5\u770b\u65e7\u7248\u827a\u672f\u9875\u9762",
        "Browse archived project page": "\u67e5\u770b\u65e7\u7248\u9879\u76ee\u9875\u9762",
        "Read UE lighting journal": "\u9605\u8bfb UE \u706f\u5149\u6587\u6863",
        "Built as a bilingual portfolio homepage for stable job applications and memorable viewer interaction.": "\u8fd9\u4e2a\u53cc\u8bed\u9996\u9875\u4e3a\u66f4\u7a33\u5b9a\u7684\u6c42\u804c\u6295\u9012\u800c\u8bbe\u8ba1\uff0c\u540c\u65f6\u4fdd\u7559\u4e0e\u8bbf\u5ba2\u4e92\u52a8\u7684\u7a7a\u95f4\u3002"
    };

    const audienceMessages = {
        recruiter: {
            en: "Start with the selected work section to see role fit, technical range, and evidence of execution.",
            zh: "\u5efa\u8bae\u5148\u770b\u7cbe\u9009\u9879\u76ee\u533a\uff0c\u80fd\u6700\u5feb\u5224\u65ad\u5c97\u4f4d\u5339\u914d\u5ea6\u3001\u6280\u672f\u8de8\u5ea6\u4e0e\u6267\u884c\u8bc1\u636e\u3002"
        },
        collaborator: {
            en: "Jump between About, Skills, and the project cards to understand how I communicate, document, and collaborate across media.",
            zh: "\u53ef\u4ee5\u91cd\u70b9\u67e5\u770b\u5173\u4e8e\u6211\u3001\u6280\u80fd\u533a\u4e0e\u9879\u76ee\u5361\uff0c\u4e86\u89e3\u6211\u5982\u4f55\u6c9f\u901a\u3001\u6574\u7406\u6d41\u7a0b\u5e76\u8de8\u5a92\u4ecb\u534f\u4f5c\u3002"
        },
        explorer: {
            en: "Browse more freely and use filters to see the side of the portfolio you care about most.",
            zh: "\u53ef\u4ee5\u66f4\u81ea\u7531\u5730\u6d4f\u89c8\uff0c\u5e76\u7528\u7b5b\u9009\u6309\u94ae\u627e\u5230\u4f60\u6700\u611f\u5174\u8da3\u7684\u9879\u76ee\u7c7b\u578b\u3002"
        }
    };

    const modeMessages = {
        design: {
            en: "Design mode brings visual communication, audience experience, and polished presentation closer to the front.",
            zh: "\u8bbe\u8ba1\u6a21\u5f0f\u4f1a\u628a\u89c6\u89c9\u8868\u8fbe\u3001\u89c2\u4f17\u4f53\u9a8c\u4e0e\u5448\u73b0\u5b8c\u6210\u5ea6\u653e\u5230\u66f4\u524d\u9762\u3002"
        },
        tech: {
            en: "Tech mode raises system thinking, implementation evidence, and tool-chain depth.",
            zh: "\u6280\u672f\u6a21\u5f0f\u4f1a\u5f3a\u5316\u7cfb\u7edf\u601d\u7ef4\u3001\u5b9e\u73b0\u8bc1\u636e\u4e0e\u5de5\u5177\u94fe\u6df1\u5ea6\u3002"
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
            const english = node.dataset.en;
            const chinese = node.dataset.zh;

            if (!english) {
                return;
            }

            if (lang === "zh") {
                node.textContent = chinese || zh[english] || english;
            } else {
                node.textContent = english;
            }
        });

        langToggleLabel.textContent = lang === "zh" ? "EN" : "\u4e2d\u6587";
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
        cards.sort((a, b) => Number(a.dataset[key]) - Number(b.dataset[key])).forEach((card) => projectGrid.appendChild(card));

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

