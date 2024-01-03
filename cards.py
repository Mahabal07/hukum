import random

# Define suits and values
suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts']
values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King']

# Function to create a deck of cards
def create_deck():
    deck = [(suit, value) for suit in suits for value in values]
    random.shuffle(deck)
    return deck

# Function for the first half of the game
def first_half(deck, num_players):
    # Deal 4 cards to each player
    hands = deal_cards(deck, num_players, 4)

    # Print hands for each player
    for i, hand in enumerate(hands):
        print(f'Player {i + 1} Hand: {hand}')

    # Team A shuffles their cards
    team_a_hand = hands[0] + hands[2]
    random.shuffle(team_a_hand)

    # Team B selects 'Hukum'
    hukum_suit = random.choice(suits)
    print(f"Team B selects '{hukum_suit}' as Hukum.")

    # Team B players choose cards of 'Hukum'
    team_b_hukum_cards = [card for card in team_a_hand if card[0] == hukum_suit]
    print(f"Team B's Hukum Cards: {team_b_hukum_cards}")

    # Team B shuffles the remaining half of the cards
    remaining_cards = [card for card in team_a_hand if card not in team_b_hukum_cards]
    random.shuffle(remaining_cards)

    # Return shuffled deck for the second half
    return team_b_hukum_cards + remaining_cards

# Function for the second half of the game
def second_half(deck, num_players):
    # Deal 4 cards to each player
    hands = deal_cards(deck, num_players, 4)

    # Print hands for each player
    for i, hand in enumerate(hands):
        print(f'Player {i + 1} Hand: {hand}')

    # Return the combined hands for all players
    return [card for hand in hands for card in hand]

# Function to deal cards to players
def deal_cards(deck, num_players, num_cards):
    hands = [[] for _ in range(num_players)]
    while deck and num_cards > 0:
        for i in range(num_players):
            if deck and num_cards > 0:
                hands[i].append(deck.pop(0))
                num_cards -= 1
    return hands

# Sample function for the complete game
def play_game():
    # Create the deck
    deck = create_deck()

    # Number of players and teams
    num_players = 4

    # First half of the game
    deck = first_half(deck, num_players)

    # Second half of the game
    deck = second_half(deck, num_players)

    # Print the final hands for each player
    print("\nFinal Hands for Each Player:", deck)

# Run the sample game
play_game()
