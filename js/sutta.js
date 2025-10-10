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



function safeSegmentSentences(text, language) {
    try {
        if (!text || typeof text !== 'string') return [];
        
        // Different rules for different languages
        if (language === 'pali') {
            // Conservative Pali segmentation
            return text.split(/(?<=[.!?]”?\s+)/)
                      .map(s => s.trim())
                      .filter(s => s.length > 5); // Minimum length
        } else {
            // English segmentation
            return text.split(/(?<=[.!?])\s+/)
                      .map(s => s.trim())
                      .filter(s => s.length > 10);
        }
    } catch (error) {
        console.warn('Sentence segmentation failed:', error);
        return [text]; // Fallback: treat entire text as one sentence
    }
}

function createSafeSentenceMapping(paragraphData) {
    const paliSentences = safeSegmentSentences(
        paragraphData.mula_pali.replace(/<[^>]*>/g, ''),
        'pali'
    );
    
    const englishSentences = safeSegmentSentences(
        paragraphData.mula_english,
        'english'
    );
    
    // If counts differ significantly, fall back to paragraph-level
    if (Math.abs(paliSentences.length - englishSentences.length) > 2) {
        console.warn(`Sentence count mismatch in paragraph ${paragraphData.paragraph_number}: Pali=${paliSentences.length}, English=${englishSentences.length}`);
        return null; // Indicate mapping failed
    }
    
    // Create mapping with bounds checking
    const maxLength = Math.max(paliSentences.length, englishSentences.length);
    const mapping = [];
    
    for (let i = 0; i < maxLength; i++) {
        mapping.push({
            pali: paliSentences[i] || '',
            english: englishSentences[i] || '',
            id: `${paragraphData.paragraph_number}.${i + 1}`,
            reliable: !!(paliSentences[i] && englishSentences[i])
        });
    }
    
    return mapping;
}


function enhanceParagraphWithInteractiveSentences(paragraphElement, paragraphData) {
    const mapping = createSafeSentenceMapping(paragraphData);
    
    // If mapping failed, add a subtle indicator and bail out
    if (!mapping || mapping.length === 0) {
        paragraphElement.classList.add('sentence-mapping-unavailable');
        return;
    }
    
    const englishSection = paragraphElement.querySelector('.translation-text');
    const paliSection = paragraphElement.querySelector('.pali-text');
    
    if (!englishSection || !paliSection) return;
    
    // Clear existing content
    englishSection.innerHTML = '';
    paliSection.innerHTML = '';
    
    // Build interactive sentences
    mapping.forEach((sentence, index) => {
        if (sentence.english) {
            const engSentence = createInteractiveSentence(sentence, 'english', index);
            englishSection.appendChild(engSentence);
        }
        
        if (sentence.pali) {
            const paliSentence = createInteractiveSentence(sentence, 'pali', index);
            paliSection.appendChild(paliSentence);
        }
    });
    
    paragraphElement.classList.add('sentence-mapping-available');
}

function createInteractiveSentence(sentenceData, language, index) {
    const span = document.createElement('span');
    span.className = `sentence ${language}-sentence`;
    span.dataset.sentenceId = sentenceData.id;
    span.dataset.language = language;
    span.dataset.counterpartId = sentenceData.id;
    
    if (!sentenceData.reliable) {
        span.classList.add('unreliable-mapping');
        span.title = 'Sentence mapping may be inaccurate';
    }
    
    span.textContent = language === 'pali' ? sentenceData.pali : sentenceData.english;
    
    return span;
}

// Main enhancement function
function enhanceSuttaWithSentenceMapping() {
    const paragraphs = document.querySelectorAll('.paragraph');
    let successCount = 0;
    let totalCount = 0;
    
    paragraphs.forEach(paragraph => {
        totalCount++;
        const paragraphNumber = paragraph.querySelector('.paragraph-number')?.textContent;
        const paragraphData = getParagraphData(paragraphNumber); // You'd need to implement this
        
        if (paragraphData) {
            const success = enhanceParagraphWithInteractiveSentences(paragraph, paragraphData);
            if (success) successCount++;
        }
    });
    
    console.log(`Sentence mapping: ${successCount}/${totalCount} paragraphs enhanced`);
    
    // Add global hover handlers only if we have successful mappings
    if (successCount > 0) {
        initSentenceHoverHandlers();
    }
}

// Only initialize if we have a reasonable success rate
if (successCount > totalCount * 0.3) { // At least 30% success rate
    initSentenceHoverHandlers();
}
