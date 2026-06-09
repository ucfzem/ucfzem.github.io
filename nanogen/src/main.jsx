import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

window.addEventListener('error', e => {
  document.body.innerHTML = `<pre style="color:red;padding:2rem;font-size:14px">${e.message}\n${e.filename}:${e.lineno}</pre>`
})

window.addEventListener('unhandledrejection', e => {
  document.body.innerHTML = `<pre style="color:red;padding:2rem;font-size:14px">Unhandled: ${e.reason}</pre>`
})

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (e) {
  document.body.innerHTML = `<pre style="color:red;padding:2rem;font-size:14px">${e.message}\n${e.stack}</pre>`
}
