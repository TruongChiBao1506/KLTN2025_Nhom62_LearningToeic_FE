import { createSlice, configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

// Cấu hình persist
const persistConfig = {
  key: 'PiniaPersistedstateAdmin',
  storage,
  whitelist: ['isAuthenticatedAdmin'], // Chỉ persist field này
};

// Tạo slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    isAuthenticatedAdmin: false,
  },
  reducers: {
    setIsAuthenticatedAdmin: (state, action) => {
      state.isAuthenticatedAdmin = action.payload;
    },
  },
});

// Export actions
export const { setIsAuthenticatedAdmin } = adminSlice.actions;

// Tạo persisted reducer
const persistedAdminReducer = persistReducer(persistConfig, adminSlice.reducer);

// Tạo store
export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);