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

# Function for a player's turn to choose a card
def choose_card(player_number, player_hand):
    print(f"\nPlayer {player_number}'s Hand: {player_hand}")
    chosen_card_index = int(input(f"Player {player_number}, choose the index of the card to play: "))

    # Check if the chosen index is valid
    while chosen_card_index < 0 or chosen_card_index >= len(player_hand):
        print("Invalid index. Please choose a valid index.")
        chosen_card_index = int(input(f"Player {player_number}, choose the index of the card to play: "))

    return player_hand.pop(chosen_card_index)

# Function for the main game loop
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
        print("Invalid input!!!!. PLEASE ENTER YOUR CORRECT PLAYER NUMBER.")
        exit()
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
    print(f"\n{receiving_team_name}, player {choosing_player} choose hukum from this suit['Clubs', 'Diamonds', 'Spades', 'Hearts'] ")
    hukum_suit = input("Enter the chosen Hukum  ")

    # Check if the entered Hukum is a valid suit
    while hukum_suit.capitalize() not in suits:
        print("Invalid suit. Please choose from 'Clubs', 'Diamonds', 'Spades', 'Hearts'")
        break

    print(f"{receiving_team_name} selects '{hukum_suit.capitalize()}' as Hukum.")

    print(f"\n{distributing_team_name} Distributes additional cards in the Second half:")
    
    # Second half of the game
    shuffled_remaining_deck = remaining_deck[:]  # Create a copy to shuffle independently
    random.shuffle(shuffled_remaining_deck)

    # Use a set to keep track of distributed cards
    distributed_cards = set()

    for i in range(4):
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

    # Determine the player who starts the game after the second half based on the shuffling player in the first half
    if distributing_team_name == 'Team A':
        shuffling_player_first_half = 1 if distributing_player == 1 else 3
    else:  # distributing_team_name == 'Team B'
        shuffling_player_first_half = 2 if distributing_player == 2 else 4

    # Determine which player starts the game after the second half based on the shuffling player in the first half
    if shuffling_player_first_half == 1:
        starting_player = 3
    elif shuffling_player_first_half == 2:
        starting_player = 4
    elif shuffling_player_first_half == 4:
        starting_player = 2
    else:
        starting_player = 1

    def choose_card(player_number, player_hand):
        print(f"\nPlayer {player_number}'s Hand: {player_hand}")
        chosen_card_index = int(input(f"Player {player_number}, choose the index of the card to play: "))

        while chosen_card_index < 0 or chosen_card_index >= len(player_hand):
            print("Invalid index. Please choose a valid index.")
            chosen_card_index = int(input(f"Player {player_number}, choose the index of the card to play: "))

        return player_hand.pop(chosen_card_index)

def play_game():
    deck = create_deck()
    hands_first_half, remaining_deck = shuffle_and_distribute(deck, num_players=4, num_cards=4)

    print("\nShuffled Hands at the end of the First half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Eliminate chosen cards after every 4 cards
    for round_number in range(1, 3):  # Assuming 2 rounds for illustration
        print(f"\nRound {round_number}: Chosen cards are eliminated.")
        for i in range(len(hands_first_half)):
            chosen_card = choose_card(i + 1, hands_first_half[i])
            print(f"Player {i + 1} shows: {chosen_card}")

    # ... (rest of the code remains unchanged)

# Start the game
play_game()