copyCode = () => {
    navigator.clipboard.writeText(document.querySelector('#code .back').textContent)
    .then(() => {
        // добавить уведомление, что скопировано
    }, (err) => {
        // ...или ошибку
    });
};

copyLink = () => {
    navigator.clipboard.writeText(document.querySelector('#code').getAttribute('data-link'))
    .then(() => {
        // добавить уведомление, что скопировано
    }, (err) => {
        // ...или ошибку
    });
};
