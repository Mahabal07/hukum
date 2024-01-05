import random

# Define suits and values
suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts']
values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']

# Function to create a deck of cards without repetition
def create_deck():
    return [(suit, value) for suit in suits for value in values]

# Function to shuffle and distribute cards to players without repetition
def shuffle_and_distribute(deck, num_players, num_cards):
    random.shuffle(deck)

    hands = [[] for _ in range(num_players)]
    current_card = 0

    for _ in range(num_cards):
        for i in range(num_players):
            hands[i].append(deck[current_card])
            current_card += 1

    return hands, deck[current_card:]

# Function for the second half of the game
def second_half(hands_first_half, remaining_deck, num_players, num_additional_cards):
    shuffled_remaining_deck = remaining_deck[:]  # Create a copy to shuffle independently
    random.shuffle(shuffled_remaining_deck)

    # Use a set to keep track of distributed cards
    distributed_cards = set()

    for i in range(num_additional_cards):
        for j in range(num_players):
            # Ensure that the card is not repeated within the player's hand
            while shuffled_remaining_deck and shuffled_remaining_deck[i] in distributed_cards:
                i = (i + 1) % len(shuffled_remaining_deck)

            if shuffled_remaining_deck:
                hands_first_half[j].append(shuffled_remaining_deck[i])
                distributed_cards.add(shuffled_remaining_deck[i])
                i += 1

    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

# Sample function for the complete game
def play_game():
    deck = create_deck()

    # Determine which team will distribute the cards
    distributing_team = input("Which team will shuffle and distribute the cards? Enter 'A' for Team A or 'B' for Team B: ")

    if distributing_team.upper() == 'A':
        distributing_team_name = 'Team A'
        receiving_team_name = 'Team B'
        distributing_players = [1, 3]
        receiving_players = [2, 4]
    elif distributing_team.upper() == 'B':
        distributing_team_name = 'Team B'
        receiving_team_name = 'Team A'
        distributing_players = [2, 4]
        receiving_players = [1, 3]
    else:
        print("Invalid input. Defaulting to Team A.")
        distributing_team_name = 'Team A'
        receiving_team_name = 'Team B'
        distributing_players = [1, 3]
        receiving_players = [2, 4]

    print(f"{distributing_team_name} players: Player {distributing_players[0]} and {distributing_players[1]}")

    num_players = 4
    print(f'\n{distributing_team_name} chooses who will shuffle and distribute the cards: {distributing_players[0]} or {distributing_players[1]}')

    distributing_player = int(input("Enter the player number who will shuffle and distribute the cards: "))
    if distributing_player not in distributing_players:
        print("Invalid input. Defaulting to the first player.")
        distributing_player = distributing_players[0]

    hands_first_half, remaining_deck = shuffle_and_distribute(deck, num_players, 4)

    print("\nShuffled Hands at the end of the First half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Extract cards used in the first half from the remaining deck
    used_cards = set(card for hand in hands_first_half for card in hand)
    remaining_deck = [card for card in remaining_deck if card not in used_cards]

    # Determine the player who will choose Hukum
    choosing_player = (distributing_player % num_players) + 1

    print(f"\n{receiving_team_name},  player {choosing_player} choose hukum from this suit['Clubs', 'Diamonds', 'Spades', 'Hearts'] ")
    hukum_suit = input("Enter the chosen Hukum  ")
    # Check if the entered Hukum is a valid suit
    while hukum_suit.capitalize() not in suits:
        print("Invalid suit. Please choose from 'Clubs', 'Diamonds', 'Spades', 'Hearts'")
        break
    hukum_suit = input("Enter the chosen Hukum: ")
    

    print(f"{receiving_team_name} selects '{hukum_suit.capitalize()}' as Hukum.")
    

    print(f"\n{distributing_team_name} Distributes additional cards in the Second half:")
    second_half(hands_first_half, remaining_deck, num_players, 4)

# Run the complete game
play_game()

