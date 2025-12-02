
import { createSlice, configureStore } from '@reduxjs/toolkit';
import notificationReducer from './notificationSlice.js';
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
import storage from 'redux-persist/lib/storage';

// Cấu hình persist cho auth
const persistConfig = {
  key: 'PiniaPersistedstateAuth',
  storage,
  whitelist: ['info', 'isAuthenticated', 'role'],
};

// Tạo slice auth
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    info: null, // Thông tin người dùng
    isAuthenticated: false,
    role: null, // 'admin', 'teacher', hoặc 'user'/'learner'
  },
  reducers: {
    setInfo: (state, action) => {
      state.info = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    logout: (state) => {
      state.info = null;
      state.isAuthenticated = false;
      state.role = null;
    },
  },
});

// Export actions
export const { setInfo, setIsAuthenticated, setRole, logout } = authSlice.actions;

// Tạo persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

// Tạo store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);