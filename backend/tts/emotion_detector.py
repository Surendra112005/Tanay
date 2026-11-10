# tts/emotion_detector.py

from transformers import pipeline

print("Loading Emotion Detection Model...")

emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

print("Emotion Model Loaded Successfully!")

emotion_keywords = {

    "joy": [
        "happy",
        "excited",
        "awesome",
        "great",
        "amazing",
        "fantastic"
    ],

    "surprise": [
        "wow",
        "unexpected",
        "surprised",
        "shocked",
        "can't believe",
        "unbelievable",
        "amazing",
        "what"
    ],

    "sadness": [
        "sad",
        "cry",
        "depressed",
        "hurt",
        "heartbroken"
    ],

    "anger": [
        "angry",
        "mad",
        "frustrated",
        "annoyed"
    ],

    "fear": [
        "scared",
        "afraid",
        "worried",
        "nervous"
    ],

    "love": [
        "love",
        "care",
        "adore",
        "affection"
    ],

    "lonely": [
        "lonely",
        "alone",
        "isolated",
        "nobody"
    ],

    "stress": [
        "stress",
        "pressure",
        "overwhelmed",
        "exhausted"
    ]
}


def detect_emotion(text):

    if not text:
        return "neutral"

    text_lower = text.lower()

    # Keyword Based Detection
    for emotion, keywords in emotion_keywords.items():

        for keyword in keywords:

            if keyword in text_lower:
                return emotion

    try:

        # AI Emotion Detection
        result = emotion_model(text)

        label = result[0]["label"].lower()

        if label in [
            "joy",
            "sadness",
            "anger",
            "fear",
            "love"
        ]:
            return label

        return "neutral"

    except Exception as e:

        print("Emotion Detection Error:", e)

        return "neutral"