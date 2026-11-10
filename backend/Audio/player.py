import pygame
import time

def play_response(audio_file):

    pygame.mixer.init()

    pygame.mixer.music.load(audio_file)

    pygame.mixer.music.play()

    while pygame.mixer.music.get_busy():
        time.sleep(0.1)