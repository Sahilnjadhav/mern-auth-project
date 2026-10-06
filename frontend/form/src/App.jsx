import React from 'react'
import Navigation from './navigation/Rootnavigation'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  )
}

export default App