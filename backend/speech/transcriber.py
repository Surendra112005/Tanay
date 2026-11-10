# speech/transcriber.py

from faster_whisper import WhisperModel

print("Loading Whisper Model...")

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

print("Whisper Model Loaded Successfully!")


def transcribe(audio_path):

    print("\nStarting Transcription...")

    segments, info = model.transcribe(
        audio_path,
        task="translate",
        beam_size=5,
        vad_filter=True
    )

    text = ""

    for segment in segments:

        text += segment.text + " "

    final_text = text.strip()

    print("Detected Language:", info.language)

    print("Transcription Finished!")

    return final_text, info.language


if __name__ == "__main__":

    text, language = transcribe(
        "live.wav"
    )

    print("\nDetected Text:")
    print(text)

    print("\nLanguage:")
    print(language)