# ЛЕГИОН — лазертаг-клуб, Елабуга

Production landing. Работает как статика (без backend и БД).
Конверсия: любая кнопка «Записаться» → MAX (target=_blank, rel=noopener noreferrer), событие `booking_click` в `dataLayer`.

## Быстрый старт
1. Откройте `index.html` (или `docker compose up` → http://localhost:8080).
2. Положите фото в папки и сверьте пути в `config.js`:
   - фото 1 → `images/hero/hero-01.webp`
   - фото 2 → `images/game/game-01.webp`
   - фото 3 → `images/team/team-01.webp`
   - фото 4 → `images/backgrounds/final-01.webp`
3. Замените домен в `index.html` (canonical/OG), `robots.txt`, `sitemap.xml`, `config.js`.

## Данные клуба
Проверенный факт (VK): выездной лазертаг в Елабуге. Всё остальное помечено
`// [ДОБАВИТЬ…]` / `// [ПРОВЕРИТЬ ФОРМАТ]` — заменить после подтверждения клубом.
Телефон из VK лежит в `config.js` закомментированным до проверки.

## Роадмап (архитектура CMS-ready)
Next.js (UI) → NestJS REST API (`/api/games|formats|gallery|reviews|faq|settings|analytics`) → PostgreSQL
(users/admins/events/games/game_formats/reviews/gallery/faq/contacts/analytics/settings),
JWT+RBAC (ADMIN/MANAGER/EDITOR/USER), `/admin`. Python/FastAPI — только для аналитики/обработки изображений.
Статика сейчас = слой presentation; компоненты читают данные из `config.js`,
поэтому подключение Strapi/Sanity/Directus/Payload не потребует переписывать UI.

## Деплой
Vercel/Netlify/Cloudflare Pages: publish `.` как static site. Docker: `docker compose up --build`.