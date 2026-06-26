import { ingredientsReducer } from '../ingredients/ingredients-slice';
import { getIngredientsThunk } from '../ingredients/actions';

describe('Тестирование редюсера ingredients', () => {
  const initialState = {
    ingredients: [],
    loading: false,
    error: null
  };

  test('должен возвращать начальное состояние при экшене UNKNOWN', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(
      initialState
    );
  });

  test('должен обрабатывать экшен getIngredientsThunk.pending', () => {
    const action = { type: getIngredientsThunk.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('должен обрабатывать экшен getIngredientsThunk.fulfilled', () => {
    const mockIngredients = [
      {
        _id: '643d69a5c37b0b001cfa093c',
        name: 'Краторная булка N-200i',
        type: 'bun',
        price: 1255,
        proteins: 80,
        fat: 24,
        carbohydrates: 53,
        calories: 420,
        image: '',
        image_mobile: '',
        image_large: ''
      }
    ];
    const action = {
      type: getIngredientsThunk.fulfilled.type,
      payload: mockIngredients
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.ingredients).toEqual(mockIngredients);
  });

  test('должен обрабатывать экшен getIngredientsThunk.rejected', () => {
    const errorMessage = 'Ошибка загрузки ингредиентов';
    const action = {
      type: getIngredientsThunk.rejected.type,
      payload: errorMessage
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });
});
