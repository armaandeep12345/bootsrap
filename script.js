document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const artistButton = document.getElementById('artists');
    const artistDropdown = document.getElementById('artists-dropdown');
    const playButtons = document.querySelectorAll('.play-button, .fa-play');
    const progressBar = document.querySelector('.progress-fill');
    const currentTimeDisplay = document.querySelector('.current-time');
    const totalTimeDisplay = document.querySelector('.total-time');
    const nextButton = document.querySelector('.icon-next');
    const prevButton = document.querySelector('.icon-previous');
    const shuffleButton = document.querySelector('.icon-shuffle');
    const masterPoster = document.querySelector('.poster_masterplay');
    const masterTitle = document.querySelector('.masterplay h5');
    const waveElements = document.querySelectorAll('.wavel');
    const playPauseButton = document.querySelector('.play-pause i');

    // Songs list
    const songs = [
        {
            title: 'Faded',
            artist: 'Alan Walker',
            src: 'audio/Alan Walker - Faded (Remix by Julio Mortal Mix) (1).mp3',
            poster: 'img/artworks-000169731686-zgvff2-t500x500.jpg'
        },
        {
            title: 'Millionaire',
            artist: 'Yo Yo Honey Singh',
            src: 'audio/MILLIONAIRE SONG (Full Video)_ YO YO HONEY SINGH  GLORY  LEO  TEJI SANDHU  BHUSHAN KUMAR.mp3',
            poster: 'https___images.genius.com_5fc16694b2fcd0235f5d68fd5c9b4508.1000x1000x1.jpg'
        },
        {
            title: 'Drippy',
            artist: 'Sidhu Moose Wala',
            src: 'audio/Drippy (Official Video)  Sidhu Moose Wala  Mxrci  AR Paisley.mp3',
            poster: 'img/drippy.jpg'
        },
        {
            title: 'Shape of you',
            artist: 'Ed sheeran',
            src: 'audio/Ed Sheeran - Shape Of You (Lyrics).mp3',
            poster: 'img/Shape_Of_You_(Official_Single_Cover)_by_Ed_Sheeran.jpg'
        },
        // Add more songs here
    ];

    let currentSongIndex = 0;
    let isPlaying = false;
    let audio = new Audio(songs[currentSongIndex].src);
    const synth = window.speechSynthesis; // Initialize speech synthesis

    // Helper function to display notifications
    function showNotification(message) {
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('notification');
        notificationElement.textContent = message;

        document.body.appendChild(notificationElement);

        // Remove notification after a few seconds
        setTimeout(() => {
            notificationElement.remove();
        }, 3000);
    }

    // Helper function to play the song
    function playSong(index) {
        if (audio) {
            audio.pause();
        }
        currentSongIndex = index;
        audio = new Audio(songs[currentSongIndex].src);
        masterPoster.src = songs[currentSongIndex].poster;
        masterTitle.innerHTML = `${songs[currentSongIndex].title}<br><div class="subtitle">${songs[currentSongIndex].artist}</div>`;
        audio.play().then(() => {
            isPlaying = true;
            updatePlayPauseIcon(true);
            startWave();
            audio.addEventListener('timeupdate', updateProgressBar);
            audio.addEventListener('ended', playNextSong);
            audio.addEventListener('loadedmetadata', () => {
                totalTimeDisplay.textContent = formatTime(audio.duration);
            });
            speak(`Now playing ${songs[currentSongIndex].title} by ${songs[currentSongIndex].artist}`);
            showNotification(`Now playing: ${songs[currentSongIndex].title}`); // Show notification
        }).catch(error => {
            console.error("Error playing audio: ", error);
            speak("An error occurred while trying to play the song.");
        });
    }

    // Function to pause the song
    function pauseSong() {
        if (audio) {
            audio.pause();
            isPlaying = false;
            updatePlayPauseIcon(false);
            stopWave();
            speak("Music paused.");
            showNotification("Music paused."); // Show notification
        }
    }

    // Function to speak a message
    function speak(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        synth.speak(utterance);
    }

    // AI Assistant Integration (Web Speech API)
    const startAssistantButton = document.getElementById('start-assistant');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = function () {
        console.log("Voice recognition activated.");
        speak("Voice recognition activated. You can give commands like play, pause, next, previous, shuffle, or play a specific song.");
    };

    recognition.onresult = function (event) {
        const command = event.results[1][1].transcript.toLowerCase();
        console.log("Command received:", command);

        // Check for specific song requests
        const songRequest = songs.find(song => command.includes(song.title.toLowerCase()));
        if (songRequest) {
            const songIndex = songs.indexOf(songRequest);
            playSong(songIndex);
            return;
        }

        // Process general commands
        if (command.includes("play")) {
            if (!isPlaying) {
                playSong(currentSongIndex);
            } else {
                speak("Music is already playing.");
                showNotification("Music is already playing."); // Show notification
            }
        } else if (command.includes("pause")) {
            pauseSong();
        } else if (command.includes("next")) {
            playNextSong();
        } else if (command.includes("previous")) {
            currentSongIndex = currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1;
            playSong(currentSongIndex);
        } else if (command.includes("shuffle")) {
            currentSongIndex = Math.floor(Math.random() * songs.length);
            playSong(currentSongIndex);
        } else if (command.includes("stop")) {
            pauseSong();
        } else if (command.includes("volume up")) {
            changeVolume(0.1); // Increase volume by 10%
        } else if (command.includes("volume down")) {
            changeVolume(-0.1); // Decrease volume by 10%
        } else {
            speak("Command not recognized. Please try again.");
            console.log("Command not recognized.");
        }
    };

    // Start voice recognition when AI Assistant button is clicked
    startAssistantButton.addEventListener('click', () => {
        recognition.start();
    });

    // Change volume function
    function changeVolume(change) {
        audio.volume = Math.min(Math.max(audio.volume + change, 0), 1); // Keep volume between 0 and 1
        speak(`Volume is now ${Math.round(audio.volume * 100)} percent.`);
        showNotification(`Volume is now ${Math.round(audio.volume * 100)} percent.`); // Show notification
    }

    // Toggle play/pause icons
    function updatePlayPauseIcon(isPlaying) {
        if (isPlaying) {
            playPauseButton.classList.replace('fa-play', 'fa-pause'); // Change to pause icon
        } else {
            playPauseButton.classList.replace('fa-pause', 'fa-play'); // Change to play icon
        }
    }

    // Play/pause button event listener
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong(currentSongIndex);
        }
    });

    // Play the next song
    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    }

    // Update progress bar and time
    function updateProgressBar() {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }

    // Format time in mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }

    // Start wave animation
    function startWave() {
        waveElements.forEach(wave => wave.classList.add('active'));
    }

    // Stop wave animation
    function stopWave() {
        waveElements.forEach(wave => wave.classList.remove('active'));
    }

    // Event listeners for play buttons
    playButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (currentSongIndex === index && isPlaying) {
                pauseSong(); // Pause if the same song is clicked again
            } else {
                playSong(index); // Play the clicked song
            }
        });
    });

    // Next button functionality
    nextButton.addEventListener('click', playNextSong);

    // Previous button functionality
    prevButton.addEventListener('click', () => {
        currentSongIndex = currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1;
        playSong(currentSongIndex);
    });

    // Shuffle button functionality
    shuffleButton.addEventListener('click', () => {
        currentSongIndex = Math.floor(Math.random() * songs.length);
        playSong(currentSongIndex);
    });
});
