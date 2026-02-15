import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithQuery from './AppWithQuery.tsx'

createRoot(document.getElementById('root')!).render(
  <AppWithQuery />,
)
