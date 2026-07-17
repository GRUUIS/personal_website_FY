(function () {
    const body = document.body;
    const langToggle = document.getElementById("lang-toggle");
    const translatableNodes = document.querySelectorAll("[data-en]");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const projectCards = document.querySelectorAll(".project-card");
    const gameCloud = document.getElementById("game-cloud");
    const gameFilter = document.getElementById("game-filter");

    const categories = {
        all: { zh: "全部", en: "All" }, rpg: { zh: "RPG / MMO", en: "RPG / MMO" },
        shooter: { zh: "射击 / 竞技", en: "Shooter / PvP" }, narrative: { zh: "叙事 / 单机", en: "Narrative / PC" },
        rhythm: { zh: "音游", en: "Rhythm" }, tabletop: { zh: "棋牌", en: "Tabletop" },
        otome: { zh: "女性向", en: "Otome" }, sim: { zh: "经营 / 休闲", en: "Simulation" }
    };
    const colors = { rpg: "#61d6cf", shooter: "#ff785f", narrative: "#e8abc0", rhythm: "#f3d05d", tabletop: "#a9c9ff", otome: "#d7a9ff", sim: "#a8d78d" };

    const detailedGames = [
        ["splatoon3", "Splatoon 3", "Splatoon 3", ["shooter"], 8,
            "500+ 小时 · 最高段位 B+ · 鲑鱼跑 传说100", "500+ hours · Peak rank B+ · Salmon Run EVP 100",
            "深入体验墨水机制、地图控制、PVP 涂地循环与 PVE 鲑鱼跑，并从关卡设计角度分析地图 POI、玩家路径、交战热点和攻防转换节奏。", "I study ink mechanics, map control, PvP turf loops and Salmon Run, analysing POIs, player routes, combat hotspots and attack–defence transitions as a level designer.",
            ["墨水机制", "地图动线", "PVP / PVE", "关卡拆解"], ["Ink mechanics", "Player routes", "PvP / PvE", "Level analysis"]],
        ["yanyun", "燕云十六声", "Where Winds Meet", ["rpg"], 8,
            "600+ 小时 · 等级 80/100 · 清河、开封探索完成", "600+ hours · Level 80/100 · Qinghe and Kaifeng explored",
            "关注开放世界任务如何通过建筑、人物行动、物件与环境变化组织空间叙事；并将体验转化为任务目标、地图草图、玩家路径和事件触发原型。", "I study how architecture, actions, objects and environmental change form spatial narratives, then translate play into quest goals, map sketches, routes and trigger prototypes.",
            ["空间叙事", "任务设计", "开放世界", "单人原型"], ["Spatial narrative", "Quest design", "Open world", "Solo prototype"]],
        ["fgo", "Fate/Grand Order", "Fate/Grand Order", ["rpg"], 8,
            "持续游玩 8 年 · 御主等级 149/170 · 主线奏章三", "8 years · Master Lv.149/170 · Ordeal Call III",
            "长期关注其如何整合不同作品、历史与传说角色，以及角色塑造、卡牌养成和限时活动如何建立长期情感联系。完成过高难本、无限池100与虚数大海战。", "I follow how the game unifies works, history and legend, and how character writing, card progression and limited events build long-term attachment.",
            ["IP整合", "角色养成", "活动运营", "长期情感"], ["IP integration", "Character growth", "Live ops", "Attachment"]],
        ["loveanddeepspace", "恋与深空", "Love and Deepspace", ["otome", "rpg"], 7,
            "约 600 小时 · 夏以昼卡面全收集", "About 600 hours · All Caleb cards collected",
            "关注角色陪伴、互动反馈、剧情更新与卡牌养成如何共同维持长期情感体验。", "I observe how companionship, interaction feedback, story updates and card progression sustain long-term emotional engagement.",
            ["角色陪伴", "互动反馈", "内容更新"], ["Companionship", "Interaction", "Content updates"]],
        ["zzz", "绝区零", "Zenless Zone Zero", ["rpg"], 6,
            "约 200 小时 · 绳网等级 50 · 主线第三章", "About 200 hours · Inter-Knot Lv.50 · Chapter 3",
            "主要使用雨果、仪玄、莱特，关注录像店、街区 NPC 与日常委托如何建立具有生活感的都市世界。", "I focus on how the video store, neighbourhood NPCs and commissions make the city feel lived in.",
            ["都市世界", "日常任务", "NPC生态"], ["Urban world", "Daily quests", "NPC ecology"]],
        ["hsr", "崩坏：星穹铁道", "Honkai: Star Rail", ["rpg"], 6,
            "约 100 小时 · 主线第三章", "About 100 hours · Chapter 3",
            "主要培养白厄、Archer 与星期日，除主线外重点体验模拟宇宙的肉鸽构筑和重复游玩变化。", "I build Phainon, Archer and Sunday, with particular interest in Simulated Universe's roguelike builds and replay variation.",
            ["回合制", "肉鸽构筑", "角色养成"], ["Turn-based", "Roguelike builds", "Progression"]],
        ["pjsk", "初音未来：缤纷舞台", "HATSUNE MIKU: COLORFUL STAGE!", ["rhythm"], 6,
            "约 200 小时 · 玩家等级 60 · 28级 Full Combo", "About 200 hours · Player Lv.60 · Lv.28 Full Combo",
            "关注谱面节奏、角色卡面收集，以及活动角色剧情如何连接演奏与长期内容。", "I follow chart rhythm, card collection and the way event stories connect performance with long-term content.",
            ["谱面", "节奏反馈", "卡面收集"], ["Chart design", "Rhythm feedback", "Card collection"]],
        ["mahjongsoul", "雀魂", "Mahjong Soul", ["tabletop"], 6,
            "约 200 小时 · 最高段位雀豪", "About 200 hours · Peak rank: Master",
            "主要参与四人东与四人南，长期游玩逐步建立牌效、局势判断和风险控制意识。", "I mainly play four-player East and South matches, developing tile efficiency, situation reading and risk control.",
            ["牌效", "风险控制", "局势判断"], ["Tile efficiency", "Risk control", "Situation reading"]],
        ["chants", "巴别塔圣歌", "Chants of Sennaar", ["narrative"], 6,
            "约 20 小时 · 全流程通关 · 成就 22/25", "About 20 hours · Completed · 22/25 achievements",
            "语言破译本身就是核心玩法。人物动作、壁画、建筑和上下文共同传递信息，让环境与玩家主动推理成为任务内容。", "Language deciphering is the core mechanic: gestures, murals, architecture and context turn the environment and active inference into quest content.",
            ["语言破译", "环境叙事", "主动推理"], ["Deciphering", "Environmental story", "Inference"]],
        ["detroit", "底特律：变人", "Detroit: Become Human", ["narrative"], 6,
            "约 40 小时 · 2个最终结局 · 成就 30/48", "About 40 hours · 2 endings · 30/48 achievements",
            "关注多角色视角、限时选择和分支回收，以及流程图如何呈现节点、角色关系、存活状态与前期选择的后续汇合。", "I focus on multi-character viewpoints, timed choices, branch convergence and how the flowchart communicates state and consequence.",
            ["分支叙事", "状态管理", "选择反馈"], ["Branching narrative", "State management", "Choice feedback"]],
        ["cyberpunk", "赛博朋克2077", "Cyberpunk 2077", ["narrative", "rpg"], 6,
            "约 100 小时 · 本体及DLC · 太阳、节制结局", "About 100 hours · Base game and DLC · Sun and Temperance endings",
            "使用枪械、武士刀与黑客技能体验不同战斗路径；支线任务像一篇篇独立的赛博朋克短篇，以人物处境补完整座城市。", "I explored gun, katana and hacking paths. Its side quests feel like self-contained stories that complete the city through individual lives.",
            ["支线叙事", "战斗流派", "城市塑造"], ["Side stories", "Build variety", "City building"]],
        ["shengshi", "盛世天下 1&2", "Road to Empress 1&2", ["narrative"], 5,
            "约 60 小时 · 全流程通关", "About 60 hours · Both games completed",
            "关注历史背景下的人物关系、身份危机和选择反馈，以及真人影像、服化道、镜头与玩家操作如何共同建立代入感。", "I focus on relationships, identity crises and choice feedback, and how live action, costume, camera, pacing and input create immersion.",
            ["真人影像", "历史改编", "演出节奏"], ["FMV", "Historical adaptation", "Performance"]],
        ["invisible", "隐形守护者", "The Invisible Guardian", ["narrative"], 5,
            "约 20 小时 · 一周目完成 · 成就 18/20", "About 20 hours · One playthrough · 18/20 achievements",
            "通过真人影像、身份压力与高频选择体验分支叙事，关注信息差和关系变化如何持续制造决策压力。", "Its live action, identity pressure and frequent choices frame branching narrative through information gaps and changing relationships.",
            ["互动影像", "身份压力", "多分支"], ["Interactive film", "Identity pressure", "Branches"]],
        ["gris", "GRIS", "GRIS", ["narrative"], 5,
            "视觉叙事 / 解谜探索", "Visual narrative / Puzzle exploration",
            "通过色彩、构图、空间变化和动作而非密集对白表达情绪，展示视觉本身如何承担叙事功能。", "Colour, composition, spatial change and movement carry emotion without dense dialogue.",
            ["色彩", "构图", "情绪叙事"], ["Colour", "Composition", "Emotional story"]],
        ["stardew", "星露谷物语", "Stardew Valley", ["sim", "rpg"], 5,
            "经营 / 收集 / 社交", "Farming / Collection / Social",
            "关注种植、采集、钓鱼、下矿、NPC 好感、节日、体力、时间与季节如何构成低压力长线循环。", "I study how farming, gathering, fishing, mining, relationships, stamina, time and seasons form a low-pressure long-term loop.",
            ["长线循环", "自主目标", "NPC关系"], ["Long loop", "Self-set goals", "NPC relations"]]
    ];

    const simpleGames = [
        ["ensemble", "偶像梦幻祭", "Ensemble Stars!!", ["rhythm", "otome"], 5, "约 200 小时 · 节奏 / 偶像养成", "About 200 hours · Rhythm / Idol progression", "以多难度谱面和 3D 演唱会为核心，卡牌编队影响得分与演出表现。角色群像、活动剧情、服装和 MV 构成长线内容循环，让收集目标与舞台表达相互推动。", "Multi-difficulty charts and 3D concerts form the core, while card line-ups shape scores and performances. Ensemble stories, events, costumes and music videos connect collection goals with stage expression.", ["3D演唱会", "卡牌编队", "活动循环"], ["3D concerts", "Card line-ups", "Event loop"]],
        ["peaceelite", "和平精英", "Game for Peace", ["shooter"], 4, "战术竞技 / 生存射击", "Battle royale / Survival shooter", "玩家在大型地图搜集枪械、护具与补给，随安全区收缩进行转移、侦察和交战。资源随机性、地形信息与队伍沟通共同制造风险判断，每局路线都会形成新的战术故事。", "Players loot weapons, armour and supplies across a large map, rotating and fighting as the safe zone contracts. Resource variance, terrain knowledge and squad communication create risk decisions and a new tactical story each match.", ["安全区", "资源搜集", "小队协作"], ["Safe zone", "Looting", "Squad play"]],
        ["deltaforce", "三角洲行动", "Delta Force", ["shooter"], 4, "大战场 / 搜打撤", "Large-scale warfare / Extraction", "大战场模式以载具、据点和兵种协作组织正面推进；行动模式围绕搜集物资、交战与成功撤离建立高风险收益循环。两种模式共享写实枪械基础，同时提供不同的节奏与决策密度。", "Warfare organises pushes through vehicles, objectives and class teamwork; Operations builds a high-risk loop around looting, combat and extraction. Both share grounded gunplay while producing distinct pacing and decision density.", ["据点推进", "搜打撤", "风险收益"], ["Objective pushes", "Extraction", "Risk and reward"]],
        ["terraria", "泰拉瑞亚", "Terraria", ["rpg", "sim"], 4, "2D 沙盒 / 探索建造", "2D sandbox / Exploration and building", "采矿、制作、建造、探索与战斗在同一世界持续衔接，Boss 与环境阶段逐步开放新的材料和区域。明确的装备成长为自由沙盒提供方向，同时保留基地建设与职业流派的个人表达。", "Mining, crafting, building, exploration and combat connect within one world, while bosses and world stages unlock new materials and regions. Equipment progression gives direction to the sandbox while preserving expressive building and class builds.", ["沙盒探索", "制作成长", "Boss门槛"], ["Sandbox", "Crafting progression", "Boss gates"]],
        ["hades", "哈迪斯", "Hades", ["rpg", "narrative"], 5, "动作肉鸽 / 循环叙事", "Action roguelike / Looping narrative", "每次逃离地狱都会重新组合房间、武器强化与诸神祝福，死亡后则以永久成长和角色对话继续推进。失败被转化为叙事节拍，使重复挑战持续产生战斗构筑与人物关系的新内容。", "Each escape recombines rooms, weapon upgrades and divine boons; death advances permanent growth and character dialogue. Failure becomes a narrative beat, keeping repeated runs fresh through builds and relationships.", ["随机构筑", "死亡反馈", "循环叙事"], ["Random builds", "Death feedback", "Looping story"]],
        ["journey", "Journey", "Journey", ["narrative"], 4, "探索 / 无语言协作", "Exploration / Wordless co-op", "玩家依靠移动、滑行、鸣叫与布条能量穿越沙漠和遗迹，环境构图承担方向引导。匿名同行者只能用简单声音交流，有限沟通强化了陪伴、分离与抵达的情绪。", "Movement, gliding, calls and scarf energy carry the player through deserts and ruins, with composition guiding the route. Anonymous companions communicate only through simple sounds, intensifying companionship, separation and arrival.", ["环境引导", "匿名协作", "情绪节奏"], ["Environmental guidance", "Anonymous co-op", "Emotional pacing"]],
        ["cybermanhunt", "全网公敌", "Cyber Manhunt", ["narrative"], 4, "网络调查 / 信息解谜", "Cyber investigation / Information puzzle", "搜索、社交工程、密码破解与数据拼接构成调查流程，玩家从碎片信息推导人物关系和事件真相。电脑界面直接成为谜题空间，现实网络操作被抽象成清晰的推理链。", "Search, social engineering, password cracking and data assembly form the investigation loop. The desktop interface becomes the puzzle space, turning real online behaviours into readable chains of inference.", ["信息拼接", "界面叙事", "网络调查"], ["Information assembly", "Interface narrative", "Cyber investigation"]],
        ["acecombat", "皇牌空战", "Ace Combat", ["shooter"], 4, "街机空战 / 任务驱动", "Arcade flight combat / Missions", "高速飞行、锁定导弹、机炮和机体选择组成易读的空战循环，任务目标不断改变交战优先级。无线电对白与战场事件在操作过程中推进剧情，让玩家以飞行员身份参与宏观战争。", "High-speed flight, lock-on missiles, guns and aircraft choice form a readable combat loop, while mission goals shift priorities. Radio dialogue and battlefield events advance the story during play.", ["空战节奏", "任务目标", "无线电叙事"], ["Air-combat pacing", "Mission goals", "Radio narrative"]],
        ["eliteclub", "菁英会客厅", "Elite Club", ["narrative"], 3, "ARG / 跨媒介解谜", "ARG / Transmedia puzzle", "玩家通过网页信息、文本线索和跨媒介材料推进调查，需要辨认信息来源并建立线索关联。真实媒介的呈现方式缩短了虚构世界与玩家生活之间的距离，沉浸感来自主动求证。", "Players investigate through web information, textual clues and cross-media materials, judging sources and connecting evidence. Familiar media narrows the distance between fiction and everyday life, with immersion emerging through active verification.", ["跨媒介", "线索关联", "主动求证"], ["Transmedia", "Clue linking", "Active verification"]],
        ["mahoyoru", "魔法使之夜", "Witch on the Holy Night", ["narrative"], 4, "视觉小说 / 电影化演出", "Visual novel / Cinematic direction", "阅读、角色表演、音乐和画面调度共同推进故事，精细的转场与特效赋予静态素材强烈的时间感。它展示了视觉小说如何通过镜头语言控制信息、悬念和情绪强度。", "Reading, character performance, music and visual staging advance the story. Detailed transitions and effects give static assets a strong sense of time and cinematic control.", ["镜头语言", "演出节奏", "视觉小说"], ["Cinematic language", "Pacing", "Visual novel"]],
        ["musedash", "喵斯快跑", "Muse Dash", ["rhythm"], 4, "双轨音游 / 跑酷", "Two-lane rhythm / Runner", "玩家用少量按键处理上下两轨的敌人、长按与障碍，跑酷动作把节拍判定转化为直观的攻击反馈。角色与精灵技能提供轻量构筑，谱面难度支撑从入门到追求 Full Combo 的成长。", "A small input set handles enemies, holds and obstacles across two lanes, translating timing into readable attack feedback. Character and Elfin abilities add light build choices, while chart difficulty supports mastery.", ["双轨输入", "动作反馈", "谱面成长"], ["Two-lane input", "Action feedback", "Chart mastery"]],
        ["trombone", "长号冠军", "Trombone Champ", ["rhythm"], 3, "连续音高 / 喜剧音游", "Continuous pitch / Comedy rhythm", "鼠标或摇杆连续控制音高，吹奏时机控制发声，玩家拥有偏离旋律和自由即兴的空间。滑音误差会直接变成夸张演奏效果，失败反馈由挫败转向喜剧。", "Mouse or stick movement controls continuous pitch while timing controls the note. Players can deviate and improvise, and sliding errors become exaggerated performance and comedy.", ["连续控制", "自由即兴", "喜剧反馈"], ["Continuous control", "Improvisation", "Comedy feedback"]],
        ["dancingline", "跳舞的线", "Dancing Line", ["rhythm"], 3, "单键节奏 / 路径记忆", "One-touch rhythm / Route memory", "点击使线条转向，玩家依靠音乐重拍、场景变化和路径预判穿越关卡。单键规则降低理解门槛，后续通过遮挡、速度和转向密度逐步考验节奏记忆。", "A tap turns the line, with musical accents, scenery changes and route anticipation guiding each level. Occlusion, speed and turn density progressively test rhythm memory.", ["单键操作", "视听同步", "路径记忆"], ["One-touch", "Audio-visual sync", "Route memory"]],
        ["girlsthrone", "少女的王座", "The Girl's Throne", ["otome"], 4, "剧情 RPG / 角色养成", "Narrative RPG / Character progression", "主线剧情、角色关系与队伍战斗共同推进西幻冒险，卡牌和服装承担养成与视觉收集。叙事选择负责情感投入，战斗成长为章节推进提供阶段目标。", "Main story, relationships and party combat advance a fantasy adventure, with cards and outfits supporting progression and visual collection.", ["剧情RPG", "角色关系", "服装收集"], ["Narrative RPG", "Relationships", "Outfit collection"]],
        ["yujunmeng", "与君盟", "A Pact with You", ["otome"], 3, "单机乙女 / 历史幻想", "Single-player otome / Historical fantasy", "玩家以女扮男装的吴王夫差推进春秋幻想故事，通过选择进入不同人物路线与结局。身份秘密、国家责任和私人情感形成持续冲突，让攻略对象同时承担政治立场。", "The player leads a Spring and Autumn fantasy as King Fuchai in disguise, making choices across character routes and endings. Secret identity, state duty and emotion create sustained conflict.", ["身份冲突", "人物路线", "历史幻想"], ["Identity conflict", "Character routes", "Historical fantasy"]],
        ["ashesofthekingdom", "代号鸢", "Ashes of the Kingdom", ["otome", "rpg"], 4, "剧情卡牌 / 情报系统", "Narrative cards / Intelligence system", "玩家通过情报调查推进乱世主线，以密探卡牌编队处理回合制战斗，并通过互动内容深化人物关系。情报、战斗与角色支线从不同角度补充同一局势，形成群像叙事。", "Intelligence investigations advance the story, agent card teams handle turn-based battles, and interactions deepen relationships across an ensemble narrative.", ["情报调查", "卡牌编队", "群像叙事"], ["Intelligence", "Card teams", "Ensemble narrative"]],
        ["nightfall", "夜幕之下", "Under Nightfall", ["otome"], 3, "策略卡牌 / 家族经营", "Strategy cards / Family management", "横版战斗结合站位、射程、技能冷却、属性破防与队伍编成，家族产业负责提供资源和日常事件。分支剧情把权力选择与角色关系放在同一决策框架中。", "Side-view combat combines positioning, range, cooldowns, weakness breaks and team composition, while family businesses supply resources and events.", ["横版战斗", "产业经营", "分支剧情"], ["Side-view combat", "Business management", "Branches"]],
        ["friendcollection", "朋友收集梦想生活", "Tomodachi Life", ["sim"], 3, "社交模拟 / 涌现叙事", "Social simulation / Emergent story", "玩家创建亲友或原创 Mii，让他们在岛上自主生活、交友、争执和恋爱，再通过建议与赠礼适度介入。角色组合与随机事件持续生成难以预写的喜剧和关系故事。", "Players create Mii characters who live, befriend, argue and fall in love autonomously, then intervene through advice and gifts. Random events generate unscripted comedy and relationships.", ["角色创建", "自主行为", "涌现故事"], ["Character creation", "Autonomy", "Emergent story"]],
        ["breakfast", "楼下的早餐店", "Breakfast Story", ["sim"], 3, "时间管理 / 餐厅经营", "Time management / Restaurant", "玩家按订单制作早餐、安排加工顺序并控制顾客等待时间，再用收益升级设备和解锁店铺。逐渐增加的菜品组合提升操作压力，顾客故事为重复关卡提供生活温度。", "Players prepare orders, sequence cooking tasks and manage patience, then upgrade equipment and unlock shops. Expanding recipes increase pressure, while customer stories humanise repeated stages.", ["订单节奏", "设备升级", "顾客故事"], ["Order pacing", "Upgrades", "Customer stories"]],
        ["animalrestaurant", "动物餐厅", "Animal Restaurant", ["sim"], 3, "放置经营 / 收集", "Idle management / Collection", "菜谱、家具、员工与设施升级共同提升餐厅收益，新客人通过特定条件逐步解锁。温和的放置回报与大量图鉴目标组成低压力返场循环，角色小故事承担情感奖励。", "Recipes, furniture, staff and facility upgrades grow the restaurant, while guests unlock through specific conditions. Idle returns and collections create a gentle return loop.", ["放置收益", "图鉴解锁", "温和经营"], ["Idle returns", "Collection", "Gentle management"]],
        ["travelfrog", "旅行青蛙", "Travel Frog", ["sim"], 3, "异步养成 / 收集", "Asynchronous care / Collection", "玩家为青蛙准备食物和旅行用品，之后等待它自行出发并寄回照片与特产。有限控制保留了未知感，异步反馈把现实时间转化为牵挂和惊喜。", "Players prepare food and travel items, then wait for the frog to depart and send back photos and souvenirs. Limited control turns real time into anticipation and surprise.", ["异步反馈", "有限控制", "明信片收集"], ["Asynchronous feedback", "Limited control", "Postcard collection"]],
        ["honorofkings", "王者荣耀", "Honor of Kings", ["shooter"], 4, "5V5 MOBA / 团队竞技", "5v5 MOBA / Team competition", "分路发育、英雄技能、装备经济、防御塔与中立目标共同构成推进循环。移动端短局设计压缩了决策窗口，阵容分工、视野信息与团战时机决定资源如何转化为胜势。", "Lanes, hero abilities, item economy, towers and neutral objectives form the push loop. Team roles, information and fight timing turn resources into advantage.", ["分路经济", "团队分工", "目标控制"], ["Lane economy", "Team roles", "Objective control"]],
        ["onmyojiarena", "决战！平安京", "Onmyoji Arena", ["shooter"], 4, "5V5 MOBA / 式神体系", "5v5 MOBA / Shikigami roster", "传统分路、野区和推塔框架结合式神技能与免费阴阳术配置，赛前构筑影响对线和团战定位。成熟 IP 的角色辨识度降低学习成本，也让技能机制与人物设定形成呼应。", "Traditional lanes, jungle and tower pushes combine with Shikigami kits and free Onmyodo loadouts. Recognisable characters align mechanics with identity.", ["阴阳术", "式神定位", "公平竞技"], ["Onmyodo", "Hero roles", "Fair competition"]],
        ["vainglory", "虚荣", "Vainglory", ["shooter"], 3, "触控 MOBA / 竞技", "Touch MOBA / Competition", "3V3 与 5V5 模式围绕分路、野区、装备和大型目标展开，点触操作提供精确走位与目标选择。小队规模提高了单次失误权重，也强化轮转、视野与即时协作。", "Its 3v3 and 5v5 modes revolve around lanes, jungle, items and objectives, with touch controls enabling precise movement. Small teams sharpen rotations, vision and coordination.", ["点触操作", "小队轮转", "视野控制"], ["Touch controls", "Rotations", "Vision control"]],
        ["sanguosha", "三国杀", "Legends of the Three Kingdoms", ["tabletop"], 4, "身份卡牌 / 社交博弈", "Hidden-role cards / Social strategy", "玩家结合主公、忠臣、反贼或内奸身份目标，使用武将技能与基本牌、锦囊牌展开回合对抗。隐藏阵营让出牌同时传递立场信息，技能组合与社交判断共同影响胜负。", "Players pursue hidden role goals through character abilities, basic cards and tactics. Every card can signal intent, combining skill interactions with social inference.", ["隐藏身份", "武将技能", "社交推理"], ["Hidden roles", "Character skills", "Social inference"]]
    ];

    function normalizeDetailed(row) {
        return { id: row[0], title: { zh: row[1], en: row[2] }, categories: row[3], weight: row[4], metric: { zh: row[5], en: row[6] }, summary: { zh: row[7], en: row[8] }, tags: { zh: row[9], en: row[10] } };
    }
    function normalizeSimple(row) {
        return { id: row[0], title: { zh: row[1], en: row[2] }, categories: row[3], weight: row[4], metric: { zh: row[5], en: row[6] }, summary: { zh: row[7], en: row[8] }, tags: { zh: row[9], en: row[10] } };
    }
    const gameData = detailedGames.map(normalizeDetailed).concat(simpleGames.map(normalizeSimple));
    let currentGame = "splatoon3";
    let currentCategory = "all";

    function lang() { return body.dataset.lang || "zh"; }
    function fallback(game, language) {
        const category = categories[game.categories[0]][language];
        return {
            metric: language === "zh" ? `${category} · 涉猎作品` : `${category} · Played title`,
            summary: language === "zh" ? "这款作品构成了我的跨品类游戏体验之一。我会从核心循环、反馈方式、内容节奏与目标玩家等角度持续积累观察。" : "This title contributes to my cross-genre play history. I observe its core loop, feedback, content pacing and intended player experience.",
            tags: language === "zh" ? [category, "玩法体验", "品类观察"] : [category, "Play experience", "Genre study"]
        };
    }

    function renderDetail(gameId) {
        if (!gameCloud) return;
        const language = lang();
        const game = gameData.find((item) => item.id === gameId) || gameData[0];
        const copy = fallback(game, language);
        document.getElementById("detail-category").textContent = game.categories.map((key) => categories[key][language]).join(" / ");
        document.getElementById("detail-title").textContent = game.title[language];
        document.getElementById("detail-metric").textContent = game.metric ? game.metric[language] : copy.metric;
        document.getElementById("detail-summary").textContent = game.summary ? game.summary[language] : copy.summary;
        const tagContainer = document.getElementById("detail-tags");
        tagContainer.replaceChildren(...(game.tags ? game.tags[language] : copy.tags).map((tag) => {
            const span = document.createElement("span"); span.textContent = tag; return span;
        }));
        currentGame = game.id;
        document.querySelectorAll(".cloud-word").forEach((button) => {
            const active = button.dataset.game === currentGame;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function renderCloud() {
        if (!gameCloud) return;
        const language = lang();
        const nodes = gameData.map((game) => {
            const button = document.createElement("button");
            button.type = "button"; button.className = "cloud-word"; button.dataset.game = game.id;
            button.style.setProperty("--weight", game.weight); button.style.setProperty("--cloud-color", colors[game.categories[0]]);
            button.textContent = game.title[language];
            button.classList.toggle("is-muted", currentCategory !== "all" && !game.categories.includes(currentCategory));
            button.addEventListener("click", () => renderDetail(game.id));
            return button;
        });
        gameCloud.replaceChildren(...nodes);
        renderDetail(currentGame);
    }

    function renderFilters() {
        if (!gameFilter) return;
        const language = lang();
        gameFilter.replaceChildren(...Object.entries(categories).map(([key, label]) => {
            const button = document.createElement("button");
            button.type = "button"; button.textContent = label[language];
            button.classList.toggle("is-active", key === currentCategory);
            button.setAttribute("aria-pressed", String(key === currentCategory));
            button.addEventListener("click", () => {
                currentCategory = key;
                if (key !== "all") {
                    const selected = gameData.find((game) => game.id === currentGame);
                    if (!selected.categories.includes(key)) currentGame = gameData.find((game) => game.categories.includes(key)).id;
                }
                renderFilters(); renderCloud();
            });
            return button;
        }));
    }

    function applyLanguage(language) {
        body.dataset.lang = language;
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        translatableNodes.forEach((node) => { if (node.dataset[language]) node.textContent = node.dataset[language]; });
        if (langToggle) langToggle.textContent = language === "zh" ? "EN" : "中文";
        localStorage.setItem("portfolio-language", language);
        renderFilters(); renderCloud();
    }

    function setFilter(filter) {
        filterButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === filter));
        projectCards.forEach((card) => {
            const values = card.dataset.category.split(" ");
            card.classList.toggle("is-hidden", filter !== "all" && !values.includes(filter));
        });
    }

    if (langToggle) langToggle.addEventListener("click", () => applyLanguage(lang() === "zh" ? "en" : "zh"));
    filterButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
    applyLanguage(localStorage.getItem("portfolio-language") || "zh");
    setFilter("all");
})();
