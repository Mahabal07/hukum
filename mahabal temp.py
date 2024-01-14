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
def play_round(hands, current_round, starting_player, eliminated_cards):
    print(f"\nRound {current_round} - Card choosing and showing phase:")
    current_player = starting_player

    chosen_cards_round = []  # List to store chosen cards in the current round

    # Card choosing and showing phase for each player in the round
    for _ in range(4):
        chosen_card = choose_card(current_player, hands[current_player - 1])
        print(f"Player {current_player} shows: {chosen_card}")
        print(hands[current_player - 1])

        chosen_cards_round.append(chosen_card)

        # Update the starting suit for the next player
        starting_suit = chosen_card[0]

        # Move to the next player
        current_player = (current_player % 4) + 1

    # Print chosen cards for the current round
    print(f"\nChosen cards for Round {current_round}: {chosen_cards_round}")

    # Add the chosen cards to the eliminated cards set
    eliminated_cards[current_round - 1].update(set(chosen_card for chosen_card in chosen_cards_round))

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
        hukum_suit = input("Enter the chosen Hukum  ")

    print(f"{receiving_team_name} selects '{hukum_suit.capitalize()}' as Hukum.")

    print(f"\n{distributing_team_name} Distributes additional cards in the Second half:")

    # Second half of the game
    shuffled_remaining_deck = remaining_deck[:]  # Create a copy to shuffle independently
    random.shuffle(shuffled_remaining_deck)

    # Use a set to keep track of distributed cards
    distributed_cards = set()

    cards_per_round = 4  # Every 4 eliminated cards considered as 1 round
    rounds = len(shuffled_remaining_deck) // cards_per_round

    for _ in range(rounds):
        for j in range(num_players):
            # Distribute cards for the current round
            for _ in range(cards_per_round):
                # Ensure that the card is not repeated within the player's hand
                while shuffled_remaining_deck and shuffled_remaining_deck[0] in distributed_cards:
                    shuffled_remaining_deck.pop(0)

                if shuffled_remaining_deck:
                    hands_first_half[j].append(shuffled_remaining_deck.pop(0))
                    distributed_cards.add(hands_first_half[j][-1])

    # Print hands at the end of the second half
    print("\nHands at the end of the Second half:")
    for i, hand in enumerate(hands_first_half):
        print(f'Player {i + 1} Hand: {hand}')

    # Determine the player who starts the game after the second half based on the shuffling player in the first half
    if distributing_team_name == 'Team A' and distributing_player == 1:
        starting_player_second_half = 3  # Player 1 starts if Player 1 shuffled in the first half
    elif distributing_team_name == 'Team A' and distributing_player == 3:
        starting_player_second_half = 1  # Player 3 starts if Player 3 shuffled in the first half
    elif distributing_team_name == 'Team B' and distributing_player == 2:
        starting_player_second_half = 4  # Player 4 starts if Player 2 shuffled in the first half
    else:
        starting_player_second_half = 2  # Default to Player 2 if none of the above conditions are met

    # Play 8 sets (rounds)
    for set_num in range(1, 9):
        eliminated_cards = [set() for _ in range(8)]  # Initialize eliminated cards for each set

        # Play 8 rounds within the set
        for round_num in range(1, 9):
            play_round(hands_first_half, round_num, starting_player_second_half, eliminated_cards)

        print(f"\nSet {set_num} completed. Eliminated cards in each round:")
        for i, eliminated_set in enumerate(eliminated_cards):
            print(f"Round {i + 1}: {eliminated_set}")

    print("\nAll sets have been completed. All players have shown their cards.")

# Start the game
play_game()
