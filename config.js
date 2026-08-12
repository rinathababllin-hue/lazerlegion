/* =========================================================
   ЛЕГИОН / ELABUGA — централизованный конфиг. v1.2
   ========================================================= */
window.LEGION_CONFIG = {
  siteUrl: "https://legion-elabuga.ru", // ЗАМЕНИТЬ на реальный домен

  bookingUrl: "https://max.ru/u/f9LHodD0cOLeksA_YaAnCgfBbIbCd3C_2vNnsw1SM3z4hzCgnRlkEHN39AI",
  vkUrl: "https://vk.ru/legion_elabuga",

  contacts: [
    { name: "Андрей",        phone: "+7 995-363-87-05", tel: "+79953638705" },
    { name: "Телефон клуба", phone: "+7 917-858-17-80", tel: "+79178581780" }
  ],

  price: {
    value: 6000,
    currency: "RUB",
    unit: "час",
    note: "Точный расчёт под формат и количество игроков — при записи"
  },

  videoUrl: "",
  analyticsEndpoint: "",

  images: {
    hero: {
      desktop: "public/images/hero/hero-01.webp",
      mobile:  "public/images/hero/hero-01.webp"
    },
    about:   "public/images/team/team-01.webp",
    mission: "public/images/game/game-01.webp",
    final:   "public/images/backgrounds/final-01.webp",
    video: { poster: "public/images/backgrounds/final-01.webp" },
    formats: {
      birthday:  "public/images/team/team-01.webp",
      friends:   "public/images/hero/hero-01.webp",
      corporate: "public/images/backgrounds/final-01.webp",
      kids:      "public/images/game/game-01.webp"
    },
    gallery: [
      "public/images/hero/hero-01.webp",
      "public/images/game/game-01.webp",
      "public/images/team/team-01.webp",
      "public/images/backgrounds/final-01.webp"
    ]
  }
};