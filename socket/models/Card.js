// GRUPE 1: 1, 2, 3, 4, 5, 6, 7, 8, 9
// GRUPE 2: 0, +2, direction, skip
// GRUPE 3: +4, color_change

class Card {
    constructor(value, color_num = null){
        this.value = value;
        switch(color_num){
            case 0:
                this.color = 'green';
                break;
            case 1: 
                this.color = 'red';
                break;
            case 2:
                this.color = 'blue';
                break;
            case 3: 
                this.color = 'yellow';
                break;

            default:
                this.color = null;
        }
    }

    get_data() {
        return {
            value: this.value,
        };
    }
}

// Добавить проверку, что карты 1 и 2 группы всегда были с цветом, группы 3 - без

module.exports = Card;
