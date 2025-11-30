import { useLanguage } from '../context/LanguageContext'
import en from '../locales/en.json'
import hi from '../locales/hi.json'

const translations = { en, hi }

export function useTranslation(){
  const { language } = useLanguage()
  
  function t(key){
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return value || key
  }
  
  return { t, language }
}
