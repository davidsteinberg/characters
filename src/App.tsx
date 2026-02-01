import { useState, useEffect } from 'react'
import './App.css'
import { philosophies } from './data/philosophies'
import { physicalCharacteristics } from './data/physicalCharacteristics'
import { vocalCharacteristics } from './data/vocalCharacteristics'

function App() {
  const [character, setCharacter] = useState<{
    philosophy: string
    physical: string
    vocal: string
  } | null>(null)

  const [characterHistory, setCharacterHistory] = useState<Array<{
    philosophy: string
    physical: string
    vocal: string
  }> | null>(null)

  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(-1)

  const [menuOpen, setMenuOpen] = useState(false)
  const [useLocalStorage, setUseLocalStorage] = useState(true)

  const [usedIndices, setUsedIndices] = useState<{
    philosophies: Set<number>
    physical: Set<number>
    vocal: Set<number>
  }>({
    philosophies: new Set(),
    physical: new Set(),
    vocal: new Set(),
  })

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

  const clearLocalStorage = () => {
    localStorage.removeItem('characterIndices')
    setUsedIndices({
      philosophies: new Set(),
      physical: new Set(),
      vocal: new Set(),
    })
    setMenuOpen(false)
  }

  const toggleLocalStorage = () => {
    setUseLocalStorage(!useLocalStorage)
    setMenuOpen(false)
  }

  const getRandomUnusedIndex = (list: unknown[], usedSet: Set<number>): number => {
    if (usedSet.size >= list.length) {
      // All items have been used, reset
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

    const philosophyIndex = getRandomUnusedIndex(philosophies, newUsedIndices.philosophies)
    const physicalIndex = getRandomUnusedIndex(physicalCharacteristics, newUsedIndices.physical)
    const vocalIndex = getRandomUnusedIndex(vocalCharacteristics, newUsedIndices.vocal)

    setUsedIndices(newUsedIndices)
    setMenuOpen(false)

    const newCharacter = {
      philosophy: philosophies[philosophyIndex],
      physical: physicalCharacteristics[physicalIndex],
      vocal: vocalCharacteristics[vocalIndex],
    }

    setCharacter(newCharacter)

    // Add to history - if we're in the middle of history, remove everything after current index
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
    <div className="app">
      <div className="header">
        <h1>Character Generator</h1>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        {menuOpen && (
          <div className="menu">
            <button className="menu-item" onClick={clearLocalStorage}>
              Clear History
            </button>
            <button className="menu-item" onClick={toggleLocalStorage}>
              {useLocalStorage ? 'Disable' : 'Enable'} History
            </button>
          </div>
        )}
      </div>

      {character && (
        <div className="character-display">
          <div className="trait">
            <div className="trait-label">Philosophical</div>
            <div className="trait-value">{character.philosophy}</div>
          </div>

          <div className="trait">
            <div className="trait-label">Physical</div>
            <div className="trait-value">{character.physical}</div>
          </div>

          <div className="trait">
            <div className="trait-label">Vocal</div>
            <div className="trait-value">{character.vocal}</div>
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
          className="nav-btn nav-next"
          onClick={goToNext}
          disabled={false}
          aria-label="Next character or generate new"
        >
          →
        </button>
      </div>
    </div>
  )
}

export default App
