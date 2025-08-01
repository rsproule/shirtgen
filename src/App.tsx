import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EchoProvider } from '@zdql/echo-react-sdk'
import { InputForm } from '@/pages/InputForm'
import { ViewPage } from '@/pages/ViewPage'

const echoConfig = {
  appId: '157aa247-4d72-473c-8e27-6927c602892c',
  apiUrl: 'https://echo.merit.systems',
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <Router>
        <Routes>
          <Route path="/" element={<InputForm />} />
          <Route path="/view" element={<ViewPage />} />
        </Routes>
      </Router>
    </EchoProvider>
  )
}

export default App
