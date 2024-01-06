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

# Function to compare cards based on Hukum
def compare_cards(card1, card2, hukum):
    if card1[0] == card2[0]:
        return values.index(card1[1]) - values.index(card2[1])
    elif card1[0] == hukum:
        return 1
    elif card2[0] == hukum:
        return -1
    else:
        return 0

# Function to play a round
def play_round(player_hands, hukum):
    round_cards = []

    for i in range(4):
        current_player = i % 2
        print(f"Player {current_player + 1}'s turn:")
        card_played = input(f"Select a card to play from {player_hands[current_player]}: ")

        # Check if the card is valid
        if (card_played, card_played[0]) not in player_hands[current_player]:
            print("Invalid card. Try again.")
            i -= 1
            continue

        player_hands[current_player].remove((card_played, card_played[0]))

        if i > 0:
            # Check if the card follows the suit constraint
            if (card_played[0] != round_cards[0][0]) and any(card[0] == round_cards[0][0] for card in player_hands[current_player]):
                print("Invalid move. Follow the suit.")
                i -= 1
                continue

        print(f"Player {current_player + 1} played: {card_played}")
        round_cards.append((card_played, card_played[0]))

    round_winner = max(round_cards, key=lambda x: (values.index(x[1]), x[0]), default=None)
    print(f"Round winner: Player {round_cards.index(round_winner) + 1}")
    return round_winner

# ... (Your existing code)

# Function to play the second half
def play_second_half(hands_first_half, remaining_deck, num_players, num_sets, hukum_suit):
    shuffled_remaining_deck = remaining_deck[:]
    random.shuffle(shuffled_remaining_deck)

    # Distribute additional cards to the other team
    hands_second_half, remaining_deck = shuffle_and_distribute(shuffled_remaining_deck, num_players, 4)

    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_second_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Play sets in the second half
    for _ in range(num_sets):
        round_winner = play_round(hands_second_half, hukum_suit)
        starting_player = hands_second_half.index(round_winner) % 2
        hands_second_half = hands_second_half[starting_player:] + hands_second_half[:starting_player]

    print("Game over.")

# Function to play the complete game
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
    remaining_deck = [(card, card[0]) for card in remaining_deck if (card, card[0]) not in used_cards]

    # Determine the player who will choose Hukum
    choosing_player = (distributing_player % num_players) + 1

    print(f"\n{receiving_team_name}, player {choosing_player} choose hukum from this suit ['Clubs', 'Diamonds', 'Spades', 'Hearts'] ")
    
    # Choose Hukum
    hukum_suit = input("Enter the chosen Hukum: ").capitalize()

    while hukum_suit not in suits:
        print("Invalid suit. Please choose from 'Clubs', 'Diamonds', 'Spades', 'Hearts'")
        hukum_suit = input("Enter the chosen Hukum: ").capitalize()

    print(f"{receiving_team_name} selects '{hukum_suit}' as Hukum.")

    print(f"\n{distributing_team_name} Distributes additional cards in the Second half:")
    play_second_half(hands_first_half, remaining_deck, num_players, 8 - len(hands_first_half[0]), hukum_suit)

# Run the complete game
play_game()

