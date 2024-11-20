const Card = require('./Card');

class Player {
    constructor(data) {
        this.nickname = data.nickname;
        this.player_number = data.player_number;
        // this.is_admin = data.is_admin;

        this.cards = [];
    }

    draw_card(card) {
        this.cards.push(card);
        // отсортировать?
    }
    put_card(card_id) {
        const card_i = this.cards.findIndex(card => card.get_id() === card_id);
        return this.cards.splice(card_i, 1)[0];
    }
    // draw_cards(cards) {
    //     this.cards.push(...cards);
    // }

    get_data() {
        const cards = [];
        this.cards.forEach((card) => {
            cards.push(card.get_data());
        })
        return {
            nickname: this.nickname,
            player_number: this.player_number,
            cards: cards
            // is_admin: this.is_admin
        }
    }
}

module.exports = Player;
