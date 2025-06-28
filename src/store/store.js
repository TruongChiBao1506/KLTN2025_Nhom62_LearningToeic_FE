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

// Cấu hình persist cho admin
const persistConfig = {
  key: 'PiniaPersistedstateAdmin',
  storage,
  whitelist: ['isAuthenticatedAdmin'],
};

// Cấu hình persist cho user
const userPersistConfig = {
  key: 'PiniaPersistedstateUser',
  storage,
  whitelist: ['info', 'isAuthenticatedUser'],
};

// Tạo slice admin
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

// Tạo slice user
const userSlice = createSlice({
  name: 'user',
  initialState: {
    info: null,
    isAuthenticatedUser: false,
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.info = action.payload;
    },
    setIsAuthenticatedUser: (state, action) => {
      state.isAuthenticatedUser = action.payload;
    },
    logoutUser: (state) => {
      state.info = null;
      state.isAuthenticatedUser = false;
    },
  },
});

// Export actions
export const { setIsAuthenticatedAdmin } = adminSlice.actions;
export const { setUserInfo, setIsAuthenticatedUser, logoutUser } = userSlice.actions;

// Tạo persisted reducers
const persistedAdminReducer = persistReducer(persistConfig, adminSlice.reducer);
const persistedUserReducer = persistReducer(userPersistConfig, userSlice.reducer);

// Tạo store
export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);