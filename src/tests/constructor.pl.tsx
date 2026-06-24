import { test, expect } from '@playwright/test';

const NO_BUN_TEXT_1 = 'text=Выберите булки';
const NO_INGREDIENTS_TEXT = 'text=Выберите начинку';

const BUN_ADD_BUTTON = 'button:has-text("Добавить")';
const INGREDIENT_CARD = 'a[href*="/ingredients/"]';
const CONSTRUCTOR_SECTION = 'main >> text=Краторная булка';

const ORDER_BUTTON = 'button:has-text("Оформить заказ")';
const CLOSE_MODAL_BTN =
  'button:has(svg), [class*="close"], [class*="modal"] svg';
const MODAL_OVERLAY =
  '[class*="overlay"], [class*="Overlay"], [class*="modal"] + div';

test.describe('Проверка работоспособности приложения (Конструктор)', () => {
  test.beforeEach(async ({ page, context }) => {
    // 1. Имитируем авторизацию: подставляем моковые токены в сессию браузера
    await context.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'testRefreshToken');
      document.cookie = 'accessToken=testAccessToken; path=/';
    });

    // 2. Настраиваем перехват запроса на эндпоинт 'api/ingredients' и возвращаем моки
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: '643d69a5c37b0b001cfa093c',
              name: 'Краторная булка N-200i',
              type: 'bun',
              price: 1255,
              proteins: 80,
              fat: 24,
              carbohydrates: 53,
              calories: 420,
              image: 'https://yandex.net',
              image_mobile: 'https://yandex.net',
              image_large: 'https://yandex.net'
            },
            {
              _id: '643d69a5c37b0b001cfa0941',
              name: 'Биокотлета из марсианской хлореллы',
              type: 'main',
              price: 424,
              proteins: 120,
              fat: 84,
              carbohydrates: 13,
              calories: 1400,
              image: 'https://yandex.net',
              image_mobile: 'https://yandex.net',
              image_large: 'https://yandex.net'
            }
          ]
        })
      });
    });

    // Мокаем запрос данных пользователя, чтобы приложение не выдавало 403
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { name: 'Адел', email: 'test@test.com' }
        })
      });
    });

    // Переходим на главную страницу конструктора
    await page.goto('/');
  });

  test('есть возможность добавлять булку и ингредиенты', async ({ page }) => {
    // Проверяем начальное состояние (что конструктор пуст)
    await expect(page.locator(NO_BUN_TEXT_1).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();

    // Нажимаем «Добавить» на булке и на котлете
    await page.locator(BUN_ADD_BUTTON).first().click();
    await page.locator(BUN_ADD_BUTTON).last().click();

    // Проверяем, что ингредиенты попали в правую часть экрана (конструктор)
    await expect(page.locator(CONSTRUCTOR_SECTION).first()).toBeVisible();
    await expect(page.locator('text=Биокотлета')).toBeVisible();
  });

  test('проверка открытия и закрытия модального окна ингредиента', async ({
    page
  }) => {
    // Открытие модального окна ингредиента по клику на карточку
    await page.locator(INGREDIENT_CARD).first().click();
    await expect(page.locator('text=Детали ингредиента')).toBeVisible();

    // Закрытие по клику на крестик
    await page.locator(CLOSE_MODAL_BTN).first().click();
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();

    // Открываем снова для проверки закрытия по оверлею (клику мимо окна)
    await page.locator(INGREDIENT_CARD).first().click();
    await page.locator(MODAL_OVERLAY).first().click({ force: true });
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('проверка нового заказа', async ({ page }) => {
    // Имитируем успешный ответ от сервера при создании заказа с номером 99999
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: { number: 99999 }
        })
      });
    });

    // Собираем бургер
    await page.locator(BUN_ADD_BUTTON).first().click();
    await page.locator(BUN_ADD_BUTTON).last().click();

    // Оформляем заказ
    await page.locator(ORDER_BUTTON).click();

    // Проверяем, что модальное окно открылось и номер заказа верный
    await expect(page.locator('text=99999')).toBeVisible();

    // Закрываем модальное окно заказа
    await page.locator(CLOSE_MODAL_BTN).first().click();
    await expect(page.locator('text=99999')).not.toBeVisible();

    // Проверяем, что после закрытия конструктор стал пуст
    await expect(page.locator(NO_BUN_TEXT_1).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();
  });
});
