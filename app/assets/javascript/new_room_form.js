document.addEventListener("turbo:load", () => {
    const create_b = document.getElementById("create-room-button")
    const join_b = document.getElementById("join-room-button")
    const create_form = document.getElementById("create-room-form")
    const join_form = document.getElementById("join-room-form")
    
    create_b.addEventListener('click', () =>{ 
        create_form.style = ''
        join_form.style = 'display: none;'
    })
    join_b.addEventListener('click', () => { 
        create_form.style = 'display: none;'
        join_form.style = ''
    })
})
