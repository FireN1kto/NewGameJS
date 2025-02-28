let name = '';
let game = {};
let panel = 'start';
let targetFruit = null;
// функция-сокращение для document.querySelector
let $ = function(domElement) { return document.querySelector(domElement); };

// обработчик кликов для навигации между страницами (start, game, end)
let nav = () => {
    document.onclick = (event ) => {
        event.preventDefault();
        switch (event.target.id) {
            case "startGame":
                go('game', 'd-block');
                break;
            case "restart":
                go('game', 'd-block');
                for (let child of $('.elements').querySelectorAll('.element')) {
                    child.remove();
                }
                // Показываем блок для катаны
                document.getElementById('katanaArea').classList.remove('hidden');
                // Скрываем меч у игрока
                if (game.player) {
                    game.player.isActivated = false;
                    game.player.katanaELement.style.display = "none";
                }
                break;

        }
    }
}

// функция для переключения между страницами
let go = (page, attribute) => {
    let pages = ['start', 'game', 'end'];
    panel = page;
    $(`#${page}`).setAttribute('class', attribute);
    pages.forEach(el => {
        if(page !== el) $(`#${el}`).setAttribute('class', 'd-none')
    })
}

// цикл проверки имени игрока
let startLoop = () => {
    let inter = setInterval( () => {
        checkName();
        if (panel !== 'start') clearInterval(inter);
    }, 100)
}

// проверяет локальное хранилище для имени игрока
let checkStorage = () => {
        $('#nameInput').value = localStorage.getItem('userName') || '';
}

// проверяет введенное имя и обновляет состояние кнопки "Начать игру"
let checkName = () => {
    name = $( `#nameInput`).value.trim();
    if(name !== '') {
        localStorage.setItem('userName', name);
        $('#startGame').removeAttribute('disabled');
    }
    else {
        $('#startGame').setAttribute('disabled', 'disabled');
    }
}

let setTargetFruit = () => {
    const fruits = ['Apple', 'Banana', 'Orange'];
    const randomIndex = random(0, fruits.length - 1);
    targetFruit = fruits[randomIndex];

    const fruitImages = {
        Apple: 'assets/img/apple.png',
        Banana: 'assets/img/banana.png',
        Orange: 'assets/img/orange.png',
    };
    $('#targetFruitImage').src = fruitImages[targetFruit];
}

//инициализация при загрузке страницы
window.onload = () => {
    checkStorage();
    nav();
    startLoop();
    setInterval( () => {
        if(panel === "game") {
            game = new Game();
            setTargetFruit();
            game.start();
            panel = 'game process';
        }
    }, 500)
}

// генерирует случайное число в диапазоне
let random = (min,max) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}