codeHideOrShow = () => {
    const code_block = document.getElementById('code');
    const button = document.getElementById('hide-code').closest('button');
    if (code_block.classList.contains('hide-code')) {
        code_block.classList.remove('hide-code');
        button.querySelector('#hide-code').classList.remove('hidden')
        button.querySelector('#show-code').classList.add('hidden');
        button.querySelector('.hide').classList.remove('hidden');
        button.querySelector('.show').classList.add('hidden');
    } else {
        code_block.classList.add('hide-code');
        button.querySelector('#hide-code').classList.add('hidden')
        button.querySelector('#show-code').classList.remove('hidden');
        button.querySelector('.hide').classList.add('hidden')
        button.querySelector('.show').classList.remove('hidden');
    }
};
