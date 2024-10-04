const timer = (function () {
  let sound;

  // Function to find times in the text
  function findTimes(text) {
    const timePattern = /(\d+)\s*(seconds|second|secs|s|minutes|minute|mins|min|m|hours|hour|hrs|hr|h|days|day|d)/gi;
    return text.match(timePattern);
  }

  // Convert time string to milliseconds
  function convertToMilliseconds(timeStr) {
    const [_, value, unit] = timeStr.match(/(\d+)\s*(seconds|second|secs|s|minutes|minute|mins|min|m|hours|hour|hrs|hr|h|days|day|d)/i);
    const time = parseInt(value, 10);

    switch (unit.toLowerCase()) {
      case 'second':
      case 'seconds':
      case 'secs':
      case 's':
        return time * 1000;
      case 'minute':
      case 'minutes':
      case 'min':
      case 'mins':
      case 'm':
        return time * 60 * 1000;
      case 'hour':
      case 'hours':
      case 'hrs':
      case 'hr':
      case 'h':
        return time * 60 * 60 * 1000;
      case 'day':
      case 'days':
      case 'd':
        return time * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  // Initialize sound for fallback (desktop focus only)
  function initializeSound() {
    if (!sound) {
      sound = new Audio('https://www.soundjay.com/clock/alarm-clock-01.mp3');
    }
  }

  // Play sound (desktop only)
  function playEndSound() {
    initializeSound();
    sound.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }

  // Stop the sound
  function stopEndSound() {
    if (sound) {
      sound.pause();
      sound.currentTime = 0; // Reset sound to start
    }
  }

  // Request Notification permission
  function requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.log('Notification permission not granted.');
        }
      });
    }
  }

  // Trigger a push notification
  function showNotification(label) {
    if (Notification.permission === 'granted') {
      new Notification(`${label}: Time's up!`, {
        body: 'The timer you set has finished.',
        icon: 'https://www.example.com/timer-icon.png', // Add your custom icon here
        tag: label // Prevent stacking multiple notifications
      });
    }
  }

  // Create countdown timer overlay
  function startCountdown(duration, label) {
    initializeSound(); // Ensure the sound is initialized by user interaction

    const timerContainer = document.getElementById('timer-container');
    const timerOverlay = document.createElement('div');
    timerOverlay.classList.add('timer-overlay');

    const timerText = document.createElement('span');
    timerOverlay.appendChild(timerText);

    const separator = document.createElement('span');
    separator.classList.add('separator');
    timerOverlay.appendChild(separator);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>'; // FontAwesome X icon
    cancelBtn.classList.add('cancel-btn');
    timerOverlay.appendChild(cancelBtn);

    // Remove timer when "X" is clicked
    cancelBtn.addEventListener('click', () => {
      clearInterval(interval);
      timerOverlay.remove();
      stopEndSound(); // Stop sound if playing
    });

    timerContainer.appendChild(timerOverlay);

    // Store the start time and end time
    const startTime = Date.now();
    const endTime = startTime + duration;

    const interval = setInterval(() => {
      const now = Date.now();
      let timeLeft = endTime - now;

      if (timeLeft < 0) timeLeft = 0;

      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      timerText.textContent = `${label}: ${minutes}m ${seconds}s`;

      if (timeLeft <= 0) {
        clearInterval(interval);
        timerText.textContent = `${label}: Time's up!`;
        playEndSound(); // Play sound on desktop if possible
        showNotification(label); // Show notification for mobile and desktop
      }
    }, 1000);
  }

  // Function to scan the content for time strings, convert them into clickable links, and insert links into page
  function makeTimesClickable(contentEl) {
    const bodyText = contentEl.innerHTML;
    const timePattern = /(\d+)\s*(seconds|second|secs|s|minutes|minute|mins|min|m|hours|hour|hrs|hr|h|days|day|d)/gi;

    const newBodyText = bodyText.replace(timePattern, (match) => {
      return `<span class="time-link"><i class="fa-solid fa-stopwatch"></i> ${match}</span>`;
    });

    contentEl.innerHTML = newBodyText;

    const timeElements = document.querySelectorAll('.time-link');
    timeElements.forEach((el) => {
      const timeStr = el.textContent.trim();
      const duration = convertToMilliseconds(timeStr);
      const label = timeStr; // Label for each timer

      // Make the time string clickable
      el.addEventListener('click', () => startCountdown(duration, label));
    });
  }

  // Public API for the timer script
  return {
    init: function (contentElement) {
      makeTimesClickable(contentElement);
    },
    requestPermission: function () {
      requestNotificationPermission();
    }
  };
})();
