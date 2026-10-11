/**
 * Check onboarding + questions UI copy by profile language.
 * API triage uses the same codes (en, es, zh, fr, pt, ar, hi); "other" falls back to English UI.
 */

export type CheckLangCode = "en" | "es" | "zh" | "fr" | "pt" | "ar" | "hi" | "other";

export function normalizeCheckLang(code: string | undefined): CheckLangCode {
  const c = (code || "en").split("-")[0].toLowerCase();
  const ok: CheckLangCode[] = ["en", "es", "zh", "fr", "pt", "ar", "hi", "other"];
  if (ok.includes(c as CheckLangCode)) return c as CheckLangCode;
  return "en";
}

export function isRtlLang(code: string | undefined): boolean {
  return normalizeCheckLang(code) === "ar";
}

export type CheckOnboardingCopy = {
  stepAnnouncer: (step: number, total: number) => string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  stepSubtitleDefault: string;
  stepSubtitleLast: string;
  ageLegend: string;
  zipLabel: string;
  zipOptional: string;
  zipPlaceholder: string;
  zipHint: string;
  insuranceLegend: string;
  insuranceHint: string;
  languageLegend: string;
  accessibilityLegend: string;
  accessibilityHint: string;
  reducedMotion: string;
  largeText: string;
  modeLegend: string;
  back: string;
  cancel: string;
  skip: string;
  nextStep: string;
  startCheck: string;
  ariaNext1: string;
  ariaNext2: string;
  ariaNext3: string;
  ageLabel45: string;
  ageLabelPreferNot: string;
  insuranceLabels: Record<string, string>;
  careQuickLabel: string;
  careQuickDesc: string;
  careGuidedLabel: string;
  careGuidedDesc: string;
};

export type QuestionsUiCopy = {
  backToSetup: string;
  backAria: string;
  progressLabel: string;
  questionsLeft: (n: number) => string;
  emergencyTitle: string;
  emergencyBody: string;
  describeSr: string;
  inputPlaceholder: string;
  inputAria: string;
  sendAria: string;
  thinkingAria: string;
  loadingAria: string;
  demoChips: string[];
  fallbackWelcome: string;
  finalizeWait: string;
  errorConnect: string;
};

const INS_EN: Record<string, string> = {
  "parent-plan": "On parent's plan",
  "student-plan": "Student health plan",
  marketplace: "Marketplace / ACA plan",
  medicaid: "Medicaid / CHIP",
  employer: "Employer plan",
  uninsured: "No insurance",
  unsure: "Not sure",
};

const INS_ES: Record<string, string> = {
  "parent-plan": "Plan de mis padres",
  "student-plan": "Plan de salud estudiantil",
  marketplace: "Mercado / plan ACA",
  medicaid: "Medicaid / CHIP",
  employer: "Plan del empleador",
  uninsured: "Sin seguro",
  unsure: "No estoy seguro/a",
};

function onboardingEn(): CheckOnboardingCopy {
  return {
    stepAnnouncer: (step, total) => `Step ${step} of ${total}`,
    step1Title: "About you",
    step2Title: "Insurance status",
    step3Title: "Language & preferences",
    step4Title: "How do you want to proceed?",
    stepSubtitleDefault: "Skip anything you'd prefer not to share.",
    stepSubtitleLast: "Choose what feels right — you can always ask more questions after.",
    ageLegend: "Your age range",
    zipLabel: "ZIP code or city",
    zipOptional: "(optional)",
    zipPlaceholder: "e.g. 94102 or Austin, TX",
    zipHint: "Used to find care near you — never stored.",
    insuranceLegend: "Insurance status",
    insuranceHint: "(optional — helps with cost estimates)",
    languageLegend: "Preferred language",
    accessibilityLegend: "Accessibility",
    accessibilityHint: "(optional)",
    reducedMotion: "Reduced motion / fewer animations",
    largeText: "Larger text size",
    modeLegend: "How would you like to do this?",
    back: "Back",
    cancel: "Cancel",
    skip: "Skip",
    nextStep: "Next step",
    startCheck: "Start check",
    ariaNext1: "insurance status",
    ariaNext2: "language preferences",
    ariaNext3: "check mode",
    ageLabel45: "45 or older",
    ageLabelPreferNot: "Prefer not to say",
    insuranceLabels: INS_EN,
    careQuickLabel: "Quick answer",
    careQuickDesc: "Just tell me what to do",
    careGuidedLabel: "Walk me through it",
    careGuidedDesc: "Explain things as we go",
  };
}

function onboardingEs(): CheckOnboardingCopy {
  const en = onboardingEn();
  return {
    ...en,
    stepAnnouncer: (step, total) => `Paso ${step} de ${total}`,
    step1Title: "Sobre ti",
    step2Title: "Seguro médico",
    step3Title: "Idioma y preferencias",
    step4Title: "¿Cómo quieres continuar?",
    stepSubtitleDefault: "Puedes omitir lo que prefieras no compartir.",
    stepSubtitleLast: "Elige lo que te resulte cómodo — siempre podrás preguntar más después.",
    ageLegend: "Tu rango de edad",
    zipLabel: "Código postal o ciudad",
    zipOptional: "(opcional)",
    zipPlaceholder: "p. ej. 94102 o Austin, TX",
    zipHint: "Para encontrar atención cerca de ti — no se guarda.",
    insuranceLegend: "Estado del seguro",
    insuranceHint: "(opcional — ayuda a estimar costos)",
    languageLegend: "Idioma preferido",
    accessibilityLegend: "Accesibilidad",
    accessibilityHint: "(opcional)",
    reducedMotion: "Menos movimiento / animaciones",
    largeText: "Texto más grande",
    modeLegend: "¿Cómo te gustaría hacerlo?",
    back: "Atrás",
    cancel: "Cancelar",
    skip: "Omitir",
    nextStep: "Siguiente",
    startCheck: "Empezar revisión",
    ariaNext1: "seguro médico",
    ariaNext2: "idioma y preferencias",
    ariaNext3: "modo de revisión",
    ageLabel45: "45 años o más",
    ageLabelPreferNot: "Prefiero no decir",
    insuranceLabels: INS_ES,
    careQuickLabel: "Respuesta rápida",
    careQuickDesc: "Solo dime qué hacer",
    careGuidedLabel: "Guíame paso a paso",
    careGuidedDesc: "Explícame mientras avanzamos",
  };
}

/** Non-English UI: step chrome + nav; insurance/care strings stay English where not overridden. */
function overlay(
  base: CheckOnboardingCopy,
  patch: Partial<CheckOnboardingCopy>
): CheckOnboardingCopy {
  return {
    ...base,
    ...patch,
    insuranceLabels: { ...base.insuranceLabels, ...(patch.insuranceLabels ?? {}) },
  };
}

const ONBOARDING_BY_LANG: Record<CheckLangCode, CheckOnboardingCopy> = {
  en: onboardingEn(),
  es: onboardingEs(),
  zh: overlay(onboardingEn(), {
    stepAnnouncer: (s, t) => `第 ${s} 步，共 ${t} 步`,
    step1Title: "关于您",
    step2Title: "保险情况",
    step3Title: "语言与偏好",
    step4Title: "您希望如何进行？",
    stepSubtitleDefault: "不愿填写的项目可以跳过。",
    stepSubtitleLast: "按您觉得合适的方式选择——之后还可以继续提问。",
    ageLegend: "年龄段",
    zipLabel: "邮编或城市",
    zipPlaceholder: "例如 94102 或 北京市",
    zipHint: "用于查找附近的医疗资源 — 不会保存。",
    insuranceLegend: "保险状态",
    languageLegend: "首选语言",
    accessibilityLegend: "无障碍",
    reducedMotion: "减少动效",
    largeText: "更大字号",
    modeLegend: "您希望以哪种方式进行？",
    back: "返回",
    cancel: "取消",
    skip: "跳过",
    nextStep: "下一步",
    startCheck: "开始检查",
    ariaNext1: "保险",
    ariaNext2: "语言与偏好",
    ariaNext3: "检查模式",
    ageLabel45: "45 岁及以上",
    ageLabelPreferNot: "不愿透露",
  }),
  fr: overlay(onboardingEn(), {
    stepAnnouncer: (s, t) => `Étape ${s} sur ${t}`,
    step1Title: "À propos de vous",
    step2Title: "Assurance",
    step3Title: "Langue et préférences",
    step4Title: "Comment souhaitez-vous continuer ?",
    stepSubtitleDefault: "Vous pouvez ignorer ce que vous préférez ne pas partager.",
    stepSubtitleLast: "Choisissez ce qui vous convient — vous pourrez poser d'autres questions ensuite.",
    ageLegend: "Tranche d'âge",
    zipLabel: "Code postal ou ville",
    zipPlaceholder: "ex. 75001 ou Paris",
    zipHint: "Pour trouver des soins près de chez vous — rien n'est stocké.",
    insuranceLegend: "Statut d'assurance",
    languageLegend: "Langue préférée",
    accessibilityLegend: "Accessibilité",
    reducedMotion: "Moins d'animations",
    largeText: "Texte plus grand",
    modeLegend: "Comment voulez-vous procéder ?",
    back: "Retour",
    cancel: "Annuler",
    skip: "Passer",
    nextStep: "Suivant",
    startCheck: "Commencer",
    ariaNext1: "assurance",
    ariaNext2: "langue",
    ariaNext3: "mode",
    ageLabel45: "45 ans ou plus",
    ageLabelPreferNot: "Je préfère ne pas répondre",
  }),
  pt: overlay(onboardingEn(), {
    stepAnnouncer: (s, t) => `Passo ${s} de ${t}`,
    step1Title: "Sobre você",
    step2Title: "Plano de saúde",
    step3Title: "Idioma e preferências",
    step4Title: "Como você quer continuar?",
    stepSubtitleDefault: "Pule o que preferir não compartilhar.",
    stepSubtitleLast: "Escolha o que fizer sentido — você pode tirar mais dúvidas depois.",
    ageLegend: "Faixa etária",
    zipLabel: "CEP ou cidade",
    zipPlaceholder: "ex.: 01310 ou São Paulo",
    zipHint: "Para achar atendimento perto de você — não é armazenado.",
    insuranceLegend: "Situação do seguro",
    languageLegend: "Idioma preferido",
    accessibilityLegend: "Acessibilidade",
    reducedMotion: "Menos movimento / animações",
    largeText: "Texto maior",
    modeLegend: "Como você prefere fazer isso?",
    back: "Voltar",
    cancel: "Cancelar",
    skip: "Pular",
    nextStep: "Próximo",
    startCheck: "Começar",
    ariaNext1: "seguro",
    ariaNext2: "idioma",
    ariaNext3: "modo",
    ageLabel45: "45 anos ou mais",
    ageLabelPreferNot: "Prefiro não dizer",
  }),
  ar: overlay(onboardingEn(), {
    stepAnnouncer: (s, t) => `الخطوة ${s} من ${t}`,
    step1Title: "عنك",
    step2Title: "حالة التأمين",
    step3Title: "اللغة والتفضيلات",
    step4Title: "كيف تريد المتابعة؟",
    stepSubtitleDefault: "يمكنك تخطي ما تفضّل عدم مشاركته.",
    stepSubtitleLast: "اختر ما يناسبك — يمكنك طرح المزيد من الأسئلة لاحقًا.",
    ageLegend: "فئتك العمرية",
    zipLabel: "الرمز البريدي أو المدينة",
    zipPlaceholder: "مثال: 11564",
    zipHint: "للبحث عن رعاية قريبة منك — لا نخزّنها.",
    insuranceLegend: "حالة التأمين",
    languageLegend: "اللغة المفضّلة",
    accessibilityLegend: "إمكانية الوصول",
    reducedMotion: "تقليل الحركة والرسوم المتحركة",
    largeText: "حجم نص أكبر",
    modeLegend: "كيف تريد إجراء ذلك؟",
    back: "رجوع",
    cancel: "إلغاء",
    skip: "تخطّي",
    nextStep: "التالي",
    startCheck: "ابدأ الفحص",
    ariaNext1: "التأمين",
    ariaNext2: "اللغة",
    ariaNext3: "الوضع",
    ageLabel45: "45 عامًا فأكثر",
    ageLabelPreferNot: "أفضّل عدم الإفصاح",
  }),
  hi: overlay(onboardingEn(), {
    stepAnnouncer: (s, t) => `चरण ${s} / ${t}`,
    step1Title: "आपके बारे में",
    step2Title: "बीमा स्थिति",
    step3Title: "भाषा और वरीयताएँ",
    step4Title: "आगे कैसे बढ़ना चाहते हैं?",
    stepSubtitleDefault: "जो साझा नहीं करना चाहें, उसे छोड़ सकते हैं।",
    stepSubtitleLast: "जो सही लगे वह चुनें — बाद में और प्रश्न पूछ सकते हैं।",
    ageLegend: "आयु सीमा",
    zipLabel: "पिन कोड या शहर",
    zipPlaceholder: "जैसे 110001 या दिल्ली",
    zipHint: "आपके पास देखभाल ढूँढने के लिए — सहेजा नहीं जाता।",
    insuranceLegend: "बीमा की स्थिति",
    languageLegend: "पसंदीदा भाषा",
    accessibilityLegend: "पहुँच",
    reducedMotion: "कम गति / एनीमेशन",
    largeText: "बड़ा टेक्स्ट",
    modeLegend: "आप इसे कैसे करना चाहेंगे?",
    back: "पीछे",
    cancel: "रद्द करें",
    skip: "छोड़ें",
    nextStep: "अगला",
    startCheck: "जाँच शुरू करें",
    ariaNext1: "बीमा",
    ariaNext2: "भाषा",
    ariaNext3: "मोड",
    ageLabel45: "45 या उससे अधिक",
    ageLabelPreferNot: "बताना नहीं चाहता/चाहती",
  }),
  other: onboardingEn(),
};

export function getCheckOnboardingStrings(lang: string | undefined): CheckOnboardingCopy {
  const code = normalizeCheckLang(lang);
  return code === "other" ? ONBOARDING_BY_LANG.en : ONBOARDING_BY_LANG[code];
}

function questionsEn(): QuestionsUiCopy {
  return {
    backToSetup: "Back",
    backAria: "Back to onboarding setup",
    progressLabel: "Check-in progress",
    questionsLeft: (n) => `~${n} questions left`,
    emergencyTitle: "This sounds like an emergency.",
    emergencyBody: "Call 911 or go to the ER immediately. Don't wait.",
    describeSr: "Describe your symptoms",
    inputPlaceholder: "Describe how you're feeling…",
    inputAria: "Type your response here. Press Enter to send, Shift+Enter for new line.",
    sendAria: "Send message",
    thinkingAria: "BridgeCare is thinking",
    loadingAria: "Loading",
    demoChips: [
      "I've had a headache behind my eyes for 2 days, around 6/10 pain",
      "Feeling dizzy, anxious, chest tightness for 3 days",
      "Sore throat and fever since yesterday",
    ],
    fallbackWelcome:
      "Hey! Tell me what's going on today. Describe how you're feeling — your own words are perfect.",
    finalizeWait:
      "I have enough information to assess your situation. Let me pull up your results…",
    errorConnect:
      "I'm having trouble connecting. Please try again — or call your doctor directly if this feels urgent.",
  };
}

const QUESTIONS_BY_LANG: Record<CheckLangCode, QuestionsUiCopy> = {
  en: questionsEn(),
  es: {
    ...questionsEn(),
    backToSetup: "Atrás",
    backAria: "Volver a la configuración inicial",
    progressLabel: "Progreso del chequeo",
    questionsLeft: (n) => `~${n} preguntas restantes`,
    emergencyTitle: "Esto suena a una emergencia.",
    emergencyBody: "Llama al 911 o ve a urgencias de inmediato. No esperes.",
    describeSr: "Describe tus síntomas",
    inputPlaceholder: "Describe cómo te sientes…",
    inputAria: "Escribe tu respuesta. Enter para enviar, Mayús+Enter para nueva línea.",
    sendAria: "Enviar mensaje",
    thinkingAria: "BridgeCare está pensando",
    loadingAria: "Cargando",
    demoChips: [
      "Llevo 2 días con dolor de cabeza detrás de los ojos, unos 6/10",
      "Mareos, ansiedad y opresión en el pecho desde hace 3 días",
      "Dolor de garganta y fiebre desde ayer",
    ],
    fallbackWelcome:
      "¡Hola! Cuéntame qué te pasa hoy. Describe cómo te sientes con tus propias palabras.",
    finalizeWait:
      "Ya tengo suficiente información para evaluar tu situación. Preparando tus resultados…",
    errorConnect:
      "No puedo conectar ahora. Inténtalo de nuevo — o llama a tu médico si es urgente.",
  },
  zh: {
    ...questionsEn(),
    backToSetup: "返回",
    backAria: "返回设置",
    progressLabel: "检查进度",
    questionsLeft: (n) => `约剩 ${n} 个问题`,
    emergencyTitle: "这听起来像紧急情况。",
    emergencyBody: "请拨打 911 或立即前往急诊。不要等待。",
    describeSr: "描述您的症状",
    inputPlaceholder: "请描述您的感受…",
    inputAria: "在此输入。回车发送，Shift+回车换行。",
    sendAria: "发送",
    thinkingAria: "正在思考",
    loadingAria: "加载中",
    demoChips: questionsEn().demoChips,
    fallbackWelcome: "嗨！今天哪里不舒服？请用您自己的话描述。",
    finalizeWait: "信息已足够，正在生成结果…",
    errorConnect: "连接出现问题，请重试；若很紧急请直接联系医生。",
  },
  fr: {
    ...questionsEn(),
    backToSetup: "Retour",
    backAria: "Retour à la configuration",
    progressLabel: "Progression",
    questionsLeft: (n) => `~${n} questions restantes`,
    emergencyTitle: "Cela ressemble à une urgence.",
    emergencyBody: "Appelez le 911 ou allez aux urgences immédiatement.",
    describeSr: "Décrivez vos symptômes",
    inputPlaceholder: "Décrivez ce que vous ressentez…",
    inputAria: "Saisissez votre réponse. Entrée pour envoyer.",
    sendAria: "Envoyer",
    thinkingAria: "Réflexion en cours",
    loadingAria: "Chargement",
    demoChips: questionsEn().demoChips,
    fallbackWelcome: "Bonjour ! Qu’est-ce qui se passe aujourd’hui ? Décrivez avec vos mots.",
    finalizeWait: "J’ai assez d’informations. Préparation de vos résultats…",
    errorConnect: "Connexion impossible. Réessayez — ou appelez votre médecin si c’est urgent.",
  },
  pt: {
    ...questionsEn(),
    backToSetup: "Voltar",
    backAria: "Voltar à configuração",
    progressLabel: "Progresso do check-in",
    questionsLeft: (n) => `~${n} perguntas restantes`,
    emergencyTitle: "Isso parece uma emergência.",
    emergencyBody: "Ligue para o 911 ou vá ao pronto-socorro imediatamente.",
    describeSr: "Descreva seus sintomas",
    inputPlaceholder: "Descreva como você se sente…",
    inputAria: "Digite sua resposta. Enter para enviar.",
    sendAria: "Enviar",
    thinkingAria: "Pensando",
    loadingAria: "Carregando",
    demoChips: questionsEn().demoChips,
    fallbackWelcome: "Oi! O que está acontecendo hoje? Descreva com suas palavras.",
    finalizeWait: "Tenho informações suficientes. Abrindo seus resultados…",
    errorConnect: "Falha na conexão. Tente de novo — ou ligue ao seu médico se for urgente.",
  },
  ar: {
    ...questionsEn(),
    backToSetup: "رجوع",
    backAria: "العودة إلى الإعداد",
    progressLabel: "تقدّم الفحص",
    questionsLeft: (n) => `~${n} أسئلة متبقية`,
    emergencyTitle: "يبدو أن هذا طارئ.",
    emergencyBody: "اتصل بـ 911 أو اذهب للطوارئ فورًا. لا تنتظر.",
    describeSr: "صف أعراضك",
    inputPlaceholder: "صف شعورك…",
    inputAria: "اكتب ردك. Enter للإرسال.",
    sendAria: "إرسال",
    thinkingAria: "جارٍ التفكير",
    loadingAria: "جارٍ التحميل",
    demoChips: questionsEn().demoChips,
    fallbackWelcome: "مرحبًا! ما الذي يحدث اليوم؟ صِف شعورك بكلماتك.",
    finalizeWait: "لديّ معلومات كافية. جارٍ إظهار النتائج…",
    errorConnect: "تعذّر الاتصال. أعد المحاولة — أو اتصل بطبيبك إن كان الأمر عاجلًا.",
  },
  hi: {
    ...questionsEn(),
    backToSetup: "पीछे",
    backAria: "सेटअप पर लौटें",
    progressLabel: "जाँच की प्रगति",
    questionsLeft: (n) => `~${n} प्रश्न बाकी`,
    emergencyTitle: "यह आपातकाल जैसा लगता है।",
    emergencyBody: "911 पर कॉल करें या तुरंत ER जाएँ। इंतज़ार न करें।",
    describeSr: "लक्षण बताइए",
    inputPlaceholder: "अपनी स्थिति बताइए…",
    inputAria: "यहाँ लिखें। भेजने के लिए Enter।",
    sendAria: "भेजें",
    thinkingAria: "सोच रहा है",
    loadingAria: "लोड हो रहा है",
    demoChips: questionsEn().demoChips,
    fallbackWelcome: "नमस्ते! आज क्या हो रहा है? अपने शब्दों में बताइए।",
    finalizeWait: "पर्याप्त जानकारी मिल गई। परिणाम दिखा रहे हैं…",
    errorConnect: "कनेक्ट नहीं हो पा रहा। फिर कोशिश करें — या डॉक्टर को कॉल करें।",
  },
  other: questionsEn(),
};

export function getQuestionsUiStrings(lang: string | undefined): QuestionsUiCopy {
  const code = normalizeCheckLang(lang);
  return code === "other" ? QUESTIONS_BY_LANG.en : QUESTIONS_BY_LANG[code];
}

export function ageRangeLabel(lang: string | undefined, value: string, defaultLabel: string): string {
  const o = getCheckOnboardingStrings(lang);
  if (value === "45+") return o.ageLabel45;
  if (value === "prefer-not") return o.ageLabelPreferNot;
  return defaultLabel;
}

export function insuranceLabel(lang: string | undefined, value: string, defaultLabel: string): string {
  const o = getCheckOnboardingStrings(lang);
  return o.insuranceLabels[value] ?? defaultLabel;
}

export function careModeCopy(
  lang: string | undefined,
  value: "quick" | "guided"
): { label: string; description: string } {
  const o = getCheckOnboardingStrings(lang);
  if (value === "quick") return { label: o.careQuickLabel, description: o.careQuickDesc };
  return { label: o.careGuidedLabel, description: o.careGuidedDesc };
}
