# Auth_project
Система автентифікації користувачів із верифікацією email.

## Технологічний стек
- Фронтенд: Vue.js 3, Vue Router, Axios
- Бекенд: NestJS, Mongoose, JWT, Bcrypt
- База даних: MongoDB
- Інфраструктура: Docker, Docker Compose

## Основні фічі
- Реєстрація та верифікація email (Mailtrap).
- Логін із JWT у HTTPOnly куці.
- Захищений маршрут `/dashboard`.
- Логаут із видаленням куки.

## Як запустити
1. `docker-compose up`
2. Відкрийте `http://localhost:8080`

Клієнт буде доступний на http://localhost:8080, сервер — на http://localhost:3000
