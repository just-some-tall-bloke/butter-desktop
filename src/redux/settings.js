import {createSlice} from '@reduxjs/toolkit'

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {},
    reducers: {
        set: (state, action) => {
            const {key, value} = action.payload
            state[key] = value
        },
        setAll: (state, action) => {
            return {...state, ...action.payload}
        }
    }
})

const {set, setAll} = settingsSlice.actions
const reducer = settingsSlice.reducer

const bindSettingsActions = (dispatch) => ({
    set: (key, value) => dispatch(set({key, value})),
    setAll: (values) =>  dispatch(setAll(values)),
})

const settings = {
    reducerCreator: (cachedSettings) => {
        return (state = cachedSettings) => reducer(state)
    },
    actions: {set, setAll}
}

export {settings as default, bindSettingsActions}
