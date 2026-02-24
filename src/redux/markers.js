import {createSlice} from '@reduxjs/toolkit'

const markersSlice = createSlice({
  name: 'markers',
  initialState: {favourites: {}, seen: {}},
  reducers: {
    addFavourite: (state, action) => {
      state.favourites[action.payload] = true
    },
    removeFavourite: (state, action) => {
      delete state.favourites[action.payload]
    },
    toggleFavourite: (state, action) => {
      const id = action.payload
      if (state.favourites[id]) {
        delete state.favourites[id]
      } else {
        state.favourites[id] = true
      }
    },
    addSeen: (state, action) => {
      state.seen[action.payload] = true
    },
    removeSeen: (state, action) => {
      delete state.seen[action.payload]
    },
    toggleSeen: (state, action) => {
      const id = action.payload
      if (state.seen[id]) {
        delete state.seen[id]
      } else {
        state.seen[id] = true
      }
    }
  }
})

const {addFavourite, removeFavourite, toggleFavourite, addSeen, removeSeen, toggleSeen} = markersSlice.actions

const reducer = markersSlice.reducer

const actions = {
  favourites: {add: addFavourite, remove: removeFavourite, toggle: toggleFavourite},
  seen: {add: addSeen, remove: removeSeen, toggle: toggleSeen}
}

const bindMarkersActions = (dispatch) => ({
  favourites: {
    add: (id) => dispatch(actions.favourites.add(id)),
    remove: (id) => dispatch(actions.favourites.remove(id)),
    toggle: (id) => dispatch(actions.favourites.toggle(id))
  },
  seen: {
    add: (id) => dispatch(actions.seen.add(id)),
    remove: (id) => dispatch(actions.seen.remove(id)),
    toggle: (id) => dispatch(actions.seen.toggle(id))
  }
})

const markers = {
  reducer,
  actions
}

export {markers as default, bindMarkersActions}
