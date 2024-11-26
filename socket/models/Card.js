class Card {
    static CARD_PLUS2 = '+2';
    static CARD_SKIP = 'skip';
    static CARD_DIRECTION = 'direction';
    static CARD_COLOR_CHANGE = 'color_change';
    static CARD_PLUS4 = '+4';

    static GROUP_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    static GROUP_RARE = ['0', Card.CARD_PLUS2, Card.CARD_DIRECTION, Card.CARD_SKIP];
    static GROUP_NONCOLORED = [Card.CARD_PLUS4, Card.CARD_COLOR_CHANGE];
    
    static COLORS = ['green', 'red', 'blue', 'yellow'];
    static NONCOLORED = 'all';
    static VALUES = [...Card.GROUP_NUMS, ...Card.GROUP_RARE, ...Card.GROUP_NONCOLORED];

    #id
    #value; 
    #color;
    #useable = false;
    #selected_color = null;

    constructor(id, value, color) {
        this.#color = color;
        this.#id = id;
        this.#value = value;
    }
    // get_card(card_object) {
    //     if (Card.VALUES.findIndex(card_object.value) === -1) return;
    //     if (Card.COLORS.findIndex(card_object.color) === -1) {
    //         if (Card.NONCOLORED !== card_object.color && Card.COLORS.findIndex(card_object.selected_color) === -1)

    //     }
    // }
    
    set_useability(is_useable) { this.#useable = is_useable; }
    set_selected_color(color) {
        if (Card.COLORS.findIndex((color_) => color_ === color) === -1) return false;
        this.#selected_color = color;
        return true;
        // if (this.#selected_color)
        //     throw new Error("Cannot select color two times");
        // if (this.#color != 'all' || this.#value != '+4' || this.#value != 'color_change')
        //     throw new Error("Cannot change color with this card");
        // if (color_num < 0 || color_num > 3)
        //     throw new Error("Cannot change color on all-colored");
        // this.#selected_color = COLORS[color_num];
    }

    get value() { return this.#value; }
    get color() { return this.#color; }
    get id() { return this.#id; }
    get selected_color() { return this.#selected_color; }
    get_data() { return {
            id: this.#id,
            value: this.#value,
            color: this.#color,
            selected_color: this.#selected_color,
            useable: this.#useable
    }; }
}

module.exports = Card;
