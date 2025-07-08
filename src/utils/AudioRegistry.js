/**
 * AudioRegistry: A singleton class to manage all audio players in the application
 * This ensures only one audio can play at a time and properly handles cleanup
 */
class AudioRegistry {
  constructor() {
    this.audioMap = new Map(); // Map of questionId -> audio element
    this.currentPlayingId = null;
    this.isInitialized = false;
    this.debugMode = true; // Set to false in production
  }

  log(...args) {
    if (this.debugMode) {
      console.log("🔊 [AudioRegistry]", ...args);
    }
  }

  init() {
    if (this.isInitialized) return;

    // Make the registry available globally for debugging
    window.audioRegistry = this;

    // Add a global method to stop all audio
    window.stopAllAudio = () => this.stopAll();

    this.isInitialized = true;
    this.log("Initialized");
  }

  /**
   * Register an audio element with the registry
   * @param {string} questionId - The unique ID of the question
   * @param {HTMLAudioElement} audioElement - The audio element to register
   */
  register(questionId, audioElement) {
    if (!this.isInitialized) this.init();

    if (!questionId) {
      console.error("[AudioRegistry] Cannot register audio without questionId");
      return;
    }

    this.audioMap.set(questionId, audioElement);
    this.log(`Registered audio for question: ${questionId}`);

    // Add event listeners to track play/pause state
    this.addEventListeners(questionId, audioElement);
  }

  /**
   * Unregister an audio element from the registry
   * @param {string} questionId - The unique ID of the question
   */
  unregister(questionId) {
    if (!questionId) return;

    const audio = this.audioMap.get(questionId);
    if (audio) {
      // Remove our event listeners
      this.removeEventListeners(audio);

      // If this was playing, reset the state
      if (this.currentPlayingId === questionId) {
        this.currentPlayingId = null;
      }

      this.audioMap.delete(questionId);
      this.log(`Unregistered audio for question: ${questionId}`);
    }
  }

  /**
   * Play audio for a specific question, stopping any other playing audio
   * @param {string} questionId - The unique ID of the question
   * @returns {boolean} - Whether the audio started playing successfully
   */
  playAudio(questionId) {
    if (!questionId) return false;

    // Stop any current audio
    this.stopAll();

    const audio = this.audioMap.get(questionId);
    if (!audio) {
      this.log(
        `Cannot play audio - no audio registered for question: ${questionId}`
      );
      return false;
    }

    try {
      this.log(
        `Attempting to play audio for question: ${questionId}, source: ${audio.src}`
      );

      // Kiểm tra và khắc phục nếu src bị mất
      if (
        !audio.src ||
        audio.src === "about:blank" ||
        audio.src === window.location.href
      ) {
        // Tìm src từ source tags
        const sourceElements = audio.getElementsByTagName("source");
        if (sourceElements.length > 0) {
          const sourceSrc = sourceElements[0].src;
          this.log(
            `Found audio src from source element: ${sourceSrc}, applying to audio element`
          );
          audio.src = sourceSrc;
        }
      }

      // Make sure audio is loaded before playing
      if (audio.readyState < 2) {
        // HAVE_CURRENT_DATA = 2
        this.log(
          `Audio not ready yet, forcing load for question: ${questionId}`
        );
        audio.load();
      }

      audio.currentTime = 0; // Reset to beginning
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error(
            `Error playing audio for question ${questionId}:`,
            error
          );
        });
      }

      this.currentPlayingId = questionId;
      return true;
    } catch (error) {
      console.error(
        `[AudioRegistry] Error playing audio for question: ${questionId}`,
        error
      );
      return false;
    }
  }

  /**
   * Stop audio for a specific question
   * @param {string} questionId - The unique ID of the question
   */
  stopAudio(questionId) {
    if (!questionId) return;

    const audio = this.audioMap.get(questionId);
    if (audio) {
      this.log(`Stopping audio for question: ${questionId}`);
      audio.pause();
      audio.currentTime = 0;

      if (this.currentPlayingId === questionId) {
        this.currentPlayingId = null;
      }
    }
  }

  /**
   * Stop all audio players
   */
  stopAll() {
    this.log("Stopping all audio");

    this.audioMap.forEach((audio, id) => {
      this.log(`- Stopping audio for question: ${id}`);

      // Always pause and reset even if already paused
      try {
        // Some browsers might throw when pausing already paused audio
        audio.pause();
      } catch (e) {
        console.error(`Error pausing audio for question ${id}:`, e);
      }

      // Reset to beginning
      audio.currentTime = 0;
    });

    this.currentPlayingId = null;
  }

  /**
   * Check if any audio is currently playing
   * @returns {boolean} - Whether any audio is playing
   */
  isAnyPlaying() {
    return this.currentPlayingId !== null;
  }

  /**
   * Check if a specific audio is currently playing
   * @param {string} questionId - The unique ID of the question
   * @returns {boolean} - Whether the specified audio is playing
   */
  isPlaying(questionId) {
    return this.currentPlayingId === questionId;
  }

  /**
   * Add event listeners to an audio element
   * @param {string} questionId - The unique ID of the question
   * @param {HTMLAudioElement} audio - The audio element
   */
  addEventListeners(questionId, audio) {
    const handlePlay = () => {
      this.log(`Audio PLAY event for question: ${questionId}`);
      this.currentPlayingId = questionId;
    };

    const handlePauseOrEnd = () => {
      this.log(`Audio PAUSE/END event for question: ${questionId}`);
      if (this.currentPlayingId === questionId) {
        this.currentPlayingId = null;
      }
    };

    // Store references to remove them later
    audio._registryHandlers = {
      play: handlePlay,
      pause: handlePauseOrEnd,
      ended: handlePauseOrEnd,
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePauseOrEnd);
    audio.addEventListener("ended", handlePauseOrEnd);
  }

  /**
   * Remove event listeners from an audio element
   * @param {HTMLAudioElement} audio - The audio element
   */
  removeEventListeners(audio) {
    if (!audio._registryHandlers) return;

    audio.removeEventListener("play", audio._registryHandlers.play);
    audio.removeEventListener("pause", audio._registryHandlers.pause);
    audio.removeEventListener("ended", audio._registryHandlers.ended);

    delete audio._registryHandlers;
  }
}

// Create and export singleton instance
const audioRegistry = new AudioRegistry();
export default audioRegistry;
