# main.py

from speech.recorder import record_audio
from speech.transcriber import transcribe
from speech.translator import translate_to_english

from tts.emotion_detector import detect_emotion
from tts.generate_voice import generate_voice

from brain.ai_brain import generate_response
from Audio.player import play_response

from memory.memory_manager import (
    save_memory,
    get_recent_memories
)

from memory.profile_extractor import (
    extract_profile
)

from memory.profile_manager import (
    update_user_profile,
    get_user_profile
)

from memory.relationship_manager import (
    get_relationship_level,
    get_relationship_label,
    update_relationship
)


if __name__ == "__main__":
    print("\n====================================")
    print("Tanay AI Voice Assistant Started")
    print("Press CTRL + C to Stop")
    print("====================================\n")


    while True:

        try:

            # Record Audio
            audio_file = record_audio(
                duration=15
            )

            # Speech To Text
            original_text, language = transcribe(
                audio_file
            )

            if not original_text:
                continue

            print("\n====================================")
            print("Detected Language:", language)

            print("\nOriginal Text:")
            print(original_text)

            # Backup Translation
            english_text = translate_to_english(
                original_text
            )

            print("\nEnglish Text:")
            print(english_text)

            # Update User Profile
            update_user_profile()

            profile = get_user_profile()

            conversation_count = profile[2]

            relationship = get_relationship_label(
                conversation_count
            )

            print("\nRelationship:")
            print(relationship)

            # Extract User Information
            extract_profile(
                english_text
            )

            # Detect Emotion
            emotion = detect_emotion(
                english_text
            )

            print("\nEmotion:")
            print(emotion)

            # Retrieve Memory
            recent_memories = get_recent_memories()

            # Generate AI Response
            reply = generate_response(
                user_text=english_text,
                emotion=emotion,
                memories=recent_memories,
                relationship=relationship,
                language=language
            )

            print("\n====================================")
            print("Tanay:")
            print(reply)
            print("====================================")

            # Save Memory
            save_memory(
                english_text,
                emotion,
                reply
            )

            # Update Relationship
            update_relationship()

            relationship_level = (
                get_relationship_level()
            )

            print(
                "\nRelationship Level:",
                relationship_level
            )

            # Generate Voice
            voice_file = generate_voice(
               reply,
              emotion
            )

            play_response(voice_file)
            print(
                "\nVoice Generated Successfully!"
            )

            print(
                "\nWaiting for next conversation..."
            )

        except KeyboardInterrupt:

            print(
                "\nStopping Tanay..."
            )

            break

        except Exception as e:

            print(
                "\nError:",
                e
            )