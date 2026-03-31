import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Calendar from './components/Calendar.jsx'
import Footer from './layouts/Footer.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Footer />

  </StrictMode>,
)
