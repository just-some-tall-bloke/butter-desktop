import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

const { electronAPI } = window

let server

export const serve = createAsyncThunk(
  'streamer/serve',
  async (url) => {
    if (server) {
      server.close()
    }

    const StreamServer = await electronAPI.requireModule('butter-stream-server')

    return new Promise((resolve, reject) => {
      console.error('start streamer', url)
      server = new StreamServer(url, {
        progressInterval: 200,
        buffer: 100,
        port: 9999,
        writeDir: '',
      }).on('ready', ({streamUrl}) => {
        console.error('ready--->resolving', streamUrl)
        resolve(`${streamUrl}/0/?${url}`)
      }).on('error', (err) => {
        reject(err)
      })
    })
  }
)

export const close = createAsyncThunk(
  'streamer/close',
  async () => {
    if (server) {
      server.close()
      server = null
    }
    return true
  }
)

const initialState = {loading: false, loaded: null, url: null, failed: null}

const streamerSlice = createSlice({
  name: 'streamer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.failed = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(serve.pending, (state, action) => {
        state.loading = action.meta.arg
        state.loaded = null
        state.url = null
        state.failed = null
      })
      .addCase(serve.fulfilled, (state, action) => {
        state.url = action.payload
        state.loading = false
        state.loaded = state.loading
      })
      .addCase(serve.rejected, (state, action) => {
        state.url = null
        state.failed = action.error
        state.loading = false
      })
      .addCase(close.fulfilled, (state) => {
        state.loading = false
        state.url = null
        state.loaded = null
        state.failed = null
      })
  }
})

const {clearError} = streamerSlice.actions
const reducer = streamerSlice.reducer

const bindStreamerActions = (dispatch) => ({
  serve: (url) => dispatch(serve(url)),
  close: () => dispatch(close())
})

const streamer = {
  reducer,
  actions: {serve, close}
}

export {streamer as default, bindStreamerActions}
