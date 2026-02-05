import { useState, useEffect } from 'react'
import './App.css'
import { philosophies } from './data/philosophies'
import { physicalCharacteristics } from './data/physicalCharacteristics'
import { vocalCharacteristics } from './data/vocalCharacteristics'
import { emotions } from './data/emotions'

function App() {
  const [character, setCharacter] = useState<{
    category: string
    value: string
  } | null>(null)

  const [characterHistory, setCharacterHistory] = useState<Array<{
    category: string
    value: string
  }> | null>(null)

  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(-1)

  const [selectedCategories, setSelectedCategories] = useState<{
    philosophy: boolean
    physical: boolean
    vocal: boolean
    emotions: boolean
  }>(() => {
    const saved = localStorage.getItem('selectedCategories')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse selectedCategories:', e)
      }
    }
    return {
      philosophy: true,
      physical: true,
      vocal: true,
      emotions: true,
    }
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [useLocalStorage, setUseLocalStorage] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [usedIndices, setUsedIndices] = useState<{
    philosophies: Set<number>
    physical: Set<number>
    vocal: Set<number>
    emotions: Set<number>
  }>({
    philosophies: new Set(),
    physical: new Set(),
    vocal: new Set(),
    emotions: new Set(),
  })

  const [savedCharacters, setSavedCharacters] = useState<Array<{
    category: string
    value: string
  }>>(() => {
    const saved = localStorage.getItem('savedCharacters')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse savedCharacters:', e)
      }
    }
    return []
  })

  const [viewMode, setViewMode] = useState<'browse' | 'saved'>('browse')

  // Load from localStorage on mount
  useEffect(() => {
    if (useLocalStorage) {
      const saved = localStorage.getItem('characterIndices')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
              setUsedIndices({
                philosophies: new Set(parsed.philosophies),
                physical: new Set(parsed.physical),
                vocal: new Set(parsed.vocal),
                emotions: new Set(parsed.emotions || []),
              })
        } catch (e) {
          console.error('Failed to parse localStorage:', e)
        }
      }
    }
  }, [useLocalStorage])

  // Save to localStorage whenever usedIndices changes
  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(
        'characterIndices',
        JSON.stringify({
          philosophies: Array.from(usedIndices.philosophies),
          physical: Array.from(usedIndices.physical),
          vocal: Array.from(usedIndices.vocal),
        })
      )
    }
  }, [usedIndices, useLocalStorage])

  // Save selectedCategories to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories))
  }, [selectedCategories])

  // Save darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Save savedCharacters to localStorage
  useEffect(() => {
    localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters))
  }, [savedCharacters])

  const clearLocalStorage = () => {
    localStorage.removeItem('characterIndices')
    setUsedIndices({
      philosophies: new Set(),
      physical: new Set(),
      vocal: new Set(),
      emotions: new Set(),
    })
    setMenuOpen(false)
  }

  const toggleLocalStorage = () => {
    setUseLocalStorage(!useLocalStorage)
    setMenuOpen(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleSaveCharacter = () => {
    if (!character) return

    const isAlreadySaved = savedCharacters.some(
      saved => saved.category === character?.category && saved.value === character?.value
    )

    if (isAlreadySaved) {
      setSavedCharacters(prev =>
        prev.filter(
          saved => !(saved.category === character?.category && saved.value === character?.value)
        )
      )
    } else {
      setSavedCharacters(prev => [...prev, character!])
    }

    // Removed obsolete logic referencing philosophy, physical, vocal
  }

  const isCharacterSaved = () => {
    if (!character) return false
    return savedCharacters.some(
      saved => saved.category === character.category && saved.value === character.value
    )
  }

  const removeSavedCharacter = (index: number) => {
    setSavedCharacters(prev => prev.filter((_, i) => i !== index))
  }

  const moveSavedCharacter = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === savedCharacters.length - 1) return

    const newArray = [...savedCharacters]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newArray[index]
    newArray[index] = newArray[newIndex]
    newArray[newIndex] = temp
    setSavedCharacters(newArray)
  }

  const switchToSavedMode = () => {
    setViewMode('saved')
    setMenuOpen(false)
  }

  const switchToBrowseMode = () => {
    setViewMode('browse')
  }

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const menuBtn = document.querySelector('.menu-btn')
      const menu = document.querySelector('.menu')

      if (menuOpen && menu && menuBtn && !menu.contains(target) && !menuBtn.contains(target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const toggleCategory = (category: 'philosophy' | 'physical' | 'vocal' | 'emotions') => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const getRandomUnusedIndex = (list: unknown[], usedSet: Set<number>): number => {
    if (usedSet.size >= list.length) {
      usedSet.clear()
    }
    let index: number
    do {
      index = Math.floor(Math.random() * list.length)
    } while (usedSet.has(index))
    usedSet.add(index)
    return index
  }

  const generateCharacter = () => {
    const newUsedIndices = { ...usedIndices }
    const enabledCategories = Object.entries(selectedCategories)
      .filter(([_, enabled]) => enabled)
      .map(([cat]) => cat)
    if (enabledCategories.length === 0) {
      setCharacter(null)
      return
    }
    const randomCategory = enabledCategories[Math.floor(Math.random() * enabledCategories.length)]
    let value = ''
    switch (randomCategory) {
      case 'philosophy': {
        const idx = getRandomUnusedIndex(philosophies, newUsedIndices.philosophies)
        value = philosophies[idx]
        break
      }
      case 'physical': {
        const idx = getRandomUnusedIndex(physicalCharacteristics, newUsedIndices.physical)
        value = physicalCharacteristics[idx]
        break
      }
      case 'vocal': {
        const idx = getRandomUnusedIndex(vocalCharacteristics, newUsedIndices.vocal)
        value = vocalCharacteristics[idx]
        break
      }
      case 'emotions': {
        const idx = getRandomUnusedIndex(emotions, newUsedIndices.emotions)
        value = emotions[idx]
        break
      }
    }
    setUsedIndices(newUsedIndices)
    setMenuOpen(false)
    const newCharacter = {
      category: randomCategory,
      value,
    }
    setCharacter(newCharacter)
    if (characterHistory && currentCharacterIndex < characterHistory.length - 1) {
      const newHistory = characterHistory.slice(0, currentCharacterIndex + 1)
      newHistory.push(newCharacter)
      setCharacterHistory(newHistory)
      setCurrentCharacterIndex(newHistory.length - 1)
    } else if (characterHistory) {
      const newHistory = [...characterHistory, newCharacter]
      setCharacterHistory(newHistory)
      setCurrentCharacterIndex(newHistory.length - 1)
    } else {
      setCharacterHistory([newCharacter])
      setCurrentCharacterIndex(0)
    }
  }

  const goToPrevious = () => {
    if (characterHistory && currentCharacterIndex > 0) {
      const newIndex = currentCharacterIndex - 1
      setCurrentCharacterIndex(newIndex)
      setCharacter(characterHistory[newIndex])
    }
  }

  const goToNext = () => {
    if (characterHistory && currentCharacterIndex < characterHistory.length - 1) {
      const newIndex = currentCharacterIndex + 1
      setCurrentCharacterIndex(newIndex)
      setCharacter(characterHistory[newIndex])
    } else {
      // At the end of history, generate a new character
      generateCharacter()
    }
  }

  useEffect(() => {
    generateCharacter()
  }, [])

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Characters</h1>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        {menuOpen && (
          <div className="menu">
            <button className="menu-item" onClick={toggleDarkMode}>
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
            <button className="menu-item" onClick={clearLocalStorage}>
              Clear History
            </button>
            <button className="menu-item" onClick={toggleLocalStorage}>
              {useLocalStorage ? 'Disable' : 'Enable'} History
            </button>
            <button className="menu-item" onClick={switchToSavedMode}>
              ★ Saved ({savedCharacters.length})
            </button>
          </div>
        )}
      </div>

      {viewMode === 'browse' ? (
        <>
          <div className="button-group">
            <button
              className={`group-btn ${selectedCategories.philosophy ? 'active' : ''}`}
              onClick={() => toggleCategory('philosophy')}
            >
              POV
            </button>
            <button
              className={`group-btn ${selectedCategories.physical ? 'active' : ''}`}
              onClick={() => toggleCategory('physical')}
            >
              Body
            </button>
            <button
              className={`group-btn ${selectedCategories.vocal ? 'active' : ''}`}
              onClick={() => toggleCategory('vocal')}
            >
              Voice
            </button>
            <button
              className={`group-btn ${selectedCategories.emotions ? 'active' : ''}`}
              onClick={() => toggleCategory('emotions')}
            >
              Emotion
            </button>
          </div>

          {character && (
            <div className="character-display">
              <div className="trait">
                <div className="trait-label">
                  {character.category === 'philosophy' && 'POV'}
                  {character.category === 'physical' && 'Body'}
                  {character.category === 'vocal' && 'Voice'}
                  {character.category === 'emotions' && 'Emotion'}
                </div>
                <div className="trait-value">{character.value}</div>
              </div>
            </div>
          )}

          <div className="navigation">
              <button
                className="nav-btn nav-prev"
                onClick={goToPrevious}
                disabled={!characterHistory || currentCharacterIndex <= 0}
                aria-label="Previous character"
              >
                ←
              </button>
              <button
                className={`star-btn ${isCharacterSaved() ? 'saved' : ''}`}
                onClick={toggleSaveCharacter}
                title={isCharacterSaved() ? 'Remove from saved' : 'Save character'}
              >
                {isCharacterSaved() ? '★' : '☆'}
              </button>
              <button
                className="nav-btn nav-next"
                onClick={goToNext}
                disabled={false}
                aria-label="Next character or generate new"
              >
                →
              </button>
            </div>
        </>
      ) : (
        <div className="saved-view">
          <button className="back-btn" onClick={switchToBrowseMode}>← Back</button>
          <h2>Saved Characters ({savedCharacters.length})</h2>
          {savedCharacters.length === 0 ? (
            <p className="empty-message">No saved characters yet. Star characters to save them!</p>
          ) : (
            <div className="saved-list">
              {savedCharacters.map((char, index) => (
                <div key={index} className="saved-item">
                  <div className="saved-character">
                    <div className="saved-trait">
                      <span className="label">
                        {char.category === 'philosophy' && 'POV:'}
                        {char.category === 'physical' && 'Body:'}
                        {char.category === 'vocal' && 'Voice:'}
                        {char.category === 'emotions' && 'Emotion:'}
                      </span> {char.value}
                    </div>
                  </div>
                  <div className="saved-actions">
                    <button
                      className="reorder-btn"
                      onClick={() => moveSavedCharacter(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="reorder-btn"
                      onClick={() => moveSavedCharacter(index, 'down')}
                      disabled={index === savedCharacters.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeSavedCharacter(index)}
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
