import React, { useState, useEffect, Component } from 'react'
import { getTranslation } from './i18n'
import Header from './components/Header'
import Generator from './components/Generator'
import Gallery from './components/Gallery'
import Community from './components/Community'
import Profile from './components/Profile'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return <pre style={{color:'red',padding:'2rem',fontSize:'14px',whiteSpace:'pre-wrap'}}>{this.state.error.message}\n{this.state.error.stack}</pre>
    }
    return this.props.children
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nanogen_lang') || 'fr'
  })
  const [isRTL, setIsRTL] = useState(language === 'ar')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nanogen_theme') || 'dark'
  })

  const t = (key) => getTranslation(language, key)

  useEffect(() => {
    localStorage.setItem('nanogen_lang', language)
    setIsRTL(language === 'ar')
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    localStorage.setItem('nanogen_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
      <ErrorBoundary>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        t={t}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="main-content">
        {currentPage === 'home' && (
          <Generator t={t} language={language} />
        )}
        {currentPage === 'explore' && (
          <Gallery t={t} language={language} />
        )}
        {currentPage === 'community' && (
          <Community t={t} language={language} />
        )}
        {currentPage === 'profile' && (
          <Profile t={t} language={language} />
        )}
      </main>
      </ErrorBoundary>
    </div>
  )
}

export default App
