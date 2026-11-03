# Conversation backup - basair02 opens at door 1 / no scroll restore

Date: 2026-11-03
Repo: ucfzem/ucfzem.github.io

Problem:
- Site opened at door 11 and returned to door 11 after refresh (browser scroll restoration).

Fix:
- history.scrollRestoration = 'manual'
- init() resets currentPage=0 and clears search, scrolls to top
- scroll to top on load and pageshow
- renderPage scrolls instantly instead of smooth

Commit: 09bf242
