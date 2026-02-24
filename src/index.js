'use strict;'

import React from 'react'

import {HashRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import {createHashHistory} from 'history'
import {ConnectedRouter} from 'connected-react-router'
import {Window} from 'butter-base-components'

import {windowActions} from './utils'
import {butterCreateStore} from './store'
import Settings from './settings'

import ButterSettingsContainer from './containers/settings'
import ContentDetailContainer from './containers/details'
import { PlayerShowContainer, LoadContainer, PlayContainer } from './containers/player'
import ListViewContainer from './containers/listview'

import Logo from './components/logo'

require('./style.css')

const history = createHashHistory()

const ButterDesktop = (Settings = Settings) => {
    const firstTab = Object.keys(Settings.tabs)[0]
    return {
        Component: () => {
            const [storeData, setStoreData] = React.useState(null)
            const [loading, setLoading] = React.useState(true)

            React.useEffect(() => {
                butterCreateStore(history, Settings).then(({store, persistor}) => {
                    setStoreData({store, persistor})
                    setLoading(false)
                })
            }, [])

            if (loading) {
                return null
            }

            const {store, persistor} = storeData
            return (
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <ConnectedRouter history={history}>
                            <Window title={<Logo />} actions={windowActions}>
                                <Routes>
                                    <Route path='/settings' element={<ButterSettingsContainer />} />
                                    <Route path='/play/:id' element={<PlayContainer />} />
                                    <Route path='/list/:tab/:provider/:id/s/:sid/e/:eid/play' element={<PlayerShowContainer />} />
                                    <Route path='/list/:tab/:provider/:id/s/:sid/play' element={<PlayerShowContainer />} />
                                    <Route path='/list/:tab/:provider/:id/play' element={<PlayerShowContainer />} />
                                    <Route path='/list/:tab/:provider/:id' element={<ContentDetailContainer />} />
                                    <Route path='/list/:tab' element={<ListViewContainer />} />
                                    <Route path='/details/:id' element={<ContentDetailContainer />} />
                                    <Route path='*' element={<Navigate to={`/list/${firstTab}`} replace />} />
                                </Routes>
                            </Window>
                        </ConnectedRouter>
                    </PersistGate>
                </Provider>
            )
        }
    }
}

const Butter = ButterDesktop(Settings)
export { Butter as default, ButterDesktop }
