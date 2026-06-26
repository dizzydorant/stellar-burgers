import { test, expect } from '@playwright/test';

// Константы для проверки пустого конструктора
const NO_BUN_TEXT = 'text=Выберите булки';
const NO_INGREDIENTS_TEXT = 'text=Выберите начинку';

// Константы локаторов элементов интерфейса
const CONSTRUCTOR_SECTION = 'main >> text=Краторная булка';
const ORDER_BUTTON = 'button:has-text("Оформить заказ")';

test.describe('Проверка работоспособности приложения (Конструктор)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Имитируем авторизацию
    await page.addInitScript(() => {
      (window as any).localStorage.setItem('refreshToken', 'testRefreshToken');
      (document as any).cookie = 'accessToken=testAccessToken; path=/';
    });

    // 2. Настраиваем перехват запроса ingredients (Mock API)
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

    // 3. Настраиваем перехват запроса данных пользователя
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

    // 4. Переходим на главную страницу
    await page.goto('/');
  });

  test('есть возможность добавлять булку и ингредиенты', async ({ page }) => {
    await expect(page.locator(NO_BUN_TEXT).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();

    const bunAddButton = page
      .locator('div, a, li')
      .filter({ hasText: 'Краторная булка' })
      .first()
      .locator('button', { hasText: 'Добавить' })
      .first();
    const mainAddButton = page
      .locator('div, a, li')
      .filter({ hasText: 'Биокотлета' })
      .first()
      .locator('button', { hasText: 'Добавить' })
      .first();

    await bunAddButton.click();
    await mainAddButton.scrollIntoViewIfNeeded();
    await mainAddButton.click();

    await expect(page.locator(CONSTRUCTOR_SECTION).first()).toBeVisible();
    await expect(page.locator('text=Биокотлета')).toBeVisible();
  });

  test('проверка открытия и закрытия модального окна ингредиента', async ({
    page
  }) => {
    const ingredientTitle = page.locator('text=Краторная булка N-200i').first();

    // Открываем модалку
    await ingredientTitle.click();
    await expect(page.locator('text=Детали ингредиента')).toBeVisible();

    // Закрываем по крестику
    await page.locator('button:has(svg)').first().click({ force: true });
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();

    // Открываем снова и закрываем кликом мимо окна (в угол экрана)
    await ingredientTitle.click();
    await page.mouse.click(10, 10);
    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('проверка нового заказа', async ({ page }) => {
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

    const bunAddButton = page
      .locator('div, a, li')
      .filter({ hasText: 'Краторная булка' })
      .first()
      .locator('button', { hasText: 'Добавить' })
      .first();
    const mainAddButton = page
      .locator('div, a, li')
      .filter({ hasText: 'Биокотлета' })
      .first()
      .locator('button', { hasText: 'Добавить' })
      .first();

    await bunAddButton.click();
    await mainAddButton.scrollIntoViewIfNeeded();
    await mainAddButton.click();

    await page.locator(ORDER_BUTTON).click();
    await expect(page.locator('text=99999')).toBeVisible();

    // Закрываем окно заказа
    await page.locator('button:has(svg)').first().click({ force: true });
    await expect(page.locator('text=99999')).not.toBeVisible();

    await expect(page.locator(NO_BUN_TEXT).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();
  });
});
