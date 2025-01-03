class Player {
    #is_finished = false;
    #say_uno = false;
    #said_uno_for_him = false;    

    constructor(data) {
        this.nickname = data.nickname;
        this.player_number = data.player_number;
        this.avatar = data.avatar;
        // this.is_admin = data.is_admin;

        this.cards = [];
    }

    finish() { this.#is_finished = true; }
    draw_card(card) {
        this.cards.push(card);
        // отсортировать?
    }
    put_card(card_id) {
        const card_i = this.cards.findIndex(card => card.id === card_id);
        return this.cards.splice(card_i, 1)[0];
    }
    uno() { this.#say_uno = true; }
    uno_reset() { this.#say_uno = false; }
    // draw_cards(cards) {
    //     this.cards.push(...cards);
    // }

    get is_finished() { return this.#is_finished; }
    get say_uno() { return this.#say_uno; }
    get said_uno_for_him() { return this.#said_uno_for_him; }
    get_data() {
        const cards = [];
        this.cards.forEach((card) => {
            cards.push(card.get_data());
        })
        return {
            nickname: this.nickname,
            player_number: this.player_number,
            avatar: this.avatar,
            cards: cards,
            is_finished: this.#is_finished,
            say_uno: false,
            said_uno_for_him: this.#said_uno_for_him,
            // is_admin: this.is_admin
        }
    }
}

module.exports = Player;
