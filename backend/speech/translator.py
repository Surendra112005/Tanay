# speech/translator.py

from deep_translator import GoogleTranslator
from langdetect import detect


def translate_to_english(text):

    try:

        if not text:
            return ""

        detected_language = detect(text)

        if detected_language == "en":
            return text

        translated = GoogleTranslator(
            source="auto",
            target="en"
        ).translate(text)

        return translated

    except Exception as e:

        print("Translation Error:", e)

        return text


if __name__ == "__main__":

    text = input("Enter Text: ")

    translated = translate_to_english(text)

    print("\nEnglish Output:")
    print(translated)