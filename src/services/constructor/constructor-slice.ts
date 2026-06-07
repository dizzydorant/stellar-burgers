import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient } from '@utils-types';

export interface ConstructorState {
  burger: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  isLoading: boolean;
  error: string | undefined;
}

const cachedBurger = localStorage.getItem('myconstructor_burger');
const parsedBurger = cachedBurger ? JSON.parse(cachedBurger) : null;

export const initialState: ConstructorState = {
  burger: {
    bun: parsedBurger?.bun || null,
    ingredients: parsedBurger?.ingredients || []
  },
  isLoading: false,
  error: undefined
};

export const constructorSlice = createSlice({
  name: 'myconstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.burger.bun = action.payload;
        } else {
          state.burger.ingredients.push(action.payload);
        }
        localStorage.setItem(
          'myconstructor_burger',
          JSON.stringify(state.burger)
        );
      },
      prepare: (ingredient: TIngredient) => {
        const id = nanoid();
        return { payload: { ...ingredient, id } };
      }
    },

    swapIngredient: (state, action) => {
      const tmp = state.burger.ingredients[action.payload.first];
      state.burger.ingredients[action.payload.first] =
        state.burger.ingredients[action.payload.second];
      state.burger.ingredients[action.payload.second] = tmp;
      localStorage.setItem(
        'myconstructor_burger',
        JSON.stringify(state.burger)
      );
    },

    removeIngredient: (state, action) => {
      state.burger.ingredients = state.burger.ingredients.filter(
        (ing) => ing._id !== action.payload
      );
      localStorage.setItem(
        'myconstructor_burger',
        JSON.stringify(state.burger)
      );
    },

    clearBurger(state) {
      state.burger.bun = null;
      state.burger.ingredients = [];
      localStorage.removeItem('myconstructor_burger');
    }
  },
  selectors: {
    selectBurgerConstructor: (state) => state.burger
  }
});

export const { selectBurgerConstructor } = constructorSlice.selectors;

export const { addIngredient, removeIngredient, clearBurger, swapIngredient } =
  constructorSlice.actions;

export const constructorReducer = constructorSlice.reducer;
