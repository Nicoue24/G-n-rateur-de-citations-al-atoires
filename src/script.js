/**
 * Random Quote Generator
 * Vanilla JavaScript implementation
 */

// --- State ---
let quotes = [];
let filteredQuotes = [];
let currentQuote = null;

// --- DOM Elements ---
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const quoteCard = document.getElementById('quote-card');
const loader = document.getElementById('loader');
const content = document.getElementById('content');
const newQuoteBtn = document.getElementById('new-quote-btn');
const bgGlow1 = document.getElementById('bg-glow-1');
const bgGlow2 = document.getElementById('bg-glow-2');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');

// Social Buttons
const btnTwitter = document.getElementById('share-twitter');
const btnWhatsapp = document.getElementById('share-whatsapp');
const btnFacebook = document.getElementById('share-facebook');
const btnInstagram = document.getElementById('share-instagram');
const btnCopy = document.getElementById('copy-clipboard');

// --- Colors for ambient background ---
const pastelColors = [
  'rgba(199, 210, 254, 0.4)', // Indigo
  'rgba(191, 219, 254, 0.4)', // Blue
  'rgba(221, 214, 254, 0.4)', // Purple
  'rgba(254, 202, 202, 0.4)', // Red
  'rgba(254, 215, 170, 0.4)', // Orange
  'rgba(187, 247, 208, 0.4)', // Green
  'rgba(253, 242, 208, 0.4)', // Yellow
];

// --- Initialization ---
async function init() {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Show card with animation
  setTimeout(() => {
    quoteCard.classList.add('fade-in');
  }, 300);

  // Load quotes
  await fetchQuotes();
  
  // Event Listeners
  newQuoteBtn.addEventListener('click', displayRandomQuote);
  btnTwitter.addEventListener('click', shareOnX);
  btnWhatsapp.addEventListener('click', shareOnWhatsapp);
  btnFacebook.addEventListener('click', shareOnFacebook);
  btnInstagram.addEventListener('click', shareOnInstagram);
  btnCopy.addEventListener('click', copyToClipboard);
  searchInput.addEventListener('input', handleFilter);
}

function handleFilter(e) {
  const term = e.target.value.toLowerCase();
  
  filteredQuotes = quotes.filter(q => {
    const text = q.text.toLowerCase();
    const author = (q.author || '').toLowerCase();
    return text.includes(term) || author.includes(term);
  });

  // If we filtered out everything, maybe show a hint or leave current quote?
  // For now, if we match nothing, we just won't be able to cycle.
}

// --- Functions ---

function playClickSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn('Web Audio not supported or blocked');
  }
}

function shareOnInstagram() {
  if (!currentQuote) return;
  const text = `"${currentQuote.text}" — ${currentQuote.author || 'Anonyme'}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Citation copiée ! Ouvrez Instagram pour partager.");
    
    // Try to open native Instagram share or app
    setTimeout(() => {
      // attempt deep link
      window.location.href = 'instagram://library?AssetPath=null'; 
      
      // Fallback after 500ms if protocol not supported
      setTimeout(() => {
        if (document.hasFocus()) {
          window.open('https://www.instagram.com', '_blank');
        }
      }, 500);
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    window.open('https://www.instagram.com', '_blank');
  });
}

async function fetchQuotes() {
  try {
    // Falls back to a local list if API is unreachable
    const response = await fetch('https://type.fit/api/quotes');
    if (!response.ok) throw new Error('API failed');
    quotes = await response.json();
  } catch (error) {
    console.error('Error fetching quotes:', error);
    // Minimal fallback list
    quotes = [
      { text: "Le succès, c'est tomber sept fois, se relever huit.", author: "Proverbe japonais" },
      { text: "La vie est ce qui arrive quand on est occupé à faire d'autres plans.", author: "John Lennon" },
      { text: "Soyez le changement que vous voulez voir dans le monde.", author: "Mahatma Gandhi" },
      { text: "Le seul moyen de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" }
    ];
  } finally {
    filteredQuotes = [...quotes];
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    displayRandomQuote();
  }
}

function displayRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteText.textContent = '"Aucune citation ne correspond à votre recherche."';
    quoteAuthor.textContent = '';
    return;
  }

  // Play subtle sound
  playClickSound();

  // Animation: Fade out
  quoteText.classList.add('opacity-0');
  quoteAuthor.classList.add('opacity-0');

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    currentQuote = filteredQuotes[randomIndex];

    // Clean author name (sometimes API returns "type.fit" or null)
    let authorName = currentQuote.author || "Anonyme";
    authorName = authorName.replace(', type.fit', '');
    if (authorName === "type.fit") authorName = "Anonyme";

    quoteText.textContent = `"${currentQuote.text}"`;
    quoteAuthor.textContent = authorName;

    // Animation: Fade in
    quoteText.classList.remove('opacity-0');
    quoteAuthor.classList.remove('opacity-0');

    // Change background atmosphere
    updateBackground();
  }, 300);
}

function updateBackground() {
  const color1 = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  const color2 = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  
  bgGlow1.style.backgroundColor = color1;
  bgGlow2.style.backgroundColor = color2;
}

function copyToClipboard() {
  if (!currentQuote) return;
  const text = `"${currentQuote.text}" — ${currentQuote.author || 'Anonyme'}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Citation copiée !");
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

function showToast(message) {
  const toastSpan = toast.querySelector('span');
  if (toastSpan) toastSpan.textContent = message;

  toast.classList.add('fade-in', 'translate-y-0');
  toast.classList.remove('opacity-0', 'translate-y-[-20px]');
  
  setTimeout(() => {
    toast.classList.remove('fade-in', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-[-20px]');
  }, 3000);
}

// --- Sharing Logic ---

function shareOnX() {
  if (!currentQuote) return;
  const text = encodeURIComponent(`"${currentQuote.text}" — ${currentQuote.author || 'Anonyme'}\n\n`);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank');
}

function shareOnWhatsapp() {
  if (!currentQuote) return;
  const text = encodeURIComponent(`*${currentQuote.text}*\n_— ${currentQuote.author || 'Anonyme'}_`);
  const url = `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank');
}

function shareOnFacebook() {
  // Facebook doesn't allow pre-filling text easily via a URL parameter for personal accounts anymore (only URL for sharing).
  // We'll share the app URL if possible, or just the share dialog.
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  window.open(url, '_blank');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
