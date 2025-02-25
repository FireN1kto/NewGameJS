// Абстрактный класс для всех объектов на экране
class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.offsets = {
            x: 0,
            y: 0
        }
    }

    // метод создающий элемент
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "element " + this.constructor.name.toLowerCase();
        $('.elements').append(this.element);
    }

    // метод обновляющий кооржинаты
    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }

    // метод отвечающий за отрицовку
    draw() {
        this.element.style = `
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.w}px;
            height: ${this.h}px;
        `;
    }

    // метод удаления элемента
    removeElement() {
        this.element.remove();
    }

    // Метод isCollision проверяет столкновение с другим объектом
    isCollision(element) {
        let a = {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.w,
            y2: this.y + this.h
        }

        let b = {
            x1: element.x,
            y1: element.y,
            x2: element.x + element.w,
            y2: element.y + element.h
        }
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    }
}


// базовый класс для фруктов; определяет базовое поведение фруктов(рандомная позицыя по горизонтали и падение вниз)
class Fruit extends Drawable {
    constructor(game) {
        super(game);
        this.w = 70;
        this.h = 70;
        this.y = 60;
        this.x = random(0, window.innerWidth - this.w);
        this.offsets.y = 3;
        this.createElement();
    }
    update() {
        if(this.isCollision(this.game.player)) this.takePoint();
        if(this.y > window.innerHeight)this.takeDamage();
        super.update();
    }

    // обработка столкновения с игроком
    takePoint() {
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.points++;
        }
    }

    // выход за пределы экрана
    takeDamage() {
        if(this.game.remove(this)) {
            this.removeElement();
            this.game.hp--;
        }
    }
}

// класс для бананов
class Banana extends Fruit {
    constructor(game) {
        super(game);
    }
}

// класс ддля яблок (падает со скоростью 5)
class Apple extends Fruit {
    constructor(game) {
        super(game);
        this.offsets.y = 5;
    }
}

// класс для апельсинов ( падает со скоростью 7)
class Orange extends Fruit {
    constructor(game) {
        super(game);
        this.offsets.y = 7;
    }
}

// класс для представления Игрока; определяет размеры и начальную позицыю, управление клавишами( arrowLeft, arrowRight, Space), механику использования навыка
class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = window.innerWidth / 2 - this.w / 2;
        this.y = window.innerHeight - this.h;
        this.speedPerFrame = 20;
        this.skillTimer = 0;
        this.couldTimer = 0;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        }
        this.createElement();
        this.bindKeyEvents();
    }

    bindKeyEvents() {
        document.addEventListener('keydown', ev => this.changeKeyStatus(ev.code,true));
        document.addEventListener('keyup', ev => this.changeKeyStatus(ev.code,false));
    }

    changeKeyStatus(code, value) {
        if(code in this.keys) this.keys[code] = value;
    }

    update() {
        if(this.keys.ArrowLeft && this.x > 0) {
            this.offsets.x = -this.speedPerFrame;
        } else if(this.keys.ArrowRight && this.x < window.innerWidth - this.w) {
            this.offsets.x = this.speedPerFrame;
        } else {
            this.offsets.x = 0;
        }
        if (this.keys.Space && this.couldTimer === 0) {
            this.skillTimer++;
            $('#skill').innerHTML = `осталось ${Math.ceil((240 - this.skillTimer) / 60)}`;
            this.applySkill();
        }
        if (this.skillTimer > 240 || (!this.keys.Space && this.skillTimer > 1)) {
            this.couldTimer++;
            $('#skill').innerHTML = `осталось ${Math.ceil((300 - this.couldTimer) / 60)}`;
            this.keys.Space = false;
        }
        if (this.couldTimer > 300) {
            this.couldTimer = 0;
            this.skillTimer = 0;
            $('#skill').innerHTML = 'Готово';
        }
        super.update();
    }

    // метод applySkill сдвигает фрукты относительно игрока
    applySkill() {
        for(let i = 1; i< this.game.elements.length; i++) {
            if (this.game.elements[i].x < this.x + (this.w/2)) {
                this.game.elements[i].x += 15;
            } else {
                if (this.game.elements[i].x > this.x + (this.w/2)) {
                    this.game.elements[i].x -= 15;
                }
            }
        }
    }
}

// главный класс управляющий игрой
class Game {
    constructor() {
        this.name = name;
        this.elements = [];
        this.player = this.generate(Player);
        this.counterForTimer = 0;
        this.fruits = [Apple, Banana, Orange]
        this.hp = 3;
        this.points = 0;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0
        };
        this.ended = false;
        this.pause = false;
        this.keyEvents();
    }

    // метод удаляющий элемент из списка
    remove(el) {
        let idx = this.elements.indexOf(el);
        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    // метод запускающий основной игровой цикл
    start() {
        this.loop();
    }

    // метод создающий новый элемент(фрукт или игрока)
    generate(className) {
        let element = new className(this);
        this.elements.push(element);
        return element;
    }

    // метод обрабатывающий паузу по клавише Esc
    keyEvents() {
        addEventListener('keydown', e => {
            if(e.key === "Escape") this.pause = !this.pause;
        })
        document.getElementById('stop').addEventListener('click', e => {
            this.pause = !this.pause;
        })
    }

    // метод с основным циклом обновления и отрисовки
    loop() {
        requestAnimationFrame( () => {
            if (!this.pause) {
                this.counterForTimer++;
                if(this.counterForTimer % 60 === 0) {
                    this.timer();
                    this.randomFruitGenerate();
                }
                if (this.hp <= 0) {
                    this.end();
                }
                $('.pause').style.display = 'none';
                $('#stop').style.display = 'inline-block';
                this.updateElements();
                this.setParams();
            } else if(this.pause) {
                $('.pause').style.display = 'flex'
                $('#stop').style.display = 'none'
            }
            if(!this.ended) this.loop();
        });
    }

    // метод создающий случайный фрукт
    randomFruitGenerate() {
        this.generate(this.fruits[random(0, 2)])
    }

    // метод обновляющий все элементы
    updateElements() {
        this.elements.forEach(element => {
            element.update();
            element.draw();
        })
    }

    // метод обновляющий интерфейс(очки и здоровье)
    setParams() {
        let params = ['name', 'points', 'hp'];
        let values = [this.name,this.points,this.hp];
        params.forEach((el , ind) => {
            $( `#${el}`).innerHTML = values[ind];
        })
    }

    // метод увеличивающий таймер
    timer() {
        let time = this.time;
        time.s2++;
        if(time.s2 >= 10) {
            time.s2 = 0;
            time.s1++;
        }
        if(time.s1 >= 6) {
            time.s1 = 0;
            time.m2++;
        }
        if(time.m2 >= 10) {
            time.m2 = 0;
            time.m1++;
        }
        $( '#timer').innerHTML = `${time.m1}${time.m2}:${time.s1}${time.s2}`
    }

    // метод завершающий игру и показывающий результат
    end() {
        this.ended = true;
        $('#stop').style.display = 'none';
        let time = this.time;
        if ((time.s1 >= 1 || time.m2 >= 1 || time.m1 >=1) && this.points >= 5) {
            $( '#playerName').innerHTML = `Поздравляем, ${this.name}!`;
            $( '#endTime').innerHTML = `Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`
            $( '#collectedFruits').innerHTML = `Вы собрали ${this.points} фруктов`;
            $( '#congratulation').innerHTML = `Вы выйграли!`
        } else {
            $( '#playerName').innerHTML = `Жаль, ${this.name}!`;
            $( '#endTime').innerHTML = `Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`
            $( '#collectedFruits').innerHTML = `Вы собрали ${this.points} фруктов`;
            $( '#congratulation').innerHTML = `Вы програли!`
        }
        go( 'end', 'panel d-flex justify-content-center align-items-center')
    }
}