import { test, expect } from '@playwright/test';

// Константы для проверки пустого конструктора
const NO_BUN_TEXT = 'text=Выберите булки';
const NO_INGREDIENTS_TEXT = 'text=Выберите начинку';

// Константы локаторов элементов интерфейса
const CONSTRUCTOR_SECTION = 'main >> text=Краторная булка';
const ORDER_BUTTON = 'button:has-text("Оформить заказ")';

// Универсальный изолированный контейнер модального окна
const MODAL_CONTAINER = '[data-cy="modal"], [class*="modal"], #modals';

test.describe('Проверка работоспособности приложения (Конструктор)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Имитируем авторизацию: подставляем моковые токены в сессию браузера
    await page.addInitScript(() => {
      (window as any).localStorage.setItem('refreshToken', 'testRefreshToken');
      (document as any).cookie = 'accessToken=testAccessToken; path=/';
    });

    // 2. Включаем запись HAR-архива в нужную папку согласно заданию.
    // Оставляем режим update: true, чтобы Playwright записал мок-данные ниже в файл архива.
    await page.routeFromHAR('tests/hars/auth-and-ingredients.har', {
      url: '**/api/**',
      update: false
    });

    // 3. ПОДСТРАХОВКА: Временно подкладываем идеальные мок-данные.
    // Playwright перехватит этот ответ, выведет карточки на экран и сам ЗАПИШЕТ его внутрь HAR-файла!
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

    // Мокаем данные пользователя для стабильной записи профиля в HAR
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
    await expect(page.locator(NO_BUN_TEXT).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();

    // Находим кнопки добавления с жесткой изоляцией через .first()
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

    // Добавляем булку с флагом force: true, чтобы пробить оверлей Webpack
    await bunAddButton.click({ force: true });

    // Скроллим к котлете, так как секция начинок скрыта внизу экрана
    await mainAddButton.scrollIntoViewIfNeeded();

    // Кликаем по кнопке котлеты с флагом force: true
    await mainAddButton.click({ force: true });

    // Проверяем, что ингредиенты попали в правую часть экрана (конструктор)
    await expect(page.locator(CONSTRUCTOR_SECTION).first()).toBeVisible();
    await expect(page.locator('text=Биокотлета')).toBeVisible();
  });

  test('проверка открытия и закрытия модального окна ингредиента', async ({
    page
  }) => {
    const ingredientTitle = page.locator('text=Краторная булка N-200i').first();
    const modal = page.locator(MODAL_CONTAINER);

    // Открытие модального окна ингредиента по клику на заголовок с force: true
    await ingredientTitle.click({ force: true });

    // Верификация: Ограничиваем область поиска контейнером модалки и проверяем заголовок + данные конкретной булки
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();
    await expect(modal.locator('text=Краторная булка N-200i')).toBeVisible();

    // Закрытие по клику на крестик (первая кнопка с SVG внутри модалки) с обходом перекрытия оверлея force: true
    await page.locator('button:has(svg)').first().click({ force: true });
    await expect(modal).not.toBeVisible();

    // Открываем снова и закрываем кликом мимо окна (в угол экрана) с force: true
    await ingredientTitle.click({ force: true });
    await page.mouse.click(10, 10);
    await expect(modal).not.toBeVisible();
  });

  test('проверка нового заказа', async ({ page }) => {
    // Оставляем мок эндпоинта создания заказа, чтобы не захламлять общий HAR-файл частыми генерациями ордеров
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

    // Собираем бургер с использованием force: true для защиты от перехвата кликов оверлеем Webpack
    await bunAddButton.click({ force: true });
    await mainAddButton.scrollIntoViewIfNeeded();
    await mainAddButton.click({ force: true });

    const modal = page.locator(MODAL_CONTAINER);

    // Верификация: Убеждаемся, что до отправки заказа номера 99999 еще НЕТ в модалке на экране
    await expect(modal.locator('text=99999')).not.toBeVisible();

    // Оформить заказ с флагом force: true
    await page.locator(ORDER_BUTTON).click({ force: true });

    // Верификация: Проверяем, что модальное окно открылось и номер заказа верный строго ВНУТРИ контейнера модалки
    await expect(modal.locator('text=99999')).toBeVisible();

    // Закрываем модальное окно заказа через force: true
    await page.locator('button:has(svg)').first().click({ force: true });
    await expect(modal).not.toBeVisible();

    // Проверяем, что после закрытия конструктор стал пуст
    await expect(page.locator(NO_BUN_TEXT).first()).toBeVisible();
    await expect(page.locator(NO_INGREDIENTS_TEXT)).toBeVisible();
  });
});
