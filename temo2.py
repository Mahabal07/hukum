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
    print('Team A players: Player 1 and 3')
    print('Team B players: Player 2 and 4')

    num_players = 4
    print('\nTeam A distributes the cards for the first half')

    hands_first_half, remaining_deck = shuffle_and_distribute(deck, num_players, 4)

    print("\nShuffled Hands at the end of the First half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Extract cards used in the first half from the remaining deck
    used_cards = set(card for hand in hands_first_half for card in hand)
    remaining_deck = [card for card in remaining_deck if card not in used_cards]

    hukum_suit = input("\nTeam B, choose Hukum ['Clubs', 'Diamonds', 'Spades', 'Hearts']: ")
    print(f"Team B selects '{hukum_suit}' as Hukum.")

    print("\nTeam B distributes additional cards in the Second half:")
    second_half(hands_first_half, remaining_deck, num_players, 4)

# Run the complete game
play_game()
