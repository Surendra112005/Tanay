def detect_emotion(text):

    text = text.lower()

    happy_words = ["happy", "joy", "good", "great", "excellent", "wonderful"]
    sad_words = ["sad", "upset", "bad", "depressed", "cry"]
    angry_words = ["angry", "mad", "hate", "frustrated"]

    for word in happy_words:
        if word in text:
            return "joy"

    for word in sad_words:
        if word in text:
            return "sadness"

    for word in angry_words:
        if word in text:
            return "anger"

    return "neutral"