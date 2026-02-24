import {createSlice} from '@reduxjs/toolkit'
import debounce from 'lodash/debounce'

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {search: null, genre: null, sorter: 'trending', order: 'desc'},
  reducers: {
    search: (state, action) => {
      state.search = action.payload
    },
    genre: (state, action) => {
      state.genre = action.payload
    },
    sorter: (state, action) => {
      state.sorter = action.payload
    },
    order: (state, action) => {
      state.order = action.payload
    }
  }
})

const {search, genre, sorter, order} = filtersSlice.actions
const reducer = filtersSlice.reducer

const bindFiltersActions = (dispatch) => ({
  search: debounce((term) => dispatch(search(term)), 250),
  genre: (g) => dispatch(genre(g)),
  sorter: (s) => dispatch(sorter(s)),
  order: (o) => dispatch(order(o))
})

const filters = {
  reducer,
  actions: {search, genre, sorter, order}
}

export {filters as default, bindFiltersActions}
