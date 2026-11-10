# speech/recorder.py

import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np


def record_audio(
    filename="live.wav",
    duration=15,
    sample_rate=16000
):

    print("\n====================================")
    print(f"Recording for {duration} seconds...")
    print("Start Speaking")
    print("====================================")

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype=np.int16
    )

    sd.wait()

    write(
        filename,
        sample_rate,
        audio
    )

    print("Recording Finished")

    return filename


if __name__ == "__main__":

    file = record_audio()

    print("Saved:", file)