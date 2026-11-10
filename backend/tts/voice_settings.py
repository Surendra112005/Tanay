from tts.emotion_profiles import EMOTIONS

def get_voice_profile(emotion):

    emotion_map = {

        "joy": "happy",

        "sadness": "sad",

        "anger": "angry",

        "fear": "calm",

        "love": "happy",

        "surprise": "excited",

        "neutral": "calm"
    }

    profile_name = emotion_map.get(
        emotion,
        "calm"
    )

    return EMOTIONS[profile_name]