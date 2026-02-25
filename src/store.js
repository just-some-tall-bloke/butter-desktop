'use strict;'

import {configureStore, combineReducers} from '@reduxjs/toolkit'
import { connectRouter } from 'connected-react-router'
import reduxProviderAdapter from 'butter-redux-provider'

import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist'
import createIdbStorage from 'redux-persist-indexeddb-storage'
import localforage from 'localforage'

import markers from './redux/markers'
import filters from './redux/filters'
import streamer from './redux/streamer'
import settings from './redux/settings'

const { electronAPI } = window

const forageConfig = {
  name: 'Butter',
  version: 1.0,
  size: 4980736
}

const loadCache = async () => {
  const store = localforage.createInstance(Object.assign({storeName: 'butter_cache'},
    forageConfig))
  const keys = await store.keys()
  const dehydrate = await Promise.all(keys.map(k => store.getItem(k)))
  return createCache(store, dehydrate)
}

const createCache = (store, dehydrate = []) => {
  const {LRU} = require('lru-cache')
  const cache = new LRU({
    max: 1000,
    dispose: (k) => store.removeItem(k)
  })

  cache.load(dehydrate)

  cache.tick = setTimeout(() => {
    console.error('saving cache')
    cache.dump().map(hit => setTimeout(() => store.setItem(hit.k, hit), 0))
  }, 15000)

  return cache
}

const providersFromTab = (tab) => (
  tab.providers.map(uri => {
    const name = uri.split('?')[0]
    let instance = null

    try {
      const Provider = await electronAPI.requireModule(`butter-provider-${name}`)
      instance = new Provider(uri)
    } catch (e) {
      console.error('couldnt load provider', name)
      return null
    }

    return instance
  }).filter(e => e)
)

const reducersFromTabs = (tabs, cache) => {
  let providerReducers = {}
  let providerActions = {}

  const tabsReducers = Object.keys(tabs).reduce((acc, k) => {
    const tab = tabs[k]

    const providers = providersFromTab(tab)
    providers.forEach(provider => {
      const reduxer = reduxProviderAdapter(provider, cache)
      providerReducers[provider.id] = reduxer.reducer
      providerActions[provider.id] = reduxer.actions
    })

    return Object.assign(acc, {
      [k]: Object.assign(tab, {
        providers: providers.map(({config, id}) => ({config, id}))
      })
    })
  }, {})

  return {
    providerReducers: {
      collections: combineReducers(providerReducers),
      tabs: (state, action) => ({
        ...tabsReducers
      })
    },
    providerActions
  }
}

export const createRootReducer = (history, tabs, cachedSettings, cache) => {
  const {providerActions, providerReducers} = reducersFromTabs(tabs, cache)
  return combineReducers({
    ...providerReducers,
    markers: markers.reducer,
    filters: filters.reducer,
    streamer: streamer.reducer,
    settings: settings.reducerCreator(cachedSettings),
    router: connectRouter(history),
    cache: () => cache,
    providerActions: () => providerActions,
  })
}

const persistConfig = {
  key: 'butter',
  version: 1,
  storage: createIdbStorage({
    dbName: 'butterstorage',
    storeName: 'redux_storage'
  }),
  whitelist: ['markers', 'settings']
}

export const butterCreateStore = async (history, {tabs, ...cachedSettings}) => {
  const cache = await loadCache()
  const rootReducer = createRootReducer(history, tabs, cachedSettings, cache)
  const persistedReducer = persistReducer(persistConfig, rootReducer)

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredPaths: ['cache']
        }
      })
  })

  const persistor = persistStore(store)

  const {providerActions} = store.getState()

  Object.values(providerActions)
    .map(a => store.dispatch(a.FETCH({page: 0})))

  return {store, persistor}
}

export default butterCreateStore
