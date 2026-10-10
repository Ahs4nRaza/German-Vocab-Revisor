/**
 * @typedef {Object} VocabWord
 * @property {string} german
 * @property {string} english
 * @property {string} part_of_speech
 * @property {string} category
 * @property {string} subcategory
 * @property {string[]} tags
 */

import vocabData from '../../german_a1_vocab_tagged.json'

/** @type {VocabWord[]} */
const vocab = vocabData

/**
 * @returns {{ category: string, subcategory: string, count: number }[]}
 */
export function getSubcategories() {
  const map = new Map()

  for (const word of vocab) {
    const key = `${word.category}|||${word.subcategory}`
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
    } else {
      map.set(key, {
        category: word.category,
        subcategory: word.subcategory,
        count: 1,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const cat = a.category.localeCompare(b.category)
    return cat !== 0 ? cat : a.subcategory.localeCompare(b.subcategory)
  })
}

/**
 * @param {string} subcategory
 * @returns {VocabWord[]}
 */
export function getWordsBySubcategory(subcategory) {
  return vocab.filter((word) => word.subcategory === subcategory)
}

/**
 * Grouped options for Ant Design Select (label = subcategory, grouped by category).
 * @returns {{ label: string, options: { label: string, value: string }[] }[]}
 */
export function getSubcategorySelectOptions() {
  const groups = new Map()

  for (const item of getSubcategories()) {
    if (!groups.has(item.category)) {
      groups.set(item.category, [])
    }
    groups.get(item.category).push({
      label: `${item.subcategory} (${item.count})`,
      value: item.subcategory,
    })
  }

  return Array.from(groups.entries()).map(([category, options]) => ({
    label: category,
    options,
  }))
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Normalize for answer check: trim, lowercase, and fold German specials
 * so ae/oe/ue/ss also match ä/ö/ü/ß.
 * @param {string} value
 * @returns {string}
 */
export function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}
