"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * AudioRegistry: A singleton class to manage all audio players in the application
 * This ensures only one audio can play at a time and properly handles cleanup
 */
var AudioRegistry =
/*#__PURE__*/
function () {
  function AudioRegistry() {
    _classCallCheck(this, AudioRegistry);

    this.audioMap = new Map(); // Map of questionId -> audio element

    this.currentPlayingId = null;
    this.isInitialized = false;
    this.debugMode = true; // Set to false in production
  }

  _createClass(AudioRegistry, [{
    key: "log",
    value: function log() {
      if (this.debugMode) {}
    }
  }, {
    key: "init",
    value: function init() {
      var _this = this;

      if (this.isInitialized) return; // Make the registry available globally for debugging

      window.audioRegistry = this; // Add a global method to stop all audio

      window.stopAllAudio = function () {
        return _this.stopAll();
      };

      this.isInitialized = true;
      this.log("Initialized");
    }
    /**
     * Register an audio element with the registry
     * @param {string} questionId - The unique ID of the question
     * @param {HTMLAudioElement} audioElement - The audio element to register
     */

  }, {
    key: "register",
    value: function register(questionId, audioElement) {
      if (!this.isInitialized) this.init();

      if (!questionId) {
        console.error("[AudioRegistry] Cannot register audio without questionId");
        return;
      }

      this.audioMap.set(questionId, audioElement); // Add event listeners to track play/pause state

      this.addEventListeners(questionId, audioElement);
    }
    /**
     * Unregister an audio element from the registry
     * @param {string} questionId - The unique ID of the question
     */

  }, {
    key: "unregister",
    value: function unregister(questionId) {
      if (!questionId) return;
      var audio = this.audioMap.get(questionId);

      if (audio) {
        // Remove our event listeners
        this.removeEventListeners(audio); // If this was playing, reset the state

        if (this.currentPlayingId === questionId) {
          this.currentPlayingId = null;
        }

        this.audioMap["delete"](questionId);
      }
    }
    /**
     * Play audio for a specific question, stopping any other playing audio
     * @param {string} questionId - The unique ID of the question
     * @returns {boolean} - Whether the audio started playing successfully
     */

  }, {
    key: "playAudio",
    value: function playAudio(questionId) {
      if (!questionId) return false; // Stop any current audio

      this.stopAll();
      var audio = this.audioMap.get(questionId);

      if (!audio) {
        return false;
      }

      try {
        // Kiểm tra và khắc phục nếu src bị mất
        if (!audio.src || audio.src === "about:blank" || audio.src === window.location.href) {
          // Tìm src từ source tags
          var sourceElements = audio.getElementsByTagName("source");

          if (sourceElements.length > 0) {
            var sourceSrc = sourceElements[0].src;
            audio.src = sourceSrc;
          }
        } // Make sure audio is loaded before playing


        if (audio.readyState < 2) {
          // HAVE_CURRENT_DATA = 2
          audio.load();
        }

        audio.currentTime = 0; // Reset to beginning

        var playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise["catch"](function (error) {
            console.error("Error playing audio for question ".concat(questionId, ":"), error);
          });
        }

        this.currentPlayingId = questionId;
        return true;
      } catch (error) {
        console.error("[AudioRegistry] Error playing audio for question: ".concat(questionId), error);
        return false;
      }
    }
    /**
     * Stop audio for a specific question
     * @param {string} questionId - The unique ID of the question
     */

  }, {
    key: "stopAudio",
    value: function stopAudio(questionId) {
      if (!questionId) return;
      var audio = this.audioMap.get(questionId);

      if (audio) {
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

  }, {
    key: "stopAll",
    value: function stopAll() {
      this.audioMap.forEach(function (audio, id) {
        // Always pause and reset even if already paused
        try {
          // Some browsers might throw when pausing already paused audio
          audio.pause();
        } catch (e) {
          console.error("Error pausing audio for question ".concat(id, ":"), e);
        } // Reset to beginning


        audio.currentTime = 0;
      });
      this.currentPlayingId = null;
    }
    /**
     * Check if any audio is currently playing
     * @returns {boolean} - Whether any audio is playing
     */

  }, {
    key: "isAnyPlaying",
    value: function isAnyPlaying() {
      return this.currentPlayingId !== null;
    }
    /**
     * Check if a specific audio is currently playing
     * @param {string} questionId - The unique ID of the question
     * @returns {boolean} - Whether the specified audio is playing
     */

  }, {
    key: "isPlaying",
    value: function isPlaying(questionId) {
      return this.currentPlayingId === questionId;
    }
    /**
     * Add event listeners to an audio element
     * @param {string} questionId - The unique ID of the question
     * @param {HTMLAudioElement} audio - The audio element
     */

  }, {
    key: "addEventListeners",
    value: function addEventListeners(questionId, audio) {
      var _this2 = this;

      var handlePlay = function handlePlay() {
        _this2.currentPlayingId = questionId;
      };

      var handlePauseOrEnd = function handlePauseOrEnd() {
        if (_this2.currentPlayingId === questionId) {
          _this2.currentPlayingId = null;
        }
      }; // Store references to remove them later


      audio._registryHandlers = {
        play: handlePlay,
        pause: handlePauseOrEnd,
        ended: handlePauseOrEnd
      };
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePauseOrEnd);
      audio.addEventListener("ended", handlePauseOrEnd);
    }
    /**
     * Remove event listeners from an audio element
     * @param {HTMLAudioElement} audio - The audio element
     */

  }, {
    key: "removeEventListeners",
    value: function removeEventListeners(audio) {
      if (!audio._registryHandlers) return;
      audio.removeEventListener("play", audio._registryHandlers.play);
      audio.removeEventListener("pause", audio._registryHandlers.pause);
      audio.removeEventListener("ended", audio._registryHandlers.ended);
      delete audio._registryHandlers;
    }
  }]);

  return AudioRegistry;
}(); // Create and export singleton instance


var audioRegistry = new AudioRegistry();
var _default = audioRegistry;
exports["default"] = _default;