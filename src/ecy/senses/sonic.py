import os
import subprocess
import time
import threading
from typing import Optional, Callable

# Safe Import for SpeechRecognition
try:
    import speech_recognition as sr
    HAS_SR = True
except ImportError:
    HAS_SR = False
    print("[Sonic] Warning: 'speech_recognition' not found. Microphone input disabled.")

class Sonic:
    """
    eCy OS Sensory Module: Sonic (Audio)
    Ears: SpeechRecognition (wrapping PyAudio/Siri)
    Voice: Native macOS 'say' command (Siri TTS)
    """

    def __init__(self, wake_word: str = "ecy"):
        self.wake_word = wake_word.lower()
        self.is_listening = False
        self.has_ears = HAS_SR
        
        if self.has_ears:
            self.recognizer = sr.Recognizer()
            try:
                # Try to init microphone; might fail if PyAudio missing
                self.microphone = sr.Microphone()
                
                # Calibration for Ambient Noise
                print("[Sonic] Calibrating Ears for Ambient Noise...")
                with self.microphone as source:
                    self.recognizer.adjust_for_ambient_noise(source, duration=1)
                print("[Sonic] Ears Calibrated.")
                
            except (AttributeError, OSError, Exception) as e:
                # AttributeError: Could not find PyAudio
                # OSError: No Default Input Device Available
                print(f"[Sonic] Microphone Init Warning: {e}. Switching to Mock Listen Mode.")
                self.has_ears = False
                self.microphone = None
        else:
            self.recognizer = None
            self.microphone = None

    def speak(self, text: str, voice: str = "Samantha"):
        """
        Uses macOS native 'say' command to speak text.
        """
        if not text: return
        print(f"[Sonic] Saying: '{text}'")
        try:
            # -v specifies voice, -r rate (optional)
            subprocess.run(["say", "-v", voice, text], check=False)
        except Exception as e:
            print(f"[Sonic] Speech Error: {e}")

    def listen_for_command(self, timeout: int = 5) -> str:
        """
        Listens for a command via Microphone.
        Returns the recognized text or empty string.
        """
        if not self.has_ears or not self.microphone:
            return "[Mock] Microphone Unavailable"

        print("[Sonic] Listening...")
        try:
            with self.microphone as source:
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
            
            print("[Sonic] Processing Audio...")
            # Recognize speech using Google Speech Recognition (free API)
            command = self.recognizer.recognize_google(audio)
            print(f"[Sonic] Heard: '{command}'")
            return command
        
        except sr.WaitTimeoutError:
            print("[Sonic] Timeout: No speech detected.")
            return ""
        except sr.UnknownValueError:
            print("[Sonic] Could not understand audio.")
            return ""
        except sr.RequestError as e:
            print(f"[Sonic] Service Error: {e}")
            return ""
        except Exception as e:
            print(f"[Sonic] Listen Error: {e}")
            return ""

if __name__ == "__main__":
    # Test
    bot = Sonic()
    bot.speak("eCy OS Sonic Module Online.", voice="Start")
    # Uncomment to test mic interactively:
    # cmd = bot.listen_for_command()
    # if cmd: bot.speak(f"You said: {cmd}")
