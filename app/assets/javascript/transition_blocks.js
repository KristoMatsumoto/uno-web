showBlock = () => {
    const players_block = document.querySelector('#players');
    const settings_block = document.querySelector('.settings-block');
    const button = document.querySelector('#hidden-button');

    if (players_block.classList.contains('hidden-block')) {
        players_block.classList.remove('hidden-block');
        settings_block.classList.add('hidden-block');
        button.innerHTML = 'Show game settings';
    } else {
        players_block.classList.add('hidden-block');
        settings_block.classList.remove('hidden-block');
        button.innerHTML = 'Show players';
    }
};
