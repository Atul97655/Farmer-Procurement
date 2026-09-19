import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';
import { translations, translateText } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'] & ((text: string) => string);
  translate: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// WeakMaps to store the original English text and attributes of DOM nodes
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, { placeholder?: string; title?: string }>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('krishisetu_lang');
    return (saved === 'hi' || saved === 'or' || saved === 'en') ? saved : 'en';
  });

  const languageRef = useRef<Language>(language);
  languageRef.current = language;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('krishisetu_lang', lang);
  };

  // DOM Reactive Universal Auto-Translator
  useEffect(() => {
    document.documentElement.lang = language;

    let isTranslating = false;

    const translateNode = (node: Node) => {
      if (!node) return;

      // Text Node
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        if (!val || !val.trim()) return;

        let orig = originalTextMap.get(node);
        if (orig === undefined) {
          orig = val;
          originalTextMap.set(node, orig);
        }

        const target = language === 'en' ? orig : translateText(orig, language);
        if (node.nodeValue !== target) {
          isTranslating = true;
          node.nodeValue = target;
          isTranslating = false;
        }
        return;
      }

      // Element Node
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName ? el.tagName.toLowerCase() : '';
        // Skip code blocks, scripts, styles
        if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'pre') {
          return;
        }

        // Input / Textarea placeholders
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          if (el.placeholder) {
            let saved = originalAttrMap.get(el);
            if (!saved || saved.placeholder === undefined) {
              saved = { ...saved, placeholder: el.placeholder };
              originalAttrMap.set(el, saved);
            }
            const origPl = saved.placeholder || '';
            const targetPlaceholder = language === 'en' 
              ? origPl 
              : translateText(origPl, language);
            if (el.placeholder !== targetPlaceholder) {
              el.placeholder = targetPlaceholder;
            }
          }
        }

        // Title attributes
        if (el.title) {
          let saved = originalAttrMap.get(el);
          if (!saved || saved.title === undefined) {
            saved = { ...saved, title: el.title };
            originalAttrMap.set(el, saved);
          }
          const origTitle = saved.title || '';
          const targetTitle = language === 'en' ? origTitle : translateText(origTitle, language);
          if (el.title !== targetTitle) {
            el.title = targetTitle;
          }
        }

        // Walk child nodes
        const children = el.childNodes;
        for (let i = 0; i < children.length; i++) {
          translateNode(children[i]);
        }
      }
    };

    // Scan the root container and modals
    const root = document.getElementById('root') || document.body;
    translateNode(root);

    // Also scan any portals/dialogs rendered outside #root
    if (root !== document.body) {
      const bodyChildren = document.body.childNodes;
      for (let i = 0; i < bodyChildren.length; i++) {
        if (bodyChildren[i] !== root) {
          translateNode(bodyChildren[i]);
        }
      }
    }

    // MutationObserver to automatically translate newly added or modified nodes
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            translateNode(mutation.addedNodes[i]);
          }
        } else if (mutation.type === 'characterData') {
          const targetNode = mutation.target;
          if (targetNode.nodeType === Node.TEXT_NODE) {
            const currentVal = targetNode.nodeValue || '';
            if (!currentVal.trim()) continue;

            const orig = originalTextMap.get(targetNode);
            const expected = languageRef.current === 'en' 
              ? orig 
              : (orig ? translateText(orig, languageRef.current) : null);

            if (currentVal !== expected) {
              // Node was updated dynamically by React with new content
              originalTextMap.set(targetNode, currentVal);
              if (languageRef.current !== 'en') {
                isTranslating = true;
                targetNode.nodeValue = translateText(currentVal, languageRef.current);
                isTranslating = false;
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  // Translate helper function
  const translate = (text: string): string => {
    return translateText(text, language);
  };

  // Callable and indexable t proxy
  const t = useMemo(() => {
    const baseTranslations = translations[language] || translations.en;
    
    // Create a callable function that also has properties from baseTranslations
    const fn = function (keyOrText: string) {
      if (!keyOrText) return '';
      if ((baseTranslations as any)[keyOrText]) {
        return (baseTranslations as any)[keyOrText];
      }
      return translateText(keyOrText, language);
    };

    return new Proxy(fn, {
      get(target, prop: string) {
        if (prop in baseTranslations) {
          return (baseTranslations as any)[prop];
        }
        if (prop in target) {
          return (target as any)[prop];
        }
        if (typeof prop === 'string') {
          return translateText(prop, language);
        }
        return undefined;
      }
    }) as typeof translations['en'] & ((text: string) => string);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
