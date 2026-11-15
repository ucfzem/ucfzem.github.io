"use strict";

const COUNTRIES = {
  kuwait: { ar: "الكويت", en: "Kuwait", fr: "Koweït", es: "Kuwait" },
  usa: { ar: "الولايات المتحدة", en: "United States", fr: "États-Unis", es: "Estados Unidos" },
  libya: { ar: "ليبيا", en: "Libya", fr: "Libye", es: "Libia" },
  egypt: { ar: "مصر", en: "Egypt", fr: "Égypte", es: "Egipto" },
  syria: { ar: "سوريا", en: "Syria", fr: "Syrie", es: "Siria" },
  southAfrica: { ar: "جنوب أفريقيا", en: "South Africa", fr: "Afrique du Sud", es: "Sudáfrica" },
  india: { ar: "الهند", en: "India", fr: "Inde", es: "India" },
  yemen: { ar: "اليمن", en: "Yemen", fr: "Yémen", es: "Yemen" },
  iraq: { ar: "العراق", en: "Iraq", fr: "Irak", es: "Irak" },
  saudi: { ar: "السعودية", en: "Saudi Arabia", fr: "Arabie saoudite", es: "Arabia Saudita" },
  tunisia: { ar: "تونس", en: "Tunisia", fr: "Tunisie", es: "Túnez" },
  palestine: { ar: "فلسطين", en: "Palestine", fr: "Palestine", es: "Palestina" },
  britain: { ar: "بريطانيا", en: "Britain", fr: "Royaume-Uni", es: "Reino Unido" },
  canada: { ar: "كندا", en: "Canada", fr: "Canada", es: "Canadá" },
  zimbabwe: { ar: "زيمبابوي", en: "Zimbabwe", fr: "Zimbabwe", es: "Zimbabue" },
  pakistan: { ar: "باكستان", en: "Pakistan", fr: "Pakistan", es: "Pakistán" }
};

const UI = {
  ar: {
    brand: "أعلام الدعوة والفكر",
    brandSub: "UcfZem · Maktaba",
    title: "أعلام الدعوة والفكر والمناظرة في العصر الرقمي",
    eyebrow: "دليل تفاعلي · نسخة 2026",
    heroLede: "خمسة وثلاثون علمًا من ميادين الدعوة والمناظرة والفكر، في دليل واحد يجمع السيرة المختصرة، والبحث الذكي، وتجربة قراءة تعمل دون اتصال.",
    menu: "الفهرس",
    close: "إغلاق",
    indexTitle: "الفهرس",
    indexNote: "انتقل مباشرة إلى الشخصية أو القسم",
    intro: "تقديم",
    bioLink: "سيرة المؤسس",
    introKicker: "بين الميدان والمنصة",
    introTitle: "منارات في زمن الضجيج",
    introP1: "يجمع هذا الدليل نخبة من الدعاة والمحاورين والباحثين الذين صنعوا حضورًا مؤثرًا في الفضاء الرقمي والمعرفي. تتنوع ميادينهم بين العمل الميداني، ومناظرات الأديان، والرد على الشبهات، ونقد الإلحاد، والمحاضرات العالمية.",
    introP2: "صُمم الدليل ليكون مدخلًا سريعًا للتعرف على هذه الشخصيات وأبرز مجالاتها، مع بحث يعمل بالعربية والإنجليزية والفرنسية والإسبانية، وروابط مباشرة لمحتواها المرئي، وإمكانية النسخ والمشاركة.",
    bioKicker: "سيرة المؤسس",
    bioName: "هشام صدقي الإبراشي",
    bioRole: "مؤسس الدليل · UcfZem",
    bioText: "عمل على جمع هذا الدليل وتنسيقه بوصفه مرجعًا رقميًا مختصرًا لأعلام الدعوة والفكر والمناظرة. يهتم بالتنظيم المعرفي، وتيسير الوصول إلى المحتوى الموثوق، وبناء أدوات عربية تعمل دون اتصال وتصل إلى القارئ حيث كان.",
    catalogTitle: "الدليل",
    catalogNote: "35 علمًا · 6 مسارات",
    searchTitle: "ابحث في الدليل",
    searchPlaceholder: "ابحث بالاسم، التخصص، البلد أو كلمة مفتاحية…",
    searchClear: "مسح",
    searchHint: "البحث يتجاهل التشكيل وفروق الهمزات ويعمل داخل النصوص المترجمة.",
    prevMatch: "السابق",
    nextMatch: "التالي",
    noMatches: "لا توجد نتائج مطابقة",
    copy: "نسخ",
    copied: "تم النسخ",
    youtube: "شاهد على يوتيوب",
    channel: "القناة",
    card: "بطاقة",
    cards: "بطاقات",
    words: "كلمة",
    matchSummary: "تم العثور على {matches} كلمة في {cards} بطاقات",
    online: "متصل",
    offline: "وضع عدم الاتصال",
    emptyTitle: "لا توجد نتائج",
    emptyHint: "جرّب اسمًا آخر، أو امسح البحث لعرض كل الشخصيات.",
    allFigures: "كل الشخصيات",
    language: "اللغة",
    theme: "المظهر",
    reading: "حجم القراءة",
    footer: "أعلام الدعوة والفكر · دليل رقمي يعمل دون اتصال",
    footerMaktaba: "المكتبة",
    footerWorks: "أعمال أخرى",
    footerGithub: "GitHub",
    skip: "تجاوز إلى الدليل",
    top: "العودة إلى الأعلى",
    categoryPrefix: "المسار"
  },
  en: {
    brand: "Luminaries of Da'wah",
    brandSub: "UcfZem · Maktaba",
    title: "Luminaries of Da'wah, Thought and Debate in the Digital Age",
    eyebrow: "Interactive directory · 2026 edition",
    heroLede: "Thirty-five influential figures across da'wah, debate and contemporary thought, gathered in one directory with concise biographies, intelligent search and an offline reading experience.",
    menu: "Index",
    close: "Close",
    indexTitle: "Index",
    indexNote: "Jump directly to a person or section",
    intro: "Introduction",
    bioLink: "Founder's biography",
    introKicker: "Between the field and the platform",
    introTitle: "Guiding lights in a noisy age",
    introP1: "This directory brings together preachers, debaters and researchers who have built a meaningful presence in digital and intellectual life. Their work spans field da'wah, comparative religion, responses to objections, critiques of atheism and global lecturing.",
    introP2: "It is designed as a fast entry point into these figures and their main fields, with search in Arabic, English, French and Spanish, direct links to their visual content, and tools for copying and sharing.",
    bioKicker: "Founder's biography",
    bioName: "Hisham Sidqi Al-Ibrashi",
    bioRole: "Directory founder · UcfZem",
    bioText: "He assembled and edited this directory as a concise digital reference for leading figures in da'wah, thought and debate. His work focuses on knowledge organization, easier access to reliable content, and Arabic tools that work offline and reach readers wherever they are.",
    catalogTitle: "The Directory",
    catalogNote: "35 figures · 6 tracks",
    searchTitle: "Search the directory",
    searchPlaceholder: "Search by name, specialty, country or keyword…",
    searchClear: "Clear",
    searchHint: "Search ignores Arabic diacritics and alif variants and works across translated text.",
    prevMatch: "Previous",
    nextMatch: "Next",
    noMatches: "No matching results",
    copy: "Copy",
    copied: "Copied",
    youtube: "Watch on YouTube",
    channel: "Channel",
    card: "card",
    cards: "cards",
    words: "words",
    matchSummary: "Found {matches} words in {cards} cards",
    online: "Online",
    offline: "Offline mode",
    emptyTitle: "No results",
    emptyHint: "Try another name, or clear the search to show every figure.",
    allFigures: "All figures",
    language: "Language",
    theme: "Theme",
    reading: "Reading size",
    footer: "Luminaries of Da'wah · An offline digital directory",
    footerMaktaba: "Library",
    footerWorks: "Other works",
    footerGithub: "GitHub",
    skip: "Skip to the directory",
    top: "Back to top",
    categoryPrefix: "Track"
  },
  fr: {
    brand: "Figures de la da'wa",
    brandSub: "UcfZem · Maktaba",
    title: "Figures de la da'wa, de la pensée et du débat à l'ère numérique",
    eyebrow: "Répertoire interactif · édition 2026",
    heroLede: "Trente-cinq figures influentes de la da'wa, du débat et de la pensée contemporaine, réunies dans un répertoire avec biographies concises, recherche intelligente et lecture hors ligne.",
    menu: "Sommaire",
    close: "Fermer",
    indexTitle: "Sommaire",
    indexNote: "Accédez directement à une personne ou une section",
    intro: "Introduction",
    bioLink: "Biographie du fondateur",
    introKicker: "Entre le terrain et la plateforme",
    introTitle: "Des repères à l'ère du bruit",
    introP1: "Ce répertoire rassemble des prédicateurs, débatteurs et chercheurs qui ont marqué l'espace numérique et intellectuel. Leurs domaines couvrent la da'wa de terrain, les religions comparées, les réponses aux objections, la critique de l'athéisme et les conférences internationales.",
    introP2: "Il offre une entrée rapide dans ces parcours et leurs champs principaux, avec une recherche en arabe, anglais, français et espagnol, des liens directs vers leurs contenus vidéo et des outils de copie et de partage.",
    bioKicker: "Biographie du fondateur",
    bioName: "Hicham Sidqi Al-Ibrachi",
    bioRole: "Fondateur du répertoire · UcfZem",
    bioText: "Il a réuni et édité ce répertoire comme une référence numérique concise consacrée aux grandes figures de la da'wa, de la pensée et du débat. Son travail porte sur l'organisation des connaissances, l'accès à un contenu fiable et des outils arabes hors ligne accessibles partout.",
    catalogTitle: "Le répertoire",
    catalogNote: "35 figures · 6 parcours",
    searchTitle: "Rechercher dans le répertoire",
    searchPlaceholder: "Rechercher par nom, spécialité, pays ou mot-clé…",
    searchClear: "Effacer",
    searchHint: "La recherche ignore les diacritiques arabes et les variantes du alif, dans toutes les traductions.",
    prevMatch: "Précédent",
    nextMatch: "Suivant",
    noMatches: "Aucun résultat",
    copy: "Copier",
    copied: "Copié",
    youtube: "Voir sur YouTube",
    channel: "Chaîne",
    card: "fiche",
    cards: "fiches",
    words: "mots",
    matchSummary: "{matches} mots trouvés dans {cards} fiches",
    online: "En ligne",
    offline: "Mode hors ligne",
    emptyTitle: "Aucun résultat",
    emptyHint: "Essayez un autre nom ou effacez la recherche pour tout afficher.",
    allFigures: "Toutes les figures",
    language: "Langue",
    theme: "Thème",
    reading: "Taille de lecture",
    footer: "Figures de la da'wa · Répertoire numérique hors ligne",
    footerMaktaba: "Bibliothèque",
    footerWorks: "Autres travaux",
    footerGithub: "GitHub",
    skip: "Aller au répertoire",
    top: "Retour en haut",
    categoryPrefix: "Parcours"
  },
  es: {
    brand: "Figuras de la da'wa",
    brandSub: "UcfZem · Maktaba",
    title: "Figuras de la da'wa, el pensamiento y el debate en la era digital",
    eyebrow: "Directorio interactivo · edición 2026",
    heroLede: "Treinta y cinco figuras influyentes de la da'wa, el debate y el pensamiento contemporáneo, reunidas en un directorio con biografías breves, búsqueda inteligente y lectura sin conexión.",
    menu: "Índice",
    close: "Cerrar",
    indexTitle: "Índice",
    indexNote: "Ve directamente a una persona o sección",
    intro: "Introducción",
    bioLink: "Biografía del fundador",
    introKicker: "Entre el terreno y la plataforma",
    introTitle: "Faros en una época ruidosa",
    introP1: "Este directorio reúne a predicadores, debatientes e investigadores que han logrado una presencia influyente en el espacio digital e intelectual. Sus campos abarcan la da'wa de campo, las religiones comparadas, las respuestas a objeciones, la crítica del ateísmo y las conferencias internacionales.",
    introP2: "Está diseñado como una entrada rápida a estas trayectorias y sus principales campos, con búsqueda en árabe, inglés, francés y español, enlaces directos a su contenido audiovisual y herramientas para copiar y compartir.",
    bioKicker: "Biografía del fundador",
    bioName: "Hisham Sidqi Al-Ibrashi",
    bioRole: "Fundador del directorio · UcfZem",
    bioText: "Reunió y editó este directorio como una referencia digital concisa sobre las principales figuras de la da'wa, el pensamiento y el debate. Su trabajo se centra en organizar el conocimiento, facilitar el acceso a contenido fiable y crear herramientas árabes sin conexión que lleguen a cualquier lector.",
    catalogTitle: "El directorio",
    catalogNote: "35 figuras · 6 itinerarios",
    searchTitle: "Buscar en el directorio",
    searchPlaceholder: "Buscar por nombre, especialidad, país o palabra clave…",
    searchClear: "Borrar",
    searchHint: "La búsqueda ignora los diacríticos árabes y las variantes del alif en todos los textos traducidos.",
    prevMatch: "Anterior",
    nextMatch: "Siguiente",
    noMatches: "Sin resultados",
    copy: "Copiar",
    copied: "Copiado",
    youtube: "Ver en YouTube",
    channel: "Canal",
    card: "ficha",
    cards: "fichas",
    words: "palabras",
    matchSummary: "{matches} palabras encontradas en {cards} fichas",
    online: "En línea",
    offline: "Modo sin conexión",
    emptyTitle: "Sin resultados",
    emptyHint: "Prueba otro nombre o borra la búsqueda para mostrar todas las figuras.",
    allFigures: "Todas las figuras",
    language: "Idioma",
    theme: "Tema",
    reading: "Tamaño de lectura",
    footer: "Figuras de la da'wa · Directorio digital sin conexión",
    footerMaktaba: "Biblioteca",
    footerWorks: "Otras obras",
    footerGithub: "GitHub",
    skip: "Ir al directorio",
    top: "Volver arriba",
    categoryPrefix: "Itinerario"
  }
};

const CATEGORIES = [
  {
    id: "field",
    num: "01",
    title: {
      ar: "دعاة ميدانيون ودعوة غير المسلمين",
      en: "Field preachers and da'wah to non-Muslims",
      fr: "Prédicateurs de terrain et da'wa auprès des non-musulmans",
      es: "Predicadores de campo y da'wa a no musulmanes"
    },
    kicker: { ar: "العمل الميداني", en: "Field work", fr: "Travail de terrain", es: "Trabajo de campo" },
    ids: ["sumait", "khudher", "estes"]
  },
  {
    id: "comparative",
    num: "02",
    title: {
      ar: "محاورون ومناظرون في مقارنة الأديان",
      en: "Debaters and interlocutors in comparative religion",
      fr: "Débatteurs et intervenants en religions comparées",
      es: "Debatientes e interlocutores en religiones comparadas"
    },
    kicker: { ar: "مقارنة الأديان", en: "Comparative religion", fr: "Religions comparées", es: "Religiones comparadas" },
    ids: ["zain", "moaz", "mahmoud", "walid", "munqidh", "deedat", "zakir"]
  },
  {
    id: "creed",
    num: "03",
    title: {
      ar: "باحثون ومناظرون في العقيدة والرد على الشيعة",
      en: "Researchers and debaters in creed and responses to Shi'ism",
      fr: "Chercheurs et débatteurs en croyance et réponses au chiisme",
      es: "Investigadores y debatientes en creencia y respuestas al chiismo"
    },
    kicker: { ar: "العقيدة والفرق", en: "Creed and sects", fr: "Croyance et courants", es: "Creencia y corrientes" },
    ids: ["khamis", "arour", "rami", "wasabi", "ashraf", "taha", "faraj"]
  },
  {
    id: "atheism",
    num: "04",
    title: {
      ar: "باحثون ومفكرون في نقد الإلحاد والفكر المعاصر",
      en: "Researchers and thinkers critiquing atheism and contemporary thought",
      fr: "Chercheurs et penseurs critiques de l'athéisme et de la pensée contemporaine",
      es: "Investigadores y pensadores críticos del ateísmo y el pensamiento contemporáneo"
    },
    kicker: { ar: "الفكر المعاصر", en: "Contemporary thought", fr: "Pensée contemporaine", es: "Pensamiento contemporáneo" },
    ids: ["talaat", "sami", "qunaibi", "fadel", "shahin", "ajiri"]
  },
  {
    id: "english",
    num: "05",
    title: {
      ar: "مناظرو الشارع والجامعات باللغة الإنجليزية",
      en: "Street and university debaters in English",
      fr: "Débatteurs de rue et d'université en anglais",
      es: "Debatientes de calle y universidad en inglés"
    },
    kicker: { ar: "الحوار بالإنجليزية", en: "English dialogue", fr: "Dialogue en anglais", es: "Diálogo en inglés" },
    ids: ["hijab", "ali", "hamza", "adnan", "shabir"]
  },
  {
    id: "global",
    num: "06",
    title: {
      ar: "علماء ودعاة ذوو حضور عالمي",
      en: "Scholars and preachers with a global presence",
      fr: "Savants et prédicateurs à rayonnement mondial",
      es: "Sabios y predicadores con presencia global"
    },
    kicker: { ar: "حضور عالمي", en: "Global reach", fr: "Rayonnement mondial", es: "Alcance global" },
    ids: ["assim", "yasir", "menk", "shamail", "tariq", "omar", "nouman"]
  }
];

const PROFILES = {};

PROFILES.sumait = {
  name: { ar: "الشيخ عبد الرحمن السميط", en: "Sheikh Abdulrahman Al-Sumait", fr: "Cheikh Abdelrahman Al-Sumait", es: "Sheij Abdulrahman Al-Sumait" },
  country: COUNTRIES.kuwait,
  spec: {
    ar: "طب ودعوة إنسانية",
    en: "medicine and humanitarian da'wah",
    fr: "médecine et da'wa humanitaire",
    es: "medicina y da'wa humanitaria"
  },
  bio: {
    ar: "طبيب كويتي كرّس حياته للعمل الإنساني والدعوة في أفريقيا، وأسس جمعية العون المباشر التي وصل نشاطها إلى عشرات الدول. عُرف بمشاريع التعليم والصحة وحفر الآبار، وبقيت مدرسته نموذجًا للدعوة بالعمل.",
    en: "A Kuwaiti physician who devoted his life to humanitarian work and da'wah in Africa, founding Direct Aid, whose projects reached dozens of countries. His education, health and water projects made service itself a model of calling to Islam.",
    fr: "Médecin koweïtien, il a consacré sa vie à l'action humanitaire et à la da'wa en Afrique en fondant Direct Aid, dont les projets ont atteint des dizaines de pays. Éducation, santé et accès à l'eau ont fait de son service un modèle d'appel à l'islam.",
    es: "Médico kuwaití que dedicó su vida a la acción humanitaria y la da'wa en África, fundando Direct Aid, cuyos proyectos llegaron a decenas de países. Educación, salud y agua convirtieron su servicio en un modelo de llamada al islam."
  },
  channel: "Direct Aid Society",
  search: "عبد الرحمن السميط Abdulrahman Al-Sumait Direct Aid Africa"
};

PROFILES.khudher = {
  name: { ar: "الشيخ حمود الخضر", en: "Sheikh Humood Al-Khudher", fr: "Cheikh Hamoud Al-Khudher", es: "Sheij Humood Al-Khudher" },
  country: COUNTRIES.kuwait,
  spec: {
    ar: "دعوة وفن هادف",
    en: "da'wah and purposeful art",
    fr: "da'wa et art engagé",
    es: "da'wa y arte con propósito"
  },
  bio: {
    ar: "داعية كويتي معاصر جمع بين الخطاب الهادئ والفن الهادف، واشتهر بأناشيد وبرامج تخاطب الشباب بلغة قريبة من واقعهم. يواصل حضوره الرقمي في نشر القيم والتذكير بالسيرة.",
    en: "A contemporary Kuwaiti preacher who combines calm delivery with purposeful art, known for songs and programs that speak to young people in their own language. He continues to use digital platforms to share values and reflections on the Prophet's life.",
    fr: "Prédicateur koweïtien contemporain, il allie parole apaisée et art engagé. Ses chants et émissions parlent aux jeunes dans leur langage et il poursuit sur les réseaux un travail de transmission des valeurs et de la sira.",
    es: "Predicador kuwaití contemporáneo que combina un discurso sereno con arte con propósito. Sus canciones y programas hablan a los jóvenes en su propio lenguaje y continúa difundiendo valores y la vida del Profeta en plataformas digitales."
  },
  channel: "Humood AlKhudher",
  search: "حمود الخضر Humood AlKhudher Kuwait nasheed"
};

PROFILES.estes = {
  name: { ar: "الشيخ يوسف إستس", en: "Sheikh Yusuf Estes", fr: "Cheikh Yusuf Estes", es: "Sheij Yusuf Estes" },
  country: COUNTRIES.usa,
  spec: {
    ar: "مقارنة الأديان",
    en: "comparative religion",
    fr: "religions comparées",
    es: "religiones comparadas"
  },
  bio: {
    ar: "وزير موسيقى أمريكي سابق اعتنق الإسلام عام 1991 بعد رحلة بحث في الأديان، ثم صار من أبرز الدعاة الناطقين بالإنجليزية. يقدّم محاضرات ومقاطع تعريفية عن الإسلام ومقارنة الأديان.",
    en: "A former American music minister who embraced Islam in 1991 after a journey through different faiths, later becoming one of the best-known English-speaking preachers. He gives lectures and introductory videos on Islam and comparative religion.",
    fr: "Ancien ministre de musique américain, il a embrassé l'islam en 1991 après un parcours entre les religions et est devenu l'un des prédicateurs anglophones les plus connus. Il propose conférences et vidéos d'introduction à l'islam et aux religions comparées.",
    es: "Antiguo ministro de música estadounidense que abrazó el islam en 1991 tras un recorrido por distintas religiones y se convirtió en uno de los predicadores angloparlantes más conocidos. Ofrece conferencias y videos introductorios sobre el islam y las religiones comparadas."
  },
  channel: "Yusuf Estes",
  search: "يوسف إستس Yusuf Estes Islam comparative religion"
};

PROFILES.zain = {
  name: { ar: "الشيخ زين خير الله", en: "Sheikh Zain Khairallah", fr: "Cheikh Zaïn Khaïrallah", es: "Sheij Zain Khairallah" },
  country: COUNTRIES.libya,
  spec: {
    ar: "مناظرات ومقارنة أديان",
    en: "debate and comparative religion",
    fr: "débat et religions comparées",
    es: "debate y religiones comparadas"
  },
  bio: {
    ar: "باحث ليبي في مقارنة الأديان، عُرف بمناظراته الهادئة وتحليله للنصوص والمصادر. يركز على الحوار العقلاني وكشف التناقضات في الطروحات المعارضة للإسلام.",
    en: "A Libyan researcher in comparative religion, known for calm debates and careful analysis of texts and sources. He focuses on rational dialogue and on exposing inconsistencies in arguments against Islam.",
    fr: "Chercheur libyen en religions comparées, il est connu pour ses débats posés et son analyse rigoureuse des textes et des sources. Il privilégie le dialogue rationnel et la mise en évidence des contradictions des discours opposés à l'islam.",
    es: "Investigador libio en religiones comparadas, conocido por sus debates serenos y su análisis cuidadoso de textos y fuentes. Se centra en el diálogo racional y en mostrar las contradicciones de los discursos contrarios al islam."
  },
  channel: "زين خير الله",
  search: "زين خير الله Zain Khairallah Libya comparative religion"
};

PROFILES.moaz = {
  name: { ar: "معاذ عليان", en: "Moaz Aliian", fr: "Moaz Aliian", es: "Moaz Aliian" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "مناظرات وحوار",
    en: "debate and dialogue",
    fr: "débat et dialogue",
    es: "debate y diálogo"
  },
  bio: {
    ar: "باحث مصري في مقارنة الأديان والمناظرة، يقدّم محتوى يعتمد على المصادر والاستدلال. له حضور في الحوارات الرقمية حول العقيدة والرد على الشبهات.",
    en: "An Egyptian researcher in comparative religion and debate who builds his content on sources and argumentation. He is active in digital conversations on creed and responses to objections.",
    fr: "Chercheur égyptien en religions comparées et en débat, il fonde son contenu sur les sources et l'argumentation. Il participe activement aux discussions numériques sur la croyance et les objections adressées à l'islam.",
    es: "Investigador egipcio en religiones comparadas y debate que basa su contenido en fuentes y argumentación. Participa activamente en conversaciones digitales sobre creencia y respuestas a objeciones."
  },
  channel: "معاذ عليان",
  search: "معاذ عليان Moaz Aliian Egypt comparative religion"
};

PROFILES.mahmoud = {
  name: { ar: "محمود داود", en: "Mahmoud Dawoud", fr: "Mahmoud Daoud", es: "Mahmoud Dawoud" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "دعوة ومقارنة أديان",
    en: "da'wah and comparative religion",
    fr: "da'wa et religions comparées",
    es: "da'wa y religiones comparadas"
  },
  bio: {
    ar: "داعية وباحث مصري في مقارنة الأديان، يجمع بين الخطاب المباشر والمناقشة العلمية. يتناول قضايا العقيدة والنصوص الدينية في برامج ومحاضرات متعددة.",
    en: "An Egyptian preacher and researcher in comparative religion, combining direct communication with scholarly discussion. He addresses questions of creed and religious texts in programs and lectures.",
    fr: "Prédicateur et chercheur égyptien en religions comparées, il associe discours direct et discussion savante. Il aborde les questions de croyance et les textes religieux dans ses émissions et conférences.",
    es: "Predicador e investigador egipcio en religiones comparadas que combina comunicación directa y discusión académica. Aborda cuestiones de creencia y textos religiosos en programas y conferencias."
  },
  channel: "محمود داود",
  search: "محمود داود Mahmoud Dawoud Egypt comparative religion"
};

PROFILES.walid = {
  name: { ar: "الشيخ وليد إسماعيل", en: "Sheikh Walid Ismail", fr: "Cheikh Walid Ismaïl", es: "Sheij Walid Ismail" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "مقارنة أديان",
    en: "comparative religion",
    fr: "religions comparées",
    es: "religiones comparadas"
  },
  bio: {
    ar: "داعية مصري متخصص في مقارنة الأديان، عُرف بمناظراته وردوده على الشبهات المطروحة حول الإسلام. يحرص على تقديم الأدلة من المصادر الأصلية بلغة واضحة.",
    en: "An Egyptian preacher specialising in comparative religion, known for his debates and responses to objections raised about Islam. He is careful to present evidence from primary sources in clear language.",
    fr: "Prédicateur égyptien spécialisé en religions comparées, connu pour ses débats et ses réponses aux objections formulées contre l'islam. Il veille à présenter les preuves issues des sources originales dans un langage clair.",
    es: "Predicador egipcio especializado en religiones comparadas, conocido por sus debates y respuestas a objeciones sobre el islam. Procura presentar pruebas de fuentes originales con un lenguaje claro."
  },
  channel: "وليد إسماعيل",
  search: "وليد إسماعيل Walid Ismail Egypt comparative religion"
};

PROFILES.munqidh = {
  name: { ar: "الدكتور منقذ السقار", en: "Dr. Munqidh Al-Saqqar", fr: "Dr Mounqidh Al-Saqqar", es: "Dr. Munqidh Al-Saqqar" },
  country: COUNTRIES.syria,
  spec: {
    ar: "دراسات دينية",
    en: "religious studies",
    fr: "études religieuses",
    es: "estudios religiosos"
  },
  bio: {
    ar: "باحث سوري في مقارنة الأديان والدراسات الدينية، له مؤلفات ومحاضرات في نقد الأطروحات التبشيرية. يعتمد منهجًا توثيقيًا في عرض النصوص وتحليلها.",
    en: "A Syrian researcher in comparative religion and religious studies, with books and lectures critiquing missionary arguments. He follows a documentary method in presenting and analysing texts.",
    fr: "Chercheur syrien en religions comparées et en études religieuses, il a publié livres et conférences critiquant les thèses missionnaires. Sa méthode repose sur la documentation et l'analyse des textes.",
    es: "Investigador sirio en religiones comparadas y estudios religiosos, con libros y conferencias que critican las tesis misioneras. Sigue un método documental al presentar y analizar los textos."
  },
  channel: "منقذ السقار",
  search: "منقذ السقار Munqidh Al-Saqqar Syria comparative religion"
};

PROFILES.deedat = {
  name: { ar: "الشيخ أحمد ديدات", en: "Sheikh Ahmed Deedat", fr: "Cheikh Ahmed Deedat", es: "Sheij Ahmed Deedat" },
  country: COUNTRIES.southAfrica,
  spec: {
    ar: "مناظرات ومقارنة أديان",
    en: "debate and comparative religion",
    fr: "débat et religions comparées",
    es: "debate y religiones comparadas"
  },
  bio: {
    ar: "داعية جنوب أفريقي أسس المركز الإسلامي الدولي في ديربان، واشتهر بمناظراته عن الكتاب المقدس والإسلام. ترك أثرًا واسعًا في الدعوة الناطقة بالإنجليزية قبل وفاته عام 2005.",
    en: "A South African preacher who founded the Islamic Propagation Centre International in Durban and became famous for his debates on the Bible and Islam. He left a wide legacy in English-language da'wah before his death in 2005.",
    fr: "Prédicateur sud-africain, il a fondé l'Islamic Propagation Centre International à Durban et s'est fait connaître par ses débats sur la Bible et l'islam. Il a marqué durablement la da'wa anglophone avant sa mort en 2005.",
    es: "Predicador sudafricano que fundó el Islamic Propagation Centre International en Durban y se hizo famoso por sus debates sobre la Biblia y el islam. Dejó un amplio legado en la da'wa en inglés antes de morir en 2005."
  },
  channel: "Ahmed Deedat",
  search: "أحمد ديدات Ahmed Deedat IPCI debate Bible"
};

PROFILES.zakir = {
  name: { ar: "الدكتور ذاكر نايك", en: "Dr. Zakir Naik", fr: "Dr Zakir Naik", es: "Dr. Zakir Naik" },
  country: COUNTRIES.india,
  spec: {
    ar: "مقارنة أديان",
    en: "comparative religion",
    fr: "religions comparées",
    es: "religiones comparadas"
  },
  bio: {
    ar: "طبيب وداعية هندي أسس مؤسسة البحث الإسلامي، ويقدّم محاضرات في مقارنة الأديان والرد على الشبهات. يُعرف بأسلوبه السريع في جمع النصوص وعرض المقارنات.",
    en: "An Indian physician and preacher who founded the Islamic Research Foundation, lecturing on comparative religion and responses to objections. He is known for rapidly gathering texts and presenting comparisons.",
    fr: "Médecin et prédicateur indien, il a fondé l'Islamic Research Foundation et donne des conférences en religions comparées et sur les réponses aux objections. Il est connu pour sa manière rapide de rassembler les textes et de présenter les comparaisons.",
    es: "Médico y predicador indio que fundó la Islamic Research Foundation y ofrece conferencias sobre religiones comparadas y respuestas a objeciones. Es conocido por reunir textos con rapidez y presentar comparaciones."
  },
  channel: "Dr. Zakir Naik",
  search: "ذاكر نايك Zakir Naik Islamic Research Foundation comparative religion"
};

PROFILES.khamis = {
  name: { ar: "الشيخ عثمان الخميس", en: "Sheikh Othman Al-Khamis", fr: "Cheikh Othman Al-Khamis", es: "Sheij Othman Al-Khamis" },
  country: COUNTRIES.kuwait,
  spec: {
    ar: "عقيدة وردود",
    en: "creed and responses",
    fr: "croyance et réponses",
    es: "creencia y respuestas"
  },
  bio: {
    ar: "داعية كويتي متخصص في العقيدة والردود على الفرق والمذاهب. له سلسلة من الدروس والمناظرات، ويؤكد على الرجوع إلى القرآن والسنة وفهم السلف.",
    en: "A Kuwaiti preacher specialising in creed and responses to sects and schools of thought. He has produced numerous lessons and debates and stresses returning to the Quran, the Sunnah and the understanding of the early generations.",
    fr: "Prédicateur koweïtien spécialisé dans la croyance et les réponses aux sectes et courants. Il a donné de nombreux cours et débats et insiste sur le retour au Coran, à la Sunna et à la compréhension des premières générations.",
    es: "Predicador kuwaití especializado en creencia y respuestas a sectas y corrientes. Ha impartido numerosas lecciones y debates e insiste en volver al Corán, la Sunna y la comprensión de las primeras generaciones."
  },
  channel: "عثمان الخميس",
  search: "عثمان الخميس Othman Al-Khamis Kuwait creed"
};

PROFILES.arour = {
  name: { ar: "الشيخ عدنان العرعور", en: "Sheikh Adnan Al-Arour", fr: "Cheikh Adnan Al-Arour", es: "Sheij Adnan Al-Arour" },
  country: COUNTRIES.syria,
  spec: {
    ar: "عقيدة ومناظرة",
    en: "creed and debate",
    fr: "croyance et débat",
    es: "creencia y debate"
  },
  bio: {
    ar: "داعية سوري عُرف بمناظراته في العقيدة والرد على الطروحات الشيعية. يقدّم دروسًا ومحاضرات في المنهج والفرق، وله حضور واسع في الإعلام الرقمي.",
    en: "A Syrian preacher known for his debates on creed and his responses to Shi'i arguments. He gives lessons and lectures on methodology and sectarian groups and has a broad presence in digital media.",
    fr: "Prédicateur syrien connu pour ses débats sur la croyance et ses réponses aux thèses chiites. Il donne cours et conférences sur la méthodologie et les courants, avec une large présence dans les médias numériques.",
    es: "Predicador sirio conocido por sus debates sobre creencia y sus respuestas a las tesis chiitas. Imparte lecciones y conferencias sobre metodología y corrientes, con amplia presencia en medios digitales."
  },
  channel: "عدنان العرعور",
  search: "عدنان العرعور Adnan Al-Arour Syria creed debate"
};

PROFILES.rami = {
  name: { ar: "الشيخ رامي عيسى", en: "Sheikh Rami Issa", fr: "Cheikh Rami Issa", es: "Sheij Rami Issa" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "عقيدة وردود",
    en: "creed and responses",
    fr: "croyance et réponses",
    es: "creencia y respuestas"
  },
  bio: {
    ar: "داعية مصري يهتم بالعقيدة والرد على الشبهات الموجهة إلى أهل السنة. يقدّم محتوى مبسطًا يجمع بين النصوص الشرعية والمناقشة العقلية.",
    en: "An Egyptian preacher concerned with creed and responses to objections directed at Sunni Islam. He offers accessible content combining scriptural texts with rational discussion.",
    fr: "Prédicateur égyptien attaché à la croyance et aux réponses aux objections adressées au sunnisme. Il propose un contenu accessible qui associe textes scripturaires et discussion rationnelle.",
    es: "Predicador egipcio centrado en la creencia y las respuestas a objeciones dirigidas al islam suní. Ofrece contenido accesible que combina textos sagrados y discusión racional."
  },
  channel: "رامي عيسى",
  search: "رامي عيسى Rami Issa Egypt creed"
};

PROFILES.wasabi = {
  name: { ar: "الشيخ أبو الحسن الوصابي", en: "Sheikh Abu Al-Hasan Al-Wasabi", fr: "Cheikh Abou Al-Hassan Al-Wasabi", es: "Sheij Abu Al-Hasan Al-Wasabi" },
  country: COUNTRIES.yemen,
  spec: {
    ar: "عقيدة ومنهج",
    en: "creed and methodology",
    fr: "croyance et méthodologie",
    es: "creencia y metodología"
  },
  bio: {
    ar: "داعية يمني متخصص في العقيدة والمنهج، عُرف بدروسه في توحيد الأسماء والصفات. يناقش قضايا الفرق والأفكار المعاصرة بأسلوب تربوي.",
    en: "A Yemeni preacher specialising in creed and methodology, known for his lessons on the oneness of God's names and attributes. He discusses sectarian issues and contemporary ideas with an educational approach.",
    fr: "Prédicateur yéménite spécialisé en croyance et méthodologie, connu pour ses cours sur l'unicité des noms et attributs divins. Il aborde les questions sectaires et les idées contemporaines avec une approche pédagogique.",
    es: "Predicador yemení especializado en creencia y metodología, conocido por sus lecciones sobre la unicidad de los nombres y atributos divinos. Aborda cuestiones sectarias e ideas contemporáneas con un enfoque educativo."
  },
  channel: "أبو الحسن الوصابي",
  search: "أبو الحسن الوصابي Abu Al-Hasan Al-Wasabi Yemen creed"
};

PROFILES.ashraf = {
  name: { ar: "الشيخ أشرف غريب", en: "Sheikh Ashraf Gharib", fr: "Cheikh Achraf Gharib", es: "Sheij Ashraf Gharib" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "ردود ودراسات",
    en: "responses and studies",
    fr: "réponses et études",
    es: "respuestas y estudios"
  },
  bio: {
    ar: "باحث مصري في العقيدة والردود، له دروس ومحاضرات في نقد الطروحات المخالفة لأهل السنة. يعتمد على تحرير المصطلحات وبيان الأدلة.",
    en: "An Egyptian researcher in creed and responses, with lessons and lectures critiquing positions opposed to Sunni Islam. He relies on defining terms precisely and clarifying evidence.",
    fr: "Chercheur égyptien en croyance et en réponses, il donne cours et conférences critiquant les positions opposées au sunnisme. Il s'appuie sur la précision des termes et la clarification des preuves.",
    es: "Investigador egipcio en creencia y respuestas, con lecciones y conferencias que critican posiciones opuestas al islam suní. Se apoya en la precisión terminológica y la clarificación de pruebas."
  },
  channel: "أشرف غريب",
  search: "أشرف غريب Ashraf Gharib Egypt creed responses"
};

PROFILES.taha = {
  name: { ar: "الدكتور طه الدليمي", en: "Dr. Taha Al-Dulaimi", fr: "Dr Taha Al-Doulaïmi", es: "Dr. Taha Al-Dulaimi" },
  country: COUNTRIES.iraq,
  spec: {
    ar: "فكر وعقيدة",
    en: "thought and creed",
    fr: "pensée et croyance",
    es: "pensamiento y creencia"
  },
  bio: {
    ar: "باحث عراقي في العقيدة والفكر الإسلامي، تناول قضايا المنهج والفرق في مؤلفاته ومحاضراته. يهتم بالتحليل التاريخي للنصوص والمواقف.",
    en: "An Iraqi researcher in creed and Islamic thought who has addressed questions of methodology and sectarian groups in his books and lectures. He is interested in the historical analysis of texts and positions.",
    fr: "Chercheur irakien en croyance et pensée islamique, il a traité des questions de méthodologie et de courants dans ses livres et conférences. Il s'intéresse à l'analyse historique des textes et des positions.",
    es: "Investigador iraquí en creencia y pensamiento islámico que ha abordado cuestiones de metodología y corrientes en sus libros y conferencias. Le interesa el análisis histórico de textos y posiciones."
  },
  channel: "طه الدليمي",
  search: "طه الدليمي Taha Al-Dulaimi Iraq creed thought"
};

PROFILES.faraj = {
  name: { ar: "الشيخ فراج الصهيبي", en: "Sheikh Faraj Al-Sahibi", fr: "Cheikh Faraj Al-Sahibi", es: "Sheij Faraj Al-Sahibi" },
  country: COUNTRIES.saudi,
  spec: {
    ar: "عقيدة وردود",
    en: "creed and responses",
    fr: "croyance et réponses",
    es: "creencia y respuestas"
  },
  bio: {
    ar: "داعية سعودي متخصص في العقيدة والردود على الشبهات، له دروس ومقاطع في تثبيت أصول الاعتقاد. يخاطب الشباب بلغة مباشرة تجمع بين الدليل والتربية.",
    en: "A Saudi preacher specialising in creed and responses to objections, with lessons and clips that strengthen the fundamentals of belief. He addresses young people directly, combining evidence with moral formation.",
    fr: "Prédicateur saoudien spécialisé en croyance et en réponses aux objections, il propose cours et vidéos pour affermir les fondements de la foi. Il s'adresse aux jeunes avec un langage direct qui joint la preuve à l'éducation.",
    es: "Predicador saudí especializado en creencia y respuestas a objeciones, con lecciones y videos que afianzan los fundamentos de la fe. Se dirige a los jóvenes con un lenguaje directo que une prueba y formación."
  },
  channel: "فراج الصهيبي",
  search: "فراج الصهيبي Faraj Al-Sahibi Saudi creed"
};

PROFILES.talaat = {
  name: { ar: "الدكتور هيثم طلعت", en: "Dr. Haitham Talaat", fr: "Dr Haïtham Talaat", es: "Dr. Haitham Talaat" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "نقد الإلحاد",
    en: "critique of atheism",
    fr: "critique de l'athéisme",
    es: "crítica del ateísmo"
  },
  bio: {
    ar: "طبيب وباحث مصري في نقد الإلحاد والفكر المعاصر، له مؤلفات ومحاضرات في العلم والفلسفة. يناقش دعاوى الملحدين من زاوية علمية وعقلية.",
    en: "An Egyptian physician and researcher critiquing atheism and contemporary thought, with books and lectures on science and philosophy. He examines atheist claims from scientific and rational perspectives.",
    fr: "Médecin et chercheur égyptien critique de l'athéisme et de la pensée contemporaine, il a publié livres et conférences sur science et philosophie. Il examine les thèses athées d'un point de vue scientifique et rationnel.",
    es: "Médico e investigador egipcio crítico del ateísmo y el pensamiento contemporáneo, con libros y conferencias sobre ciencia y filosofía. Examina las tesis ateas desde perspectivas científicas y racionales."
  },
  channel: "هيثم طلعت",
  search: "هيثم طلعت Haitham Talaat Egypt atheism science"
};

PROFILES.sami = {
  name: { ar: "الدكتور سامي عامري", en: "Dr. Sami Ameri", fr: "Dr Sami Ameri", es: "Dr. Sami Ameri" },
  country: COUNTRIES.tunisia,
  spec: {
    ar: "فلسفة ونقد الإلحاد",
    en: "philosophy and critique of atheism",
    fr: "philosophie et critique de l'athéisme",
    es: "filosofía y crítica del ateísmo"
  },
  bio: {
    ar: "باحث تونسي في الفلسفة ونقد الإلحاد، له دراسات في الأخلاق والمعرفة والعلوم. يقدّم نقدًا منهجيًا للأطروحات الإلحادية بلغة أكاديمية مبسطة.",
    en: "A Tunisian researcher in philosophy and the critique of atheism, with studies on ethics, knowledge and science. He offers a systematic critique of atheist arguments in accessible academic language.",
    fr: "Chercheur tunisien en philosophie et critique de l'athéisme, il a publié des études sur l'éthique, la connaissance et les sciences. Il propose une critique méthodique des thèses athées dans un langage académique accessible.",
    es: "Investigador tunecino en filosofía y crítica del ateísmo, con estudios sobre ética, conocimiento y ciencia. Ofrece una crítica sistemática de las tesis ateas en un lenguaje académico accesible."
  },
  channel: "سامي عامري",
  search: "سامي عامري Sami Ameri Tunisia atheism philosophy"
};

PROFILES.qunaibi = {
  name: { ar: "الدكتور إياد قنيبي", en: "Dr. Iyad Qunaibi", fr: "Dr Iyad Qounaïbi", es: "Dr. Iyad Qunaibi" },
  country: COUNTRIES.palestine,
  spec: {
    ar: "فكر معاصر ونقد الإلحاد",
    en: "contemporary thought and critique of atheism",
    fr: "pensée contemporaine et critique de l'athéisme",
    es: "pensamiento contemporáneo y crítica del ateísmo"
  },
  bio: {
    ar: "داعية وباحث فلسطيني في الفكر المعاصر ونقد الإلحاد، له حضور واسع في الخطاب التربوي. يجمع بين التحليل الفكري والمعالجة العملية لقضايا الشباب.",
    en: "A Palestinian preacher and researcher in contemporary thought and the critique of atheism, with a broad presence in educational discourse. He combines intellectual analysis with practical engagement with young people's concerns.",
    fr: "Prédicateur et chercheur palestinien en pensée contemporaine et critique de l'athéisme, très présent dans le discours éducatif. Il associe analyse intellectuelle et traitement concret des préoccupations des jeunes.",
    es: "Predicador e investigador palestino en pensamiento contemporáneo y crítica del ateísmo, con amplia presencia en el discurso educativo. Combina análisis intelectual y abordaje práctico de las preocupaciones juveniles."
  },
  channel: "إياد قنيبي",
  search: "إياد قنيبي Iyad Qunaibi Palestine atheism"
};

PROFILES.fadel = {
  name: { ar: "المهندس فاضل سليمان", en: "Eng. Fadel Soliman", fr: "Ing. Fadel Soliman", es: "Ing. Fadel Soliman" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "حوار حضاري",
    en: "civilisational dialogue",
    fr: "dialogue des civilisations",
    es: "diálogo civilizatorio"
  },
  bio: {
    ar: "مؤسس مؤسسة جسور للحوار، ومهتم بالحوار الحضاري وتعليم مهارات الدعوة. يقدّم برامج تدريبية ومناظرات في التواصل مع غير المسلمين.",
    en: "Founder of Bridges Foundation, focused on civilisational dialogue and teaching da'wah skills. He offers training programs and debates on communicating with non-Muslims.",
    fr: "Fondateur de Bridges Foundation, il se consacre au dialogue des civilisations et à l'enseignement des compétences de la da'wa. Il propose formations et débats sur la communication avec les non-musulmans.",
    es: "Fundador de Bridges Foundation, centrado en el diálogo civilizatorio y la enseñanza de habilidades de da'wa. Ofrece programas de formación y debates sobre la comunicación con no musulmanes."
  },
  channel: "فاضل سليمان",
  search: "فاضل سليمان Fadel Soliman Bridges Foundation dialogue"
};

PROFILES.shahin = {
  name: { ar: "الشيخ محمد شاهين التاعب", en: "Sheikh Mohamed Shahin Al-Ta'ib", fr: "Cheikh Mohamed Chahine Al-Ta'ib", es: "Sheij Mohamed Shahin Al-Ta'ib" },
  country: COUNTRIES.egypt,
  spec: {
    ar: "دعوة ونقد فكري",
    en: "da'wah and intellectual critique",
    fr: "da'wa et critique intellectuelle",
    es: "da'wa y crítica intelectual"
  },
  bio: {
    ar: "داعية مصري يقدّم محتوى في العقيدة ونقد الأفكار المعاصرة والشبهات. عُرف بأسلوبه التعليمي وسلاسله المبسطة للشباب.",
    en: "An Egyptian preacher offering content on creed, contemporary ideas and objections. He is known for his teaching style and accessible series for young people.",
    fr: "Prédicateur égyptien proposant un contenu sur la croyance, les idées contemporaines et les objections. Il est connu pour son style pédagogique et ses séries simplifiées destinées aux jeunes.",
    es: "Predicador egipcio que ofrece contenido sobre creencia, ideas contemporáneas y objeciones. Es conocido por su estilo didáctico y sus series accesibles para jóvenes."
  },
  channel: "محمد شاهين التاعب",
  search: "محمد شاهين التاعب Mohamed Shahin Al-Ta'ib Egypt creed"
};

PROFILES.ajiri = {
  name: { ar: "الدكتور عبد الله العجيري", en: "Dr. Abdullah Al-Ajiri", fr: "Dr Abdallah Al-Ajiri", es: "Dr. Abdullah Al-Ajiri" },
  country: COUNTRIES.saudi,
  spec: {
    ar: "فكر معاصر",
    en: "contemporary thought",
    fr: "pensée contemporaine",
    es: "pensamiento contemporáneo"
  },
  bio: {
    ar: "باحث سعودي في الفكر المعاصر وقضايا الشباب، له مؤلفات في الوعي والمنهج. يقدّم محاضرات تجمع بين البعد الفكري والتربوي.",
    en: "A Saudi researcher in contemporary thought and youth issues, with books on awareness and methodology. His lectures combine intellectual reflection with moral formation.",
    fr: "Chercheur saoudien en pensée contemporaine et questions de jeunesse, il a publié des ouvrages sur la conscience et la méthodologie. Ses conférences associent réflexion intellectuelle et formation morale.",
    es: "Investigador saudí en pensamiento contemporáneo y cuestiones juveniles, con libros sobre conciencia y metodología. Sus conferencias combinan reflexión intelectual y formación moral."
  },
  channel: "عبد الله العجيري",
  search: "عبد الله العجيري Abdullah Al-Ajiri Saudi contemporary thought"
};

PROFILES.hijab = {
  name: { ar: "محمد حجاب", en: "Mohammed Hijab", fr: "Mohammed Hijab", es: "Mohammed Hijab" },
  country: COUNTRIES.britain,
  spec: {
    ar: "مناظرات وفلسفة",
    en: "debate and philosophy",
    fr: "débat et philosophie",
    es: "debate y filosofía"
  },
  bio: {
    ar: "مناظر بريطاني ومؤسس منصة حوارية، يخوض نقاشات في الفلسفة والأخلاق والأديان. يعتمد على المنطق والمنهج التحليلي في مواجهة الإلحاد.",
    en: "A British debater and founder of a dialogue platform, engaging in discussions on philosophy, ethics and religion. He relies on logic and analytical method in addressing atheism.",
    fr: "Débatteur britannique et fondateur d'une plateforme de dialogue, il participe à des discussions sur la philosophie, l'éthique et les religions. Il s'appuie sur la logique et la méthode analytique face à l'athéisme.",
    es: "Debatiente británico y fundador de una plataforma de diálogo, participa en discusiones sobre filosofía, ética y religión. Se apoya en la lógica y el método analítico frente al ateísmo."
  },
  channel: "Mohammed Hijab",
  search: "محمد حجاب Mohammed Hijab Britain debate philosophy atheism"
};

PROFILES.ali = {
  name: { ar: "علي دعوة", en: "Ali Dawah", fr: "Ali Dawah", es: "Ali Dawah" },
  country: COUNTRIES.britain,
  spec: {
    ar: "دعوة شارع",
    en: "street da'wah",
    fr: "da'wa de rue",
    es: "da'wa de calle"
  },
  bio: {
    ar: "داعية بريطاني معروف بدعوة الشارع والحوار المباشر مع المارة. يقدّم محتوى يوميًا عن الإسلام ويشجع على النقاش المحترم.",
    en: "A British preacher known for street da'wah and direct conversations with passers-by. He produces daily content about Islam and encourages respectful discussion.",
    fr: "Prédicateur britannique connu pour la da'wa de rue et le dialogue direct avec les passants. Il produit un contenu quotidien sur l'islam et encourage une discussion respectueuse.",
    es: "Predicador británico conocido por la da'wa de calle y el diálogo directo con los transeúntes. Produce contenido diario sobre el islam y fomenta la discusión respetuosa."
  },
  channel: "Ali Dawah",
  search: "علي دعوة Ali Dawah Britain street dawah"
};

PROFILES.hamza = {
  name: { ar: "حمزة تزورتزيس", en: "Hamza Tzortzis", fr: "Hamza Tzortzis", es: "Hamza Tzortzis" },
  country: COUNTRIES.britain,
  spec: {
    ar: "فلسفة ومناظرة",
    en: "philosophy and debate",
    fr: "philosophie et débat",
    es: "filosofía y debate"
  },
  bio: {
    ar: "باحث بريطاني في الفلسفة واللاهوت، يهتم بمناقشة الإلحاد والعلم والأخلاق. له محاضرات ومناظرات في الجامعات ومراكز الحوار.",
    en: "A British researcher in philosophy and theology, interested in discussions of atheism, science and ethics. He has lectured and debated at universities and dialogue centres.",
    fr: "Chercheur britannique en philosophie et théologie, il s'intéresse aux débats sur l'athéisme, la science et l'éthique. Il a donné conférences et débats dans des universités et centres de dialogue.",
    es: "Investigador británico en filosofía y teología, interesado en los debates sobre ateísmo, ciencia y ética. Ha dado conferencias y debates en universidades y centros de diálogo."
  },
  channel: "Hamza Tzortzis",
  search: "حمزة تزورتزيس Hamza Tzortzis Britain philosophy atheism"
};

PROFILES.adnan = {
  name: { ar: "عدنان رشيد", en: "Adnan Rashid", fr: "Adnan Rachid", es: "Adnan Rashid" },
  country: COUNTRIES.britain,
  spec: {
    ar: "تاريخ ومقارنة أديان",
    en: "history and comparative religion",
    fr: "histoire et religions comparées",
    es: "historia y religiones comparadas"
  },
  bio: {
    ar: "مناظر بريطاني مهتم بالتاريخ ومقارنة الأديان، يقدّم محاضرات في السيرة والتاريخ الإسلامي. يعتمد على المصادر التاريخية في نقاشاته.",
    en: "A British debater interested in history and comparative religion, lecturing on the Prophet's life and Islamic history. He relies on historical sources in his discussions.",
    fr: "Débatteur britannique intéressé par l'histoire et les religions comparées, il donne des conférences sur la sira et l'histoire islamique. Il s'appuie sur les sources historiques dans ses discussions.",
    es: "Debatiente británico interesado en historia y religiones comparadas, con conferencias sobre la vida del Profeta y la historia islámica. Se apoya en fuentes históricas en sus debates."
  },
  channel: "Adnan Rashid",
  search: "عدنان رشيد Adnan Rashid Britain history comparative religion"
};

PROFILES.shabir = {
  name: { ar: "الدكتور شبير علي", en: "Dr. Shabir Ally", fr: "Dr Shabir Ally", es: "Dr. Shabir Ally" },
  country: COUNTRIES.canada,
  spec: {
    ar: "مقارنة أديان",
    en: "comparative religion",
    fr: "religions comparées",
    es: "religiones comparadas"
  },
  bio: {
    ar: "داعية كندي ومؤسس برنامج Let the Quran Speak، متخصص في مقارنة الأديان. يقدّم حوارات أكاديمية عن القرآن والإسلام بلغة إنجليزية واضحة.",
    en: "A Canadian preacher and founder of Let the Quran Speak, specialising in comparative religion. He offers academic dialogues on the Quran and Islam in clear English.",
    fr: "Prédicateur canadien et fondateur de Let the Quran Speak, spécialisé en religions comparées. Il propose des dialogues académiques sur le Coran et l'islam dans un anglais clair.",
    es: "Predicador canadiense y fundador de Let the Quran Speak, especializado en religiones comparadas. Ofrece diálogos académicos sobre el Corán y el islam en un inglés claro."
  },
  channel: "Let the Quran Speak",
  search: "شبير علي Shabir Ally Canada Let the Quran Speak comparative religion"
};

PROFILES.assim = {
  name: { ar: "الشيخ عاصم الحكيم", en: "Sheikh Assim Al-Hakeem", fr: "Cheikh Assim Al-Hakeem", es: "Sheij Assim Al-Hakeem" },
  country: COUNTRIES.saudi,
  spec: {
    ar: "فقه ودعوة",
    en: "jurisprudence and da'wah",
    fr: "jurisprudence et da'wa",
    es: "jurisprudencia y da'wa"
  },
  bio: {
    ar: "عالم سعودي متخصص في الفقه والدعوة، له دروس وفتاوى واسعة الانتشار. يعرف بأسلوبه المباشر في تعليم أحكام الدين.",
    en: "A Saudi scholar specialising in jurisprudence and da'wah, with widely shared lessons and rulings. He is known for his direct style of teaching religious practice.",
    fr: "Savant saoudien spécialisé en jurisprudence et da'wa, ses cours et avis sont largement diffusés. Il est connu pour son style direct dans l'enseignement des règles religieuses.",
    es: "Sabio saudí especializado en jurisprudencia y da'wa, con lecciones y dictámenes ampliamente difundidos. Es conocido por su estilo directo al enseñar las normas religiosas."
  },
  channel: "Assim Al-Hakeem",
  search: "عاصم الحكيم Assim Al-Hakeem Saudi fiqh dawah"
};

PROFILES.yasir = {
  name: { ar: "الشيخ ياسر قاضي", en: "Sheikh Yasir Qadhi", fr: "Cheikh Yassir Qadhi", es: "Sheij Yasir Qadhi" },
  country: COUNTRIES.usa,
  spec: {
    ar: "عقيدة وتاريخ",
    en: "creed and history",
    fr: "croyance et histoire",
    es: "creencia e historia"
  },
  bio: {
    ar: "عالم أمريكي متخصص في العقيدة والتاريخ الإسلامي، وأحد مؤسسي معهد يقين. يقدّم محاضرات أكاديمية ودورات في العلوم الشرعية.",
    en: "An American scholar specialising in creed and Islamic history and a co-founder of Yaqeen Institute. He offers academic lectures and courses in Islamic sciences.",
    fr: "Savant américain spécialisé en croyance et histoire islamique, cofondateur du Yaqeen Institute. Il propose conférences académiques et cours en sciences islamiques.",
    es: "Sabio estadounidense especializado en creencia e historia islámica y cofundador de Yaqeen Institute. Ofrece conferencias académicas y cursos de ciencias islámicas."
  },
  channel: "Yasir Qadhi",
  search: "ياسر قاضي Yasir Qadhi Yaqeen creed history"
};

PROFILES.menk = {
  name: { ar: "المفتي إسماعيل منك", en: "Mufti Ismail Menk", fr: "Mufti Ismail Menk", es: "Mufti Ismail Menk" },
  country: COUNTRIES.zimbabwe,
  spec: {
    ar: "دعوة عالمية",
    en: "global da'wah",
    fr: "da'wa internationale",
    es: "da'wa global"
  },
  bio: {
    ar: "داعية زيمبابوي ذو حضور عالمي، عُرف بأسلوبه البسيط في التذكير والتربية. له برامج ومحاضرات في الأخلاق والسيرة.",
    en: "A Zimbabwean preacher with a global following, known for his simple style of reminder and moral teaching. His programs and lectures focus on ethics and the Prophet's life.",
    fr: "Prédicateur zimbabwéen de renommée mondiale, connu pour son style simple de rappel et d'éducation. Ses émissions et conférences portent sur l'éthique et la sira.",
    es: "Predicador zimbabuense con alcance global, conocido por su estilo sencillo de recordatorio y formación. Sus programas y conferencias se centran en la ética y la vida del Profeta."
  },
  channel: "Mufti Menk",
  search: "إسماعيل منك Mufti Menk Zimbabwe dawah"
};

PROFILES.shamail = {
  name: { ar: "الشيخ شمائل ندوي", en: "Sheikh Shamail Nadwi", fr: "Cheikh Chamaïl Nadwi", es: "Sheij Shamail Nadwi" },
  country: COUNTRIES.india,
  spec: {
    ar: "دعوة وتربية",
    en: "da'wah and education",
    fr: "da'wa et éducation",
    es: "da'wa y educación"
  },
  bio: {
    ar: "داعية هندي يهتم بالدعوة والتربية والتزكية، ويقدّم دروسًا ومحاضرات بالعربية والإنجليزية. يركز على بناء الإنسان المسلم.",
    en: "An Indian preacher focused on da'wah, education and spiritual formation, offering lessons and lectures in Arabic and English. He emphasises building the Muslim person.",
    fr: "Prédicateur indien consacré à la da'wa, à l'éducation et à la purification spirituelle, il donne cours et conférences en arabe et en anglais. Il met l'accent sur la formation de la personne musulmane.",
    es: "Predicador indio centrado en la da'wa, la educación y la formación espiritual, con lecciones y conferencias en árabe e inglés. Enfatiza la construcción de la persona musulmana."
  },
  channel: "Shamail Nadwi",
  search: "شمائل ندوي Shamail Nadwi India dawah education"
};

PROFILES.tariq = {
  name: { ar: "الشيخ طارق جميل", en: "Sheikh Tariq Jamil", fr: "Cheikh Tariq Jamil", es: "Sheij Tariq Jamil" },
  country: COUNTRIES.pakistan,
  spec: {
    ar: "دعوة وإصلاح",
    en: "da'wah and reform",
    fr: "da'wa et réforme",
    es: "da'wa y reforma"
  },
  bio: {
    ar: "داعية باكستاني واسع الانتشار، له خطاب إصلاحي يخاطب الجماهير بلغة بسيطة. يهتم بالتربية والأخلاق والتقريب بين المسلمين.",
    en: "A widely followed Pakistani preacher whose reformist message addresses broad audiences in simple language. He focuses on moral formation and strengthening ties among Muslims.",
    fr: "Prédicateur pakistanais très suivi, son discours réformiste s'adresse au grand public dans un langage simple. Il met l'accent sur l'éducation morale et le rapprochement entre musulmans.",
    es: "Predicador pakistaní con gran seguimiento cuyo mensaje reformista llega a amplios públicos con un lenguaje sencillo. Se centra en la formación moral y la unión entre musulmanes."
  },
  channel: "Tariq Jamil",
  search: "طارق جميل Tariq Jamil Pakistan dawah"
};

PROFILES.omar = {
  name: { ar: "الشيخ عمر سليمان", en: "Sheikh Omar Suleiman", fr: "Cheikh Omar Souleiman", es: "Sheij Omar Suleiman" },
  country: COUNTRIES.usa,
  spec: {
    ar: "دعوة وفكر مؤسسي",
    en: "da'wah and institutional thought",
    fr: "da'wa et pensée institutionnelle",
    es: "da'wa y pensamiento institucional"
  },
  bio: {
    ar: "داعية أمريكي ومؤسس معهد يقين، متخصص في الفكر الإسلامي والعمل المؤسسي. يقدّم محاضرات في السيرة والأخلاق وقضايا المسلمين.",
    en: "An American preacher and founder of Yaqeen Institute, specialising in Islamic thought and institutional work. He lectures on the Prophet's life, ethics and issues facing Muslims.",
    fr: "Prédicateur américain et fondateur du Yaqeen Institute, spécialisé en pensée islamique et travail institutionnel. Il donne des conférences sur la sira, l'éthique et les questions des musulmans.",
    es: "Predicador estadounidense y fundador de Yaqeen Institute, especializado en pensamiento islámico y trabajo institucional. Ofrece conferencias sobre la vida del Profeta, ética y temas de los musulmanes."
  },
  channel: "Omar Suleiman",
  search: "عمر سليمان Omar Suleiman Yaqeen dawah"
};

PROFILES.nouman = {
  name: { ar: "الشيخ نعمان علي خان", en: "Sheikh Nouman Ali Khan", fr: "Cheikh Nouman Ali Khan", es: "Sheij Nouman Ali Khan" },
  country: COUNTRIES.usa,
  spec: {
    ar: "دراسات قرآنية",
    en: "Quranic studies",
    fr: "études coraniques",
    es: "estudios coránicos"
  },
  bio: {
    ar: "باحث أمريكي في الدراسات القرآنية ومؤسس معهد بيّنة، يقدّم دورات في تدبر القرآن. يُعرف بأسلوبه التحليلي في البيان اللغوي.",
    en: "An American researcher in Quranic studies and founder of Bayyinah Institute, offering courses on reflecting on the Quran. He is known for his analytical approach to linguistic expression.",
    fr: "Chercheur américain en études coraniques et fondateur du Bayyinah Institute, il propose des cours sur la méditation du Coran. Il est connu pour son approche analytique de l'expression linguistique.",
    es: "Investigador estadounidense en estudios coránicos y fundador de Bayyinah Institute, ofrece cursos sobre la reflexión del Corán. Es conocido por su enfoque analítico de la expresión lingüística."
  },
  channel: "Nouman Ali Khan",
  search: "نعمان علي خان Nouman Ali Khan Bayyinah Quran"
};

Object.keys(PROFILES).forEach((id) => {
  PROFILES[id].id = id;
});

window.A3LAM = { UI, COUNTRIES, CATEGORIES, PROFILES };
