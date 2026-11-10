import re

from memory.profile_manager import save_profile


def clean(value):
    return value.strip().strip(".!?,")


def extract_profile(user_text):

    text = user_text.strip()
    lower = text.lower()

    # ----------------------------
    # Name
    # ----------------------------
    patterns = [
        (r"my name is (.+)", "user_name"),
        (r"i am (.+)", "user_name"),
        (r"call me (.+)", "user_name"),

        # Favorite Things
        (r"my favorite food is (.+)", "favorite_food"),
        (r"my favourite food is (.+)", "favorite_food"),
        (r"my favorite team is (.+)", "favorite_team"),
        (r"my favorite player is (.+)", "favorite_player"),
        (r"my favorite movie is (.+)", "favorite_movie"),
        (r"my favorite colour is (.+)", "favorite_color"),
        (r"my favorite color is (.+)", "favorite_color"),
        (r"my favorite subject is (.+)", "favorite_subject"),

        # Likes
        (r"i like (.+)", "likes"),
        (r"i love (.+)", "likes"),
        (r"i enjoy (.+)", "likes"),

        # Hobby
        (r"my hobby is (.+)", "hobby"),
        (r"my hobbies are (.+)", "hobby"),

        # Education
        (r"i study at (.+)", "college"),
        (r"i am studying at (.+)", "college"),

        # Work
        (r"i work at (.+)", "company"),

        # Goal
        (r"i want to become (.+)", "career_goal"),
        (r"my dream is to become (.+)", "career_goal"),

        # Project
        (r"i am working on (.+)", "current_project"),

        # Birthday
        (r"my birthday is (.+)", "birthday"),

        # Pet
        (r"my pet's name is (.+)", "pet_name"),
        (r"my pet name is (.+)", "pet_name"),

        # Best Friend
        (r"my best friend is (.+)", "best_friend"),

        # City
        (r"i live in (.+)", "city"),

        # Country
        (r"i am from (.+)", "country"),
    ]

    for pattern, key in patterns:

        match = re.search(
            pattern,
            lower
        )

        if match:

            value = clean(
                match.group(1)
            )

            save_profile(
                key,
                value
            )

    # ----------------------------------------------------
    # Dynamic Remember Statements
    # ----------------------------------------------------

    remember_patterns = [

        r"remember that (.+?) is (.+)",

        r"remember my (.+?) is (.+)",

        r"don't forget my (.+?) is (.+)",

        r"always remember my (.+?) is (.+)",

        r"please remember my (.+?) is (.+)",

        r"save my (.+?) as (.+)"
    ]

    for pattern in remember_patterns:

        match = re.search(
            pattern,
            lower
        )

        if match:

            key = clean(
                match.group(1)
            )

            value = clean(
                match.group(2)
            )

            key = key.replace(
                " ",
                "_"
            )

            save_profile(
                key,
                value
            )

    # ----------------------------------------------------
    # Dynamic "I like..."
    # ----------------------------------------------------

    like_match = re.search(
        r"i like (.+)",
        lower
    )

    if like_match:

        save_profile(
            "likes",
            clean(
                like_match.group(1)
            )
        )

    # ----------------------------------------------------
    # Dynamic "I don't like..."
    # ----------------------------------------------------

    dislike_match = re.search(
        r"i don't like (.+)",
        lower
    )

    if dislike_match:

        save_profile(
            "dislikes",
            clean(
                dislike_match.group(1)
            )
        )

    # ----------------------------------------------------
    # Dynamic "My ... is ..."
    # Example:
    # My laptop is Dell
    # My sister is Priya
    # My mentor is Mahesh
    # ----------------------------------------------------

    generic = re.search(
        r"my (.+?) is (.+)",
        lower
    )

    if generic:

        key = clean(
            generic.group(1)
        )

        value = clean(
            generic.group(2)
        )

        key = key.replace(
            " ",
            "_"
        )

        save_profile(
            key,
            value
        )