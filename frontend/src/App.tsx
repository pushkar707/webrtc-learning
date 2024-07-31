import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Sender from './ocmponents/Sender'
import Receiver from './ocmponents/Receiver'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/receiver' element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
