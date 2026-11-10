from TTS.api import TTS

print("Loading Voice Model...")

tts = TTS(
    model_name="tts_models/en/jenny/jenny"
)

def generate_voice(text, emotion=None, play_audio=False, file_path="response.wav"):

    if emotion == "joy":
        text = text

    elif emotion == "sadness":
        text = text

    elif emotion == "anger":
        text = text

    elif emotion == "fear":
        text = text

    tts.tts_to_file(
        text=text,
        file_path=file_path
    )

    print("Voice Generated!")
    return file_path