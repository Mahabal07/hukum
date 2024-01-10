def decide_winner(cards, hukum_suit, starting_suit):
    # Define the priority order for the cards
    card_priority = {'7': 0, '8': 1, '9': 2, '10': 3, 'Jack': 4, 'Queen': 5, 'King': 6, 'Ace': 7}

    # Sort the cards based on the priority order
    sorted_cards = sorted(cards, key=lambda x: (hukum_suit != x[0], starting_suit != x[0], card_priority[x[1]]))

    # The player who played the first card is the winner
    winner = sorted_cards[0]
    winner_player = cards.index(winner) + 1

    return winner_player, winner