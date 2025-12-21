import { useLanguage } from '../context/LanguageContext'
import en from '../locales/en.json'
import hi from '../locales/hi.json'

const translations = { en, hi }

export function useTranslation(){
  const { language } = useLanguage()

  function lookup(lang, keys){
    let value = translations[lang]
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return undefined
      }
    }
    return value
  }
  
  function t(key){
    const keys = key.split('.')

    // Preferred language
    let value = lookup(language, keys)
    if (value !== undefined && value !== null) return value


    // Fall back to English
    const enVal = lookup('en', keys)
    if (enVal !== undefined && enVal !== null) return enVal

    // Finally return the key itself if nothing is found
    return key
  }
  
  return { t, language }
}
