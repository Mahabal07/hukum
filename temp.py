import random

# Define suits and values
suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts']
values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']

# Function to create a deck of cards
def create_deck():
    return [(suit, value) for suit in suits for value in values]

# Function to shuffle and distribute cards to players without repetition
def shuffle_and_distribute(deck, num_players, num_cards):
    # Shuffle the deck
    random.shuffle(deck)

    hands = [[] for _ in range(num_players)]
    current_card = 0

    # Distribute cards to players
    for _ in range(num_cards):
        for i in range(num_players):
            hands[i].append(deck[current_card])
            current_card += 1

    # Print hands
    for i, hand in enumerate(hands):
        print(f'Player {i + 1} Hand: {hand}')

    return hands

# Function to choose 'Hukum'
def choose_hukum():
    hukum = input("Team B, choose Hukum ['Clubs', 'Diamonds', 'Spades', 'Hearts']: ")
    return hukum

# Function for the second half of the game
def second_half(hands_first_half, deck, num_players, num_additional_cards):
    # Shuffle the remaining cards in the deck
    random.shuffle(deck)

    # Distribute additional cards to players without repetition
    additional_cards = deck[:num_additional_cards]
    for i, cards in enumerate(additional_cards):
        # Ensure the index is within the valid range
        player_index = i % num_players
        hands_first_half[player_index] += [cards]

    # Print the updated hands for each player after the first half
    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

# Sample function for the complete game
def play_game():
    # Create the deck
    deck = create_deck()
    print('Team A players: Player 1 and 3')
    print('Team B players: Player 2 and 4')

    # Number of players
    num_players = 4
    print('Team A distributes the cards')

    # First half of the game
    hands_first_half = shuffle_and_distribute(deck, num_players, 4)

    # Determine which team is choosing Hukum (Team 2)
    hukum_suit = choose_hukum()
    print(f"Team B selects '{hukum_suit}' as Hukum.")

    # Create a new deck for the second half
    deck_second_half = create_deck()

    # Distribute remaining 16 cards to players without repetition
    additional_cards = deck_second_half[:16]
    for i, cards in enumerate(additional_cards):
        # Ensure the index is within the valid range
        player_index = i % num_players
        hands_first_half[player_index] += [cards]

    # Print the updated hands for each player after the first half
    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Second half of the game (additional 4 cards per player)
    second_half(hands_first_half, deck, num_players, 4)

# Run the complete game
play_game()
