import React from 'react'
import LanguageSelector from './LanguageSelector'

function Header({ currentPage, setCurrentPage, language, setLanguage, t, theme, toggleTheme }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>
          {t('appName')}
        </div>
        
        <nav className="nav">
          {['home', 'explore', 'community', 'profile'].map(page => (
            <button
              key={page}
              className={`nav-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {t(`nav.${page}`)}
            </button>
          ))}
        </nav>
        
        <div className="header-controls">
          <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? t('common.light') : t('common.dark')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  )
}

export default Header
