# Firestore Rules: prototype threat matrix

Rules по умолчанию запрещают доступ к неизвестным коллекциям и ограничивают схемы, размеры строк, количество гостей, длительность, количество позиций предзаказа и допустимые поля.

| Попытка                                       | Ожидаемый результат | Покрытие                                 |
| --------------------------------------------- | ------------------- | ---------------------------------------- |
| Неавторизованный read/write                   | deny                | Rules + emulator test                    |
| Чтение чужого имени/телефона                  | deny                | приватный `users/{uid}/bookings` + test  |
| Чтение обезличенной занятости после входа     | allow               | `availability` + test                    |
| Создание брони без всех slot claims           | deny                | `getAfter()` для каждого слота           |
| Перехват уже занятого слота другим UID        | deny                | immutable owner/booking на update + test |
| Отмена без одновременного освобождения слотов | deny                | booking/availability/slot consistency    |
| Запись конфигурации обычным пользователем     | deny                | admin marker/custom claim + test         |
| Самостоятельное назначение admin              | deny                | `admins` client writes disabled          |
| Лишние поля / role injection / quantity 999   | deny                | `hasOnly`, bounds + test                 |
| Неограниченные заметки/телефон/имя            | deny                | string limits                            |
| Гость сам ставит заказу `accepted`/`ready`     | deny                | owner order transition allowlist         |
| Администратор перепрыгивает этапы заказа       | deny                | staff order transition allowlist         |
| Гость меняет состав принятого заказа           | deny                | preorder immutable after acceptance      |
| Заказ без позиций или более 12 строк           | deny                | order/status invariant + bounded list    |
| Collection-group `bookings` обычным аккаунтом  | deny                | recursive read разрешён только admin     |
| Collection-group `bookings` администратором    | allow               | live query test после исправления        |

## Модель заказа

Заказ хранится внутри приватной брони и наследует её владельца. Клиент создаёт бронь без заказа, затем может отправить непустой предзаказ в статусе `pending` и править его, пока сотрудник не принял заказ. Сотрудник может провести заказ только по цепочке `pending → accepted → preparing → ready → completed`; отказ разрешён из `pending` и `accepted`. Отмена брони атомарно переводит связанный заказ в `cancelled`.

## Проверка в облаке

27 октября 2026 года выполнен live E2E в `projectbar-d23d5`: регистрация временного пользователя, атомарное создание брони с четырьмя слотами, realtime-чтение, отмена и освобождение слотов. Затем временный Auth-пользователь и все тестовые документы удалены.

Дополнительно воспроизведена ошибка админ-панели отдельным временным администратором: точечные подписки проходили, но `collectionGroup("bookings")` получал `permission-denied`. После добавления admin-only recursive match повторно проверяются все шесть подписок. Обычный пользователь не получает collection-group доступ; роль по-прежнему нельзя создать через клиентские правила.

## Не завершено

Firestore Emulator JAR не скачался из Google Storage в текущей сети, поэтому тестовый файл создан, но полный emulator run пока не завершён. Перед широким публичным запуском всё ещё нужен успешный `npm run test:rules` и adversarial staging-проход двумя аккаунтами.

Rules являются прототипом, а не утверждением о завершённом production security review.
