# «Между строк»
Рабочий адрес: https://mezhdu-strok-reader.mezhdu-strok.workers.dev — бот @BetweenLinesApp. Копия исходников и сборки хранится в main репозитория ulikashi/between_lines. Личный прогресс хранится отдельно в Cloudflare Durable Objects.

## Обычная публикация с этого Mac
1. Из корня проекта запустить `python3 scripts/build.py`. Проверить `git status` и diff, добавить нужные исходники и собранные файлы, сделать коммит в main.
2. Запустить `./scripts/release.sh`. Скрипт проверяет чистоту сборки, запускает проверки чтения, отправляет main на GitHub, выполняет wrangler deploy и сверяет публичную страницу со сборкой.
3. Если push отклонён, согласовать изменения с origin/main перед выпуском. Если push прошёл, а деплой не удался, устранить причину и повторить ту же команду.

Wrangler установлен для пользователя macOS. Для диагностики доступа использовать `wrangler whoami`. Только при истёкшей авторизации: `wrangler login --use-keyring --scopes account:read user:read workers:write workers_scripts:write`. Не печатать токены. BOT_TOKEN и WEBHOOK_SECRET хранятся в секретах Worker. Обычный deploy сохраняет их и адрес webhook. Настройка меню и webhook выполняется отдельно при смене домена или ключей. Stars отключены по умолчанию. Не включать реальные платежи без отдельного задания и подготовки поддержки плательщиков и возвратов.

Клиентские исходники лежат в dist, шаблоны в web, backend в worker/index.mjs. Файлы dist/build создаёт scripts/build.py. При изменении UI проверять затронутый путь на телефоне. Имя Worker, привязка READERS и история миграций в wrangler.jsonc сохраняют доступ к профилям.
