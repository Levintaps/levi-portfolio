// Bad words filter
const badWords = [
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap', 'piss', 'dick', 'cock',
    'pussy', 'asshole', 'fag', 'slut', 'whore', 'nigger', 'nigga', 'retard', 'cunt',
    'bullshit', 'motherfucker', 'fucker', 'fucking', 'shitty', 'dumbass', 'jackass',
    // Add Tagalog/Filipino bad words
    'gago', 'putang ina', 'tangina', 'puta', 'tarantado', 'tanga', 'bobo', 'ulol',
    'animal', 'kingina', 'hinayupak', 'bwisit', 'leche', 'peste', 'yawa', 'pakshet',
    'pakyu', 'amputa', 'shet', 'punyeta', 'inutil', 'hayop', 'hudas', 'pokpok'
];

function containsBadWords(text) {
    const lowerText = text.toLowerCase();
    
    // Check for exact matches and variations (with spaces, numbers replacing letters, etc.)
    for (let badWord of badWords) {
        // Create regex pattern that allows for common obfuscations
        const pattern = badWord.split('').map(char => {
            if (char === 'a') return '[a@4]';
            if (char === 'e') return '[e3]';
            if (char === 'i') return '[i1!]';
            if (char === 'o') return '[o0]';
            if (char === 's') return '[s$5]';
            return char;
        }).join('\\s*'); // Allow spaces between characters
        
        const regex = new RegExp('\\b' + pattern + '\\b|' + pattern, 'gi');
        
        if (regex.test(lowerText)) {
            return true;
        }
    }
    
    return false;
}

function showBadWordModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 18, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(157, 0, 255, 0.1);
        border: 2px solid #9d00ff;
        border-radius: 15px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 0 30px rgba(157, 0, 255, 0.5);
        animation: modalPop 0.3s ease-out;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #9d00ff; font-size: 1.8rem; margin-bottom: 15px; text-shadow: 0 0 10px #9d00ff;">
            Inappropriate Content Detected
        </h2>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
            Your message contains inappropriate language. Please keep your feedback respectful and professional.
        </p>
        <button id="closeWarningModal" style="
            background: #9d00ff;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 20px rgba(157, 0, 255, 0.5);
        ">
            I Understand
        </button>
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalPop {
            0% {
                transform: scale(0.7);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Close button functionality
    const closeBtn = document.getElementById('closeWarningModal');
    closeBtn.addEventListener('click', () => {
        modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    });
    
    // Hover effect for button
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.05)';
        closeBtn.style.boxShadow = '0 0 30px rgba(157, 0, 255, 0.8)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1)';
        closeBtn.style.boxShadow = '0 0 20px rgba(157, 0, 255, 0.5)';
    });
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    });
}

// Wait for Firebase to be initialized
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.db && window.firestoreModules) {
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
    });
}

// Initialize feedback system after Firebase is ready
waitForFirebase().then(() => {
    const { collection, addDoc, getDocs, query, orderBy } = window.firestoreModules;
    const db = window.db;

    // Feedback Bubbles System
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const bubbleContainer1 = document.getElementById('bubbleContainer1');
    let containerCount = 1;

    // Load existing messages from Firebase
    async function loadMessages() {
        try {
            const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(messagesQuery);
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                addMessageBubble(data.message, false); // false = don't save to Firebase
            });
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Check if user has already submitted feedback
    function hasSubmittedMessage() {
        return localStorage.getItem('hasSubmittedMessage') === 'true';
    }

    function markMessageSubmitted() {
        localStorage.setItem('hasSubmittedMessage', 'true');
    }

    if (messageInput && sendMessageBtn) {
        // Disable if already submitted
        if (hasSubmittedMessage()) {
            messageInput.disabled = true;
            sendMessageBtn.disabled = true;
            messageInput.placeholder = 'You have already submitted a message';
        }

        sendMessageBtn.addEventListener('click', async () => {
            if (hasSubmittedMessage()) {
                alert('You have already submitted a feedback message!');
                return;
            }

            const message = messageInput.value.trim();
            if (message) {
                // Check for bad words
                if (containsBadWords(message)) {
                    showBadWordModal();
                    messageInput.value = ''; // Clear the input
                    return;
                }

                await addMessageBubble(message, true);
                messageInput.value = '';
                markMessageSubmitted();
                messageInput.disabled = true;
                sendMessageBtn.disabled = true;
                messageInput.placeholder = 'Thank you for your feedback!';
            }
        });

        messageInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                if (hasSubmittedMessage()) {
                    alert('You have already submitted a feedback message!');
                    return;
                }

                const message = messageInput.value.trim();
                if (message) {
                    // Check for bad words
                    if (containsBadWords(message)) {
                        showBadWordModal();
                        messageInput.value = ''; // Clear the input
                        return;
                    }

                    await addMessageBubble(message, true);
                    messageInput.value = '';
                    markMessageSubmitted();
                    messageInput.disabled = true;
                    sendMessageBtn.disabled = true;
                    messageInput.placeholder = 'Thank you for your feedback!';
                }
            }
        });
    }

    async function addMessageBubble(message, saveToFirebase = true) {
        // Save to Firebase if needed
        if (saveToFirebase) {
            try {
                await addDoc(collection(db, 'messages'), {
                    message: message,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Error saving message:', error);
                alert('Failed to save message. Please try again.');
                return;
            }
        }

        const currentContainer = document.getElementById(`bubbleContainer${containerCount}`);
        if (!currentContainer) return;
        
        const bubbleCount = currentContainer.querySelectorAll('.bubble').length;
        
        // If container is full, create a new one
        if (bubbleCount >= 20) {
            containerCount++;
            const newContainer = document.createElement('div');
            newContainer.className = 'bubble-container';
            newContainer.id = `bubbleContainer${containerCount}`;
            
            currentContainer.parentNode.insertBefore(newContainer, currentContainer.nextSibling);
        }
        
        const activeContainer = document.getElementById(`bubbleContainer${containerCount}`);
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = message;
        bubble.style.left = `${Math.random() * 60 + 5}%`;
        bubble.style.bottom = '10px';
        bubble.style.background = `rgba(${Math.random() * 100}, ${Math.random() * 100}, 255, 0.3)`;
        bubble.style.borderColor = `rgba(0, 243, 255, 0.5)`;
        activeContainer.appendChild(bubble);
    }

    // Rating System
    const stars = document.querySelectorAll('.star');
    const nameInput = document.getElementById('nameInput');
    const submitRatingBtn = document.getElementById('submitRatingBtn');
    const ratingsList = document.getElementById('ratingsList');
    const averageRating = document.getElementById('averageRating');
    const totalRatings = document.getElementById('totalRatings');
    let selectedRating = 0;

    // Load existing ratings from Firebase
    async function loadRatings() {
        try {
            const ratingsQuery = query(collection(db, 'ratings'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(ratingsQuery);
            
            const ratings = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                ratings.push({
                    name: data.name,
                    rating: data.rating,
                    date: new Date(data.timestamp.seconds * 1000).toLocaleDateString()
                });
            });
            
            displayRatings(ratings);
            updateAverageRating(ratings);
        } catch (error) {
            console.error('Error loading ratings:', error);
        }
    }

    // Check if user has already submitted rating
    function hasSubmittedRating() {
        return localStorage.getItem('hasSubmittedRating') === 'true';
    }

    function markRatingSubmitted() {
        localStorage.setItem('hasSubmittedRating', 'true');
    }

    if (stars.length > 0) {
        // Disable stars if already submitted
        if (hasSubmittedRating()) {
            stars.forEach(star => {
                star.style.cursor = 'not-allowed';
                star.style.opacity = '0.5';
            });
            nameInput.disabled = true;
            nameInput.placeholder = 'You have already submitted a rating';
        }

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                if (hasSubmittedRating()) return;
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(rating);
            });
            
            star.addEventListener('mouseout', () => {
                highlightStars(selectedRating);
            });
            
            star.addEventListener('click', () => {
                if (hasSubmittedRating()) {
                    alert('You have already submitted a rating!');
                    return;
                }
                selectedRating = parseInt(star.getAttribute('data-rating'));
                highlightStars(selectedRating);
            });
        });
    }

    function highlightStars(count) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= count) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    if (submitRatingBtn) {
        // Disable button if already submitted
        if (hasSubmittedRating()) {
            submitRatingBtn.disabled = true;
            submitRatingBtn.textContent = 'Already Submitted';
        }

        submitRatingBtn.addEventListener('click', async () => {
            if (hasSubmittedRating()) {
                alert('You have already submitted a rating!');
                return;
            }

            const name = nameInput.value.trim() || 'Anonymous';
            
            if (selectedRating > 0) {
                try {
                    // Save to Firebase
                    await addDoc(collection(db, 'ratings'), {
                        name: name,
                        rating: selectedRating,
                        timestamp: new Date()
                    });

                    // Reload ratings from Firebase
                    await loadRatings();
                    
                    // Mark as submitted
                    markRatingSubmitted();
                    
                    // Reset form
                    nameInput.value = '';
                    selectedRating = 0;
                    highlightStars(0);

                    // Disable form
                    stars.forEach(star => {
                        star.style.cursor = 'not-allowed';
                        star.style.opacity = '0.5';
                    });
                    nameInput.disabled = true;
                    submitRatingBtn.disabled = true;
                    submitRatingBtn.textContent = 'Already Submitted';

                    alert('Thank you for your rating!');
                } catch (error) {
                    console.error('Error saving rating:', error);
                    alert('Failed to save rating. Please try again.');
                }
            } else {
                alert('Please select a rating before submitting.');
            }
        });
    }

    function displayRatings(ratings) {
        if (!ratingsList) return;
        
        ratingsList.innerHTML = '';
        
        ratings.forEach(rating => {
            const ratingItem = document.createElement('div');
            ratingItem.className = 'rating-item';
            
            const ratingInfo = document.createElement('div');
            ratingInfo.className = 'rating-info';
            
            const ratingName = document.createElement('span');
            ratingName.className = 'rating-name';
            ratingName.textContent = rating.name;
            
            const ratingStars = document.createElement('span');
            ratingStars.className = 'rating-stars';
            ratingStars.textContent = '★'.repeat(rating.rating);
            
            const ratingDate = document.createElement('div');
            ratingDate.textContent = rating.date;
            ratingDate.style.fontSize = '0.8rem';
            ratingDate.style.opacity = '0.7';
            
            ratingInfo.appendChild(ratingName);
            ratingInfo.appendChild(ratingStars);
            
            ratingItem.appendChild(ratingInfo);
            ratingItem.appendChild(ratingDate);
            
            ratingsList.appendChild(ratingItem);
        });
    }

    function updateAverageRating(ratings) {
        if (!averageRating || !totalRatings) return;
        
        if (ratings.length > 0) {
            const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
            const avg = sum / ratings.length;
            averageRating.textContent = avg.toFixed(1);
            totalRatings.textContent = `(${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'})`;
        } else {
            averageRating.textContent = '0.0';
            totalRatings.textContent = '(0 ratings)';
        }
    }

    // Load initial data
    loadMessages();
    loadRatings();

    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu .nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            if (mobileMenu.classList.contains('active')) {
                mobileMenuBtn.querySelector('span:first-child').style.transform = 'rotate(45deg) translate(5px, 5px)';
                mobileMenuBtn.querySelector('span:nth-child(2)').style.opacity = '0';
                mobileMenuBtn.querySelector('span:last-child').style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                mobileMenuBtn.querySelector('span:first-child').style.transform = 'none';
                mobileMenuBtn.querySelector('span:nth-child(2)').style.opacity = '1';
                mobileMenuBtn.querySelector('span:last-child').style.transform = 'none';
            }
        });
    }

    if (mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.querySelector('span:first-child').style.transform = 'none';
                mobileMenuBtn.querySelector('span:nth-child(2)').style.opacity = '1';
                mobileMenuBtn.querySelector('span:last-child').style.transform = 'none';
            });
        });
    }
});