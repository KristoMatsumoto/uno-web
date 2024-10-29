const copyText = () => {
    navigator.clipboard.writeText(document.getElementById('code').textContent)
    .then(() => {
        //
    }, (err) => {
        //
    });
};
