// sutta.js - Sutta page JavaScript
// This file can be manually modified - script won't overwrite it

let currentView = {};

function loadAllSettings() {
    const savedViews = localStorage.getItem('paliReaderSettings');
    currentView = savedViews ? JSON.parse(savedViews) : {
        mula_pali: true,
        mula_english: true,
        commentary_pali: false,
        commentary_english: false,
        devanagari: true
    };
    updateDisplay();
}

function saveSettings() {
    localStorage.setItem('paliReaderSettings', JSON.stringify(currentView));
}

function toggleView(type) {
    currentView[type] = !currentView[type];
    
    const buttons = document.querySelectorAll('.btn.toggle');
    buttons.forEach(btn => {
        let btnText = btn.textContent.toLowerCase();
        if ((type === 'mula_english' && btnText.includes('translation')) ||
            btnText.includes(type.replace('_', ' '))) {
            btn.classList.toggle('active', currentView[type]);
        }
    });
    saveSettings();
    updateDisplay();
}

function toggleScript() {
    currentView.devanagari = !currentView.devanagari;
    const btn = event.target;
    btn.classList.toggle('active', currentView.devanagari);
    document.body.classList.toggle('devanagari-script', currentView.devanagari);
    updateDisplay();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function convertToDevanagari(text) {
    if (!text) return text;
    
    text = text.toLowerCase();
    
    const consonants = {
        'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ṅ': 'ङ',
        'c': 'च', 'ch': 'छ', 'j': 'ज', 'jh': 'झ', 'ñ': 'ञ',
        'ṭ': 'ट', 'ṭh': 'ठ', 'ḍ': 'ड', 'ḍh': 'ढ', 'ṇ': 'ण',
        't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
        'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
        'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 
        'ś': 'श', 'ṣ': 'ष', 's': 'स', 'h': 'ह'
    };
    
    const vowelSigns = {
        'a': '', 'ā': 'ा', 'i': 'ि', 'ī': 'ी', 'u': 'ु', 'ū': 'ू',
        'e': 'े', 'o': 'ो'
    };
    
    const independentVowels = {
        'a': 'अ', 'ā': 'आ', 'i': 'इ', 'ī': 'ई', 'u': 'उ', 'ū': 'ऊ',
        'e': 'ए', 'o': 'ओ'
    };
    
    let result = '';
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        
        if (char === 'ṃ' || char === 'ṁ') {
            result += 'ं';
            i++;
            continue;
        }
        if (char === 'ḥ') {
            result += 'ः';
            i++;
            continue;
        }
        if (' ,.?!–-""\'\'‘’"".'.includes(char)) {
            result += char;
            i++;
            continue;
        }
        
        let consonantFound = null;
        let consonantLength = 0;
        
        if (i + 1 < text.length) {
            const twoChar = char + text[i + 1];
            if (consonants[twoChar]) {
                consonantFound = consonants[twoChar];
                consonantLength = 2;
            }
        }
        
        if (!consonantFound && consonants[char]) {
            consonantFound = consonants[char];
            consonantLength = 1;
        }
        
        if (consonantFound) {
            const nextIndex = i + consonantLength;
            
            if (nextIndex < text.length) {
                const nextChar = text[nextIndex];
                
                if (vowelSigns[nextChar] !== undefined) {
                    result += consonantFound + vowelSigns[nextChar];
                    i += consonantLength + 1;
                } else if (consonants[nextChar] || ' ,.?!–-'.includes(nextChar)) {
                    result += consonantFound + '्';
                    i += consonantLength;
                } else {
                    result += consonantFound;
                    i += consonantLength;
                }
            } else {
                result += consonantFound;
                i += consonantLength;
            }
            continue;
        }
        
        if (independentVowels[char]) {
            result += independentVowels[char];
            i++;
            continue;
        }
        
        result += char;
        i++;
    }
    
    return result;
}

function convertToDevanagariPreservingHTML(text) {
    const parts = text.split(/(<[^>]*>)/);
    let result = '';
    for (let part of parts) {
        if (part.startsWith('<') && part.endsWith('>')) {
            result += part;
        } else {
            result += convertToDevanagari(part);
        }
    }
    return result;
}

function updateDisplay() {
    document.querySelectorAll('.mula-pali-section').forEach(section => {
        section.style.display = currentView.mula_pali ? 'block' : 'none';
    });
    document.querySelectorAll('.mula-english-section').forEach(section => {
        section.style.display = currentView.mula_english ? 'block' : 'none';
    });
    document.querySelectorAll('.commentary-pali-section').forEach(section => {
        section.style.display = currentView.commentary_pali ? 'block' : 'none';
    });
    document.querySelectorAll('.commentary-english-section').forEach(section => {
        section.style.display = currentView.commentary_english ? 'block' : 'none';
    });

    document.querySelectorAll('.paragraph').forEach(paragraph => {
        const isCommentaryVisible = currentView.commentary_pali || currentView.commentary_english;
        paragraph.classList.toggle('with-commentary', isCommentaryVisible);
    });

    const paliBtn = document.querySelector('.btn.toggle[onclick*="mula_pali"]');
    const transBtn = document.querySelector('.btn.toggle[onclick*="mula_english"]');
    const commPaliBtn = document.querySelector('.btn.toggle[onclick*="commentary_pali"]');
    const commEngBtn = document.querySelector('.btn.toggle[onclick*="commentary_english"]');
    
    if (paliBtn) paliBtn.classList.toggle('active', currentView.mula_pali);
    if (transBtn) transBtn.classList.toggle('active', currentView.mula_english);
    if (commPaliBtn) commPaliBtn.classList.toggle('active', currentView.commentary_pali);
    if (commEngBtn) commEngBtn.classList.toggle('active', currentView.commentary_english);

    document.querySelectorAll('.pali-text').forEach(element => {
        const originalText = element.getAttribute('data-pali');
        if (currentView.devanagari) {
            element.innerHTML = convertToDevanagariPreservingHTML(originalText);
        } else {
            element.innerHTML = originalText;
        }
    });
    document.querySelectorAll('.commentary-pali').forEach(element => {
        const originalText = element.getAttribute('data-pali');
        if (currentView.devanagari) {
            element.innerHTML = convertToDevanagariPreservingHTML(originalText);
        } else {
            element.innerHTML = originalText;
        }
    });
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        if (event.key === 'ArrowRight') {
            const paragraphs = document.querySelectorAll('.paragraph');
            const current = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
            let currentIndex = Array.from(paragraphs).findIndex(p => p.contains(current));
            if (currentIndex < paragraphs.length - 1) {
                paragraphs[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            const paragraphs = document.querySelectorAll('.paragraph');
            const current = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
            let currentIndex = Array.from(paragraphs).findIndex(p => p.contains(current));
            if (currentIndex > 0) {
                paragraphs[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
            event.preventDefault();
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadAllSettings();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    document.body.classList.toggle('devanagari-script', currentView.devanagari);
    updateDisplay();
});
