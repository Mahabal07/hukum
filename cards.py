import random

# Define suits and values
suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts']
values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']

# Function to create a deck of cards
def create_deck():
    deck = [(suit, value) for suit in suits for value in values]
    return deck

# Function to shuffle and distribute cards to players without repetition
def shuffle_and_distribute(deck, num_players, num_cards):
    hands = deal_cards(deck, num_players, num_cards)
    for i, hand in enumerate(hands):
        print(f'Player {i + 1} Hand: {hand}')
    return hands

# Function to deal cards to players without repetition
def deal_cards(deck, num_players, num_cards):
    hands = [[] for _ in range(num_players)]
    unique_cards = set()

    while len(unique_cards) < num_players * num_cards:
        for i in range(num_players):
            if len(unique_cards) < num_players * num_cards:
                card = random.choice(deck)
                while card in unique_cards:
                    card = random.choice(deck)
                hands[i].append(card)
                unique_cards.add(card)

    return hands

# Function to choose 'Hukum'
def choose_hukum():
    hukum = input('choose hukum  : ')
    return hukum

# Function for the second half of the game
def second_half(hands_first_half, deck, num_players, num_additional_cards):
    # Shuffle the remaining cards in the deck
    random.shuffle(deck)

    # Distribute additional cards to players without repetition
    additional_cards = deal_cards(deck, num_players, num_additional_cards)
    for i, cards in enumerate(additional_cards):
        hands_first_half[i] += cards

    # # Print the final hands for each player
    # for i, hand in enumerate(hands_first_half):
    #     print(f'Final Hand for Player {i + 1}: {hand}')

# Sample function for the complete game
def play_game():
    # Create the deck
    deck = create_deck()

    # Number of players
    num_players = 4

    # First half of the game
    hands_first_half = shuffle_and_distribute(deck, num_players, 4)

    # Determine which team is choosing Hukum (Team 2)
    hukum_suit = choose_hukum()
    print(f"Team 2 selects '{hukum_suit}' as Hukum.")

    # Create a new deck for the second half
    deck_second_half = create_deck()

    # Distribute remaining 16 cards to players without repetition
    additional_cards = deal_cards(deck_second_half, num_players, 4)
    for i, cards in enumerate(additional_cards):
        hands_first_half[i] += cards

    # Print the updated hands for each player after the first half
    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Second half of the game (additional 4 cards per player)
    second_half(hands_first_half, deck, num_players, 4)

# Run the complete game
play_game()
