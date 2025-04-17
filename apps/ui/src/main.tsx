import { createRoot } from 'react-dom/client'
import { App } from './app'
import './global.css'

const app = createRoot(document.getElementById('root') as HTMLElement)
app.render(<App />)
