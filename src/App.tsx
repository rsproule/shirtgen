import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EchoProvider } from '@zdql/echo-react-sdk'
import { ShirtDataProvider } from '@/context/ShirtDataContext'
import { HomePage } from '@/pages/HomePage'
import { ViewPage } from '@/pages/ViewPage'

const echoConfig = {
  appId: '157aa247-4d72-473c-8e27-6927c602892c',
  apiUrl: 'https://echo.merit.systems',
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ShirtDataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/view" element={<ViewPage />} />
          </Routes>
        </Router>
      </ShirtDataProvider>
    </EchoProvider>
  )
}

export default App
