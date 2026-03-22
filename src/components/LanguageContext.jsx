'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const dictionary = {
    en: {
        appName: "AgroConnect",
        farmerPortal: "Farmer Portal",
        consumerPortal: "Consumer Portal",
        heroTitle1: "Direct from ",
        heroTitle2: "Farm",
        heroTitle3: " to ",
        heroTitle4: "Table",
        heroSub: "Empowering farmers with fair pricing and providing consumers with the freshest produce directly from the source. Cut the middlemen, zero hunger.",
        iAmFarmer: "I am a Farmer",
        farmerSub: "List produce, view demand forecasts, and sell directly.",
        iAmConsumer: "I am a Consumer",
        consumerSub: "Find fresh produce nearby, compare prices, and buy fair.",
        searchPlaceholder: "Search for Tomatoes, Wheat...",
        searchBtn: "Search",
        freshProduce: "Fresh Produce Near You 📍",
        buyDirectly: "Buy directly from farmers and save. Guaranteed fair prices."
    },
    hi: {
        appName: "एग्रोकनेक्ट",
        farmerPortal: "किसान पोर्टल",
        consumerPortal: "उपभोक्ता पोर्टल",
        heroTitle1: "सीधे ",
        heroTitle2: "खेत",
        heroTitle3: " से ",
        heroTitle4: "टेबल",
        heroTitle5: " तक",
        heroSub: "किसानों को उचित मूल्य के साथ सशक्त बनाना और उपभोक्ताओं को सीधे स्रोत से सबसे ताज़ा उपज प्रदान करना। बिचौलियों को हटाएं, शून्य भूख।",
        iAmFarmer: "मैं किसान हूँ",
        farmerSub: "उपज सूचीबद्ध करें, मांग का पूर्वानुमान देखें, और सीधे बेचें।",
        iAmConsumer: "मैं उपभोक्ता हूँ",
        consumerSub: "आस-पास ताजी उपज खोजें, कीमतों की तुलना करें और उचित मूल्य पर खरीदें।",
        searchPlaceholder: "टमाटर, गेहूं खोजें...",
        searchBtn: "खोजें",
        freshProduce: "आपके नज़दीक ताज़ा उपज 📍",
        buyDirectly: "सीधे किसानों से खरीदें और बचत करें। गारंटीकृत उचित मूल्य।"
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    // Try to load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('agro_lang');
        if (saved) setLang(saved);
    }, []);

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'hi' : 'en';
        setLang(newLang);
        localStorage.setItem('agro_lang', newLang);
    };

    const t = (key) => dictionary[lang][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
