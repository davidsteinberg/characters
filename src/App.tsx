import { useState, useEffect } from 'react'
import './styles/index.css'
import { philosophies } from './data/philosophies'
import { physicalCharacteristics } from './data/physicalCharacteristics'
import { vocalCharacteristics } from './data/vocalCharacteristics'
import { emotions } from './data/emotions'
import { locations } from './data/locations'
import { activities } from './data/activities'
import { accents } from './data/accents'
import { archetypes } from './data/archetypes'
import { relationships } from './data/relationships'

function App() {
    // Bad examples state
    const [badExamples, setBadExamples] = useState<Array<{ category: string; value: string }>>(() => {
      const saved = localStorage.getItem('badExamples')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse badExamples:', e)
        }
      }
      return []
    })

    // Save badExamples to localStorage
    useEffect(() => {
      localStorage.setItem('badExamples', JSON.stringify(badExamples))
    }, [badExamples])

    // Flag or unflag current character as bad
    const flagBadExample = () => {
      if (!character) return
      const alreadyFlagged = badExamples.some(
        ex => ex.category === character.category && ex.value === character.value
      )
      if (alreadyFlagged) {
        // Unflag if already flagged
        setBadExamples(prev =>
          prev.filter(
            ex => !(ex.category === character.category && ex.value === character.value)
          )
        )
      } else {
        // Flag if not already flagged
        setBadExamples(prev => [...prev, character])
      }
    }

    // Download bad examples as text file
    const downloadBadExamples = () => {
      const text = badExamples.map(ex => `${ex.category}: ${ex.value}`).join('\n')
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bad-examples.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // Unflag an example
    const unflagExample = (index: number) => {
      setBadExamples(prev => prev.filter((_, i) => i !== index))
    }

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
    locations: boolean
    activities: boolean
    accents: boolean
    archetypes: boolean
    relationships: boolean
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
      locations: true,
      activities: true,
      accents: true,
      archetypes: true,
      relationships: true,
    }
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [historyEnabled, setHistoryEnabled] = useState(() => {
    const saved = localStorage.getItem('historyEnabled')
    return saved ? JSON.parse(saved) : true
  })

  const [usedIndices, setUsedIndices] = useState<{
    philosophies: Set<number>
    physical: Set<number>
    vocal: Set<number>
    emotions: Set<number>
    locations: Set<number>
    activities: Set<number>
    accents: Set<number>
    archetypes: Set<number>
    relationships: Set<number>
  }>({
    philosophies: new Set(),
    physical: new Set(),
    vocal: new Set(),
    emotions: new Set(),
    locations: new Set(),
    activities: new Set(),
    accents: new Set(),
    archetypes: new Set(),
    relationships: new Set(),
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

  const getCategoryLabel = (category: string, withColon = false) => {
    const labels: Record<string, string> = {
      locations: 'Location',
      activities: 'Activity',
      philosophy: 'POV',
      emotions: 'Emotion',
      physical: 'Body',
      vocal: 'Voice',
      accents: 'Accent',
      archetypes: 'Archetype',
      relationships: 'Relationship',
    }

    const label = labels[category] || category
    return withColon ? `${label}:` : label
  }

  const downloadSavedCharacters = () => {
    const text = savedCharacters
      .map(char => `${getCategoryLabel(char.category, true)} ${char.value}`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'saved-characters.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const [viewMode, setViewMode] = useState<'browse' | 'saved' | 'badExamples'>('browse')

  // Load from localStorage on mount
  useEffect(() => {
    if (historyEnabled) {
      const saved = localStorage.getItem('characterIndices')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
              setUsedIndices({
                philosophies: new Set(parsed.philosophies),
                physical: new Set(parsed.physical),
                vocal: new Set(parsed.vocal),
                emotions: new Set(parsed.emotions || []),
                locations: new Set(parsed.locations || []),
                activities: new Set(parsed.activities || []),
                accents: new Set(parsed.accents || []),
                archetypes: new Set(parsed.archetypes || []),
                relationships: new Set(parsed.relationships || []),
              })
        } catch (e) {
          console.error('Failed to parse localStorage:', e)
        }
      }
    }
  }, [historyEnabled])

  // Save to localStorage whenever usedIndices changes
  useEffect(() => {
    if (historyEnabled) {
      localStorage.setItem(
        'characterIndices',
        JSON.stringify({
          philosophies: Array.from(usedIndices.philosophies),
          physical: Array.from(usedIndices.physical),
          vocal: Array.from(usedIndices.vocal),
        })
      )
    }
  }, [usedIndices, historyEnabled])

  // Save selectedCategories to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories))
  }, [selectedCategories])

  // Save darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Save historyEnabled to localStorage
  useEffect(() => {
    localStorage.setItem('historyEnabled', JSON.stringify(historyEnabled))
  }, [historyEnabled])

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
      locations: new Set(),
      activities: new Set(),
      accents: new Set(),
      archetypes: new Set(),
      relationships: new Set(),
    })
    setMenuOpen(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleHistoryEnabled = () => {
    setHistoryEnabled(!historyEnabled)
    setMenuOpen(false)
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

  const toggleCategory = (category: 'philosophy' | 'physical' | 'vocal' | 'emotions' | 'locations' | 'activities' | 'accents' | 'archetypes' | 'relationships') => {
    // Check if this is the only selected category
    const selectedCount = Object.values(selectedCategories).filter(Boolean).length
    if (selectedCategories[category] && selectedCount === 1) {
      // Don't allow toggling off the last selected category
      return
    }
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const getRandomUnusedIndex = (list: unknown[], usedSet: Set<number>, category: string): number => {
    if (usedSet.size >= list.length) {
      usedSet.clear()
    }
    let index: number
    do {
      index = Math.floor(Math.random() * list.length)
      // Check if this item is flagged
      const isFlagged = badExamples.some(
        ex => ex.category === category && ex.value === (list[index] as string)
      )
      if (isFlagged) continue
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
        const idx = getRandomUnusedIndex(philosophies, newUsedIndices.philosophies, 'philosophy')
        value = philosophies[idx]
        break
      }
      case 'physical': {
        const idx = getRandomUnusedIndex(physicalCharacteristics, newUsedIndices.physical, 'physical')
        value = physicalCharacteristics[idx]
        break
      }
      case 'vocal': {
        const idx = getRandomUnusedIndex(vocalCharacteristics, newUsedIndices.vocal, 'vocal')
        value = vocalCharacteristics[idx]
        break
      }
      case 'emotions': {
        const idx = getRandomUnusedIndex(emotions, newUsedIndices.emotions, 'emotions')
        value = emotions[idx]
        break
      }
      case 'locations': {
        const idx = getRandomUnusedIndex(locations, newUsedIndices.locations, 'locations')
        value = locations[idx]
        break
      }
      case 'activities': {
        const idx = getRandomUnusedIndex(activities, newUsedIndices.activities, 'activities')
        value = activities[idx]
        break
      }
      case 'accents': {
        const idx = getRandomUnusedIndex(accents, newUsedIndices.accents, 'accents')
        value = accents[idx]
        break
      }
      case 'archetypes': {
        const idx = getRandomUnusedIndex(archetypes, newUsedIndices.archetypes, 'archetypes')
        value = archetypes[idx]
        break
      }
      case 'relationships': {
        const idx = getRandomUnusedIndex(relationships, newUsedIndices.relationships, 'relationships')
        value = relationships[idx]
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
    if (historyEnabled) {
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
            <button className="menu-item" onClick={toggleHistoryEnabled}>
              {historyEnabled ? 'Disable' : 'Enable'} History Tracking
            </button>
            <button className="menu-item" onClick={switchToSavedMode}>
              ★ Saved ({savedCharacters.length})
            </button>
            <button className="menu-item" onClick={() => { setViewMode('badExamples'); setMenuOpen(false) }}>
                <span style={{verticalAlign: 'middle', marginRight: '0.5em', display: 'inline-block'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle'}}><path d="M5 5v14"/><path d="M5 5h12l-2 4 2 4H5"/></svg>
                </span>
                Flagged ({badExamples.length})
              </button>
          </div>
        )}
      </div>

      {viewMode === 'browse' ? (
        <>
          <div className="button-group">
            <div className="button-row">
              <button
                className={`group-btn ${selectedCategories.locations ? 'active' : ''}`}
                onClick={() => toggleCategory('locations')}
              >
                Location
              </button>
              <button
                className={`group-btn ${selectedCategories.activities ? 'active' : ''}`}
                onClick={() => toggleCategory('activities')}
              >
                Activity
              </button>
              <button
                className={`group-btn ${selectedCategories.relationships ? 'active' : ''}`}
                onClick={() => toggleCategory('relationships')}
              >
                Relationship
              </button>
            </div>
            <div className="button-row">
              <button
                className={`group-btn ${selectedCategories.archetypes ? 'active' : ''}`}
                onClick={() => toggleCategory('archetypes')}
              >
                Archetype
              </button>
              <button
                className={`group-btn ${selectedCategories.philosophy ? 'active' : ''}`}
                onClick={() => toggleCategory('philosophy')}
              >
                POV
              </button>
              <button
                className={`group-btn ${selectedCategories.emotions ? 'active' : ''}`}
                onClick={() => toggleCategory('emotions')}
              >
                Emotion
              </button>
            </div>
            <div className="button-row">
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
                className={`group-btn ${selectedCategories.accents ? 'active' : ''}`}
                onClick={() => toggleCategory('accents')}
              >
                Accent
              </button>
            </div>
          </div>

          {character && (
            <div className="character-display">
              <div className="trait">
                <div className="trait-label">
                  {getCategoryLabel(character.category)}
                </div>
                <div className="trait-value">{character.value}</div>
              </div>
            </div>
          )}

          <div className="navigation compact-nav">
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
              className={`flag-btn ${badExamples.some(ex => ex.category === character?.category && ex.value === character?.value) ? 'flagged' : ''}`}
              onClick={flagBadExample}
              title={badExamples.some(ex => ex.category === character?.category && ex.value === character?.value) ? 'Remove from flagged' : 'Flag as bad example'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle'}}><path d="M5 5v14"/><path d="M5 5h12l-2 4 2 4H5"/></svg>
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
      ) : viewMode === 'saved' ? (
        <div className="saved-view">
          <button className="back-btn" onClick={switchToBrowseMode}>← Back</button>
          <h2>Saved ({savedCharacters.length})</h2>
          {savedCharacters.length === 0 ? (
            <p className="empty-message">No saved characters yet. Star characters to save them!</p>
          ) : (
            <>
              <div className="saved-list">
                {savedCharacters.map((char, index) => (
                  <div key={index} className="saved-item">
                    <div className="saved-character">
                      <div className="saved-trait">
                        <span className="label">
                            {getCategoryLabel(char.category, true)}
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
              <button
                className="download-btn"
                onClick={downloadSavedCharacters}
                disabled={savedCharacters.length === 0}
              >
                Download saved items
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'badExamples' ? (
        <div className="bad-examples-view">
          <button className="back-btn" onClick={switchToBrowseMode}>← Back</button>
          <h2>Flagged ({badExamples.length})</h2>
          {badExamples.length === 0 ? (
            <p className="empty-message">No bad examples flagged yet.</p>
          ) : (
            <div className="bad-list">
                    {badExamples.map((ex, i) => (
                      <div key={i} className="bad-item">
                        <div className="bad-item-content">
                          <span className="label">
                            {getCategoryLabel(ex.category, true)}
                          </span> {ex.value}
                        </div>
                        <button
                          className="unflag-btn"
                          onClick={() => unflagExample(i)}
                          title="Remove from flagged list"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
            )}
            <button className="download-btn" onClick={downloadBadExamples} disabled={badExamples.length === 0}>
              Download Bad Examples
            </button>
        </div>
      ) : null}
    </div>
  )
}

export default App
