import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  clearBurger,
  swapIngredient,
  initialState
} from '../constructor/constructor-slice';

describe('Тестирование редюсера burgerConstructor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('должен возвращать начальное состояние при экшене UNKNOWN', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(
      initialState
    );
  });

  test('должен добавлять булку в объект burger.bun (addIngredient)', () => {
    const mockBun = {
      _id: 'bun1',
      name: 'Краторная булка',
      type: 'bun',
      price: 1255,
      proteins: 0,
      fat: 0,
      carbohydrates: 0,
      calories: 0,
      image: '',
      image_mobile: '',
      image_large: ''
    };

    const action = addIngredient(mockBun);
    const state = constructorReducer(initialState, action);

    expect(state.burger.bun).toEqual(
      expect.objectContaining({ _id: 'bun1', type: 'bun' })
    );
    expect(state.burger.bun).toHaveProperty('id');
  });

  test('должен добавлять начинку в массив burger.ingredients (addIngredient)', () => {
    const mockMain = {
      _id: 'main1',
      name: 'Биокотлета',
      type: 'main',
      price: 424,
      proteins: 0,
      fat: 0,
      carbohydrates: 0,
      calories: 0,
      image: '',
      image_mobile: '',
      image_large: ''
    };

    const action = addIngredient(mockMain);
    const state = constructorReducer(initialState, action);

    expect(state.burger.ingredients).toHaveLength(1);
    expect(state.burger.ingredients[0]).toEqual(
      expect.objectContaining({ _id: 'main1', type: 'main' })
    );
  });

  test('должен менять местами два ингредиента в конструкторе (swapIngredient)', () => {
    const stateWithIngredients = {
      ...initialState,
      burger: {
        bun: null,
        ingredients: [
          {
            _id: 'ing1',
            id: 'id-1',
            name: 'Соус',
            type: 'sauce',
            price: 100,
            proteins: 0,
            fat: 0,
            carbohydrates: 0,
            calories: 0,
            image: '',
            image_mobile: '',
            image_large: ''
          },
          {
            _id: 'ing2',
            id: 'id-2',
            name: 'Котлета',
            type: 'main',
            price: 200,
            proteins: 0,
            fat: 0,
            carbohydrates: 0,
            calories: 0,
            image: '',
            image_mobile: '',
            image_large: ''
          }
        ]
      }
    };

    const state = constructorReducer(
      stateWithIngredients,
      swapIngredient({ first: 0, second: 1 })
    );

    expect(state.burger.ingredients[0].id).toBe('id-2');
    expect(state.burger.ingredients[1].id).toBe('id-1');
  });

  test('должен удалять ингредиент по его уникальному id (removeIngredient)', () => {
    const stateWithIngredient = {
      ...initialState,
      burger: {
        bun: null,
        ingredients: [
          {
            _id: 'main1',
            id: 'unique-id-to-delete',
            name: 'Биокотлета',
            type: 'main',
            price: 424,
            proteins: 0,
            fat: 0,
            carbohydrates: 0,
            calories: 0,
            image: '',
            image_mobile: '',
            image_large: ''
          }
        ]
      }
    };

    const state = constructorReducer(
      stateWithIngredient,
      removeIngredient('unique-id-to-delete')
    );
    expect(state.burger.ingredients).toHaveLength(0);
  });

  test('должен полностью очищать бургер и сбрасывать состояние (clearBurger)', () => {
    const stateWithData = {
      ...initialState,
      burger: {
        bun: {
          _id: 'bun1',
          name: 'Булка',
          type: 'bun',
          price: 100,
          proteins: 0,
          fat: 0,
          carbohydrates: 0,
          calories: 0,
          image: '',
          image_mobile: '',
          image_large: ''
        },
        ingredients: [
          {
            _id: 'main1',
            id: 'id1',
            name: 'Котлета',
            type: 'main',
            price: 200,
            proteins: 0,
            fat: 0,
            carbohydrates: 0,
            calories: 0,
            image: '',
            image_mobile: '',
            image_large: ''
          }
        ]
      }
    };

    const state = constructorReducer(stateWithData, clearBurger());
    expect(state.burger.bun).toBeNull();
    expect(state.burger.ingredients).toHaveLength(0);
  });
});
