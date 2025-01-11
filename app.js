/*Třída pro jednotlivé slidy*/
class Slide {
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}

/*Třída pro samotnou prezentaci*/
class Presentation {
    constructor(slides, footer) {
        this.slidesArr = slides;
        this.footer = footer;
        this.numberOfSlides = 0;
    }
}

/*Třída sloužící k ovládání textarea - vstup pro text ve slidu*/
class TextAreaHandler {
    constructor() {
        this.lastKeyPressedQueue = [];
        this.numberOfLines = 1;
    }
}

var app = new Vue({
        el: '#app',
        /*Data, která používám ve Vue*/
        data: {
            chooseSlideActive: true, /*K přepínání mezi editovat konkrétní slide a vybrat ze slidů*/
            currentSlide: 0,
            editedSlide: 0, /*Nutné countery*/
            slidesCounter: 1, /*začíná na 1 protože 1. slide je vytvořen automaticky*/
            pre: new Presentation([new Slide('title', '•put text here')], 'footer'),
            textAreaHandler: new TextAreaHandler(),
            modalVisible: false,
            classObject: {
                /*Struktura od Vue k ovládání tříd*/
                blue: false,
                simple: true,
                'for-kids': false,
                activePart: false,
            }
        },
        methods: {
            /*Metoda která spouští prezentaci*/
            showOn: function () {
                this.showOnStart();
                this.classObject.activePart = true;
                /*Hloupá část na vytvoření co nejhorší prezentace pro děti*/
                if (this.classObject["for-kids"] === true) {
                    var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
                    var i = 1;
                    window.setInterval(function () {
                        document.querySelector('.for-kids').style.backgroundColor = colors[i];
                        i++;
                        if (i === colors.length) {
                            i = 0;
                        }
                    }, 3000);
                } else {
                    document.querySelector('.show').style.backgroundColor = 'white';
                }
                this.drawSuccesLine();
                this.toFullScreen(document.querySelector('.show'));
            },
            /*Metoda vykreslující loading bar na jednotlivých slidech*/
            drawSuccesLine: function () {
                done = ((this.currentSlide + 1) / this.pre.slidesArr.length) * 100;
                let fullLine = document.querySelectorAll('.full-line');
                fullLine[this.currentSlide].style.width = done + '%';
            },
            /*Metoda, která posune prezentaci k dalšímu slidu - funguje jen na click a pouze pohyb vpřed. Vue má celkem problém se všemi klávesovými eventy */
            next: function (e) {
                let slides = document.querySelectorAll('#slides li');
                if (this.currentSlide + 2 > slides.length) {
                    this.classObject.activePart = false;
                    this.toFullScreen(document.querySelector('.show'));
                } else {
                    slides[this.currentSlide].classList.remove('showing');
                    this.currentSlide++;
                    slides[this.currentSlide].classList.add('showing');
                    this.drawSuccesLine();
                }
            },
            /*Metoda, která vrátí prezentaci opět na začátek, před dalším spuštěním. Vynuluje posunovač a zobrazí první slide*/
            showOnStart: function () {
                this.currentSlide = 0;
                let slides = document.querySelectorAll('#slides li');
                slides.forEach(function (item) {
                    item.classList.remove('showing');
                });
                slides[0].classList.add('showing');
            },
            /*Metoda k uložení postupu do localStorage*/
            save: function () {
                localStorage.setItem('savedSlides', JSON.stringify(this.pre));
            },
            /*Nahrání uloženého postupu z localStorage*/
            upload: function () {
                this.pre = JSON.parse(localStorage.getItem('savedSlides'));
            },
            /*Metoda zobrazující okno úpravy konkrétního slidu*/
            editSlide: function (slideNumber) {
                let slides = document.querySelectorAll('#create-slides li');
                console.log(slides.length);
                console.log(slideNumber);
                if (slideNumber >= 0 && slideNumber < slides.length) {
                    this.removeShowingTag();
                    let slides = document.querySelectorAll('#create-slides li');
                    this.chooseSlideActive = false;
                    slides[slideNumber].classList.add('showing');
                    let lines = slides[slideNumber].querySelector('textarea').value;
                    let count = lines.split("\n").length;
                    this.textAreaHandler.numberOfLines = count;
                }
            },
            /*Metoda na vymazání všech tříd showing ze zobrazovaných slidů. Slide se třídou showing se zobrazí.*/
            removeShowingTag: function () {
                let slides = document.querySelectorAll('#create-slides li');
                slides.forEach(function (item) {
                    item.classList.remove('showing');
                });
            },
            /*Přejde na výběr slidu k editaci*/
            goToChooseSlide: function () {
                this.removeShowingTag();
                this.chooseSlideActive = true;
            },
            /*Metoda k přidání odrážek na začátek nového řádku v textarea. Na enter přidá •, poté se dá posunout pomocí tab.*/
            addBullet: function (itemNumber, e) {
                let key = e.keyCode;
                let txtAreas = document.querySelectorAll('textarea');
                let text = txtAreas[itemNumber].value;
                let cursorPos = e.target.selectionStart;
                // If the user has pressed enter
                if (key === 13) {
                    if (this.textAreaHandler.numberOfLines < 8) {
                        text += "\n•";
                        this.textAreaHandler.numberOfLines++;
                        e.preventDefault();
                    } else {
                        e.preventDefault();
                    }
                } else if (key === 9) {
                    if (this.textAreaHandler.lastKeyPressedQueue[1] === 13) {
                        text = text.substring(0, text.length - 1);
                        text += "    →";
                        e.preventDefault();
                    } else if (this.textAreaHandler.lastKeyPressedQueue[0] === 13 && this.textAreaHandler.lastKeyPressedQueue[1] === 9) {
                        text = text.substring(0, text.length - 1);
                        text += "    →";
                        e.preventDefault();
                    } else {
                        e.preventDefault();
                    }
                }
                if (text.length < 2) {
                    this.textAreaHandler.numberOfLines = 1;
                }
                if (text.length === 0) {
                    text += "•";
                    this.textAreaHandler.numberOfLines = 1;
                }
                if (this.textAreaHandler.lastKeyPressedQueue.length === 2) {
                    this.textAreaHandler.lastKeyPressedQueue.shift();
                    this.textAreaHandler.lastKeyPressedQueue.push(key);
                }
                else {
                    this.textAreaHandler.lastKeyPressedQueue.push(key);
                }
                txtAreas[itemNumber].value = text;
            },
            /*pravděpodobně už nahrazená*/
            updateDataInSlide: function (item, footer) {
                let auxSlide = new Slide(item.title, item.text, item.number);
                this.pre.slidesArr[item.number] = auxSlide;
                this.pre.footer = footer;
            },
            /*Metoda pro přesunování mezi slidy, které chci upravit*/
            editNextSlide: function () {
                let slides = document.querySelectorAll('#create-slides li');
                slides[this.editedSlide].classList.remove('showing');
                this.editedSlide = (this.editedSlide + 1) % slides.length;
                slides[this.editedSlide].classList.add('showing');
            },
            /*Přidá slide*/
            addSlide: function () {
                let slide = new Slide('title', '•put text here', this.slidesCounter);
                this.slidesCounter++;
                this.pre.slidesArr.push(slide);
            },
            /*Odstraní slide*/
            deleteSlide: function (number, e) {
                console.log(this.pre.slidesArr.length);
                this.slidesCounter--;
                if (this.pre.slidesArr.length < 2) {
                    this.pre.slidesArr = [new Slide('title', '•put text here', 0)];
                    e.stopPropagation();
                } else {
                    this.pre.slidesArr.splice(number, 1);
                    e.stopPropagation();
                }
            },
            /*Změna tématu*/
            changeTheme: function (number) {
                this.classObject.blue = false;
                this.classObject.simple = false;
                this.classObject["for-kids"] = false;
                switch (number) {
                    case 0:
                        this.classObject.blue = true;
                        break;
                    case 1:
                        this.classObject.simple = true;
                        break;
                    case 2:
                        this.classObject["for-kids"] = true;
                        break;
                    default:
                        console.log('error');
                }
            },
            /*zobrazení modalového okna*/
            modalOn: function () {
                this.modalVisible = !this.modalVisible;
                if (this.modalVisible) {
                    document.body.classList.add('modal-visible');
                } else {
                    document.body.classList.remove('modal-visible');
                }
            },
            /*Fullscreen pro zobrazení prezentace*/
            toFullScreen: function (elem) {
                if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
                    if (elem.requestFullScreen) {
                        elem.requestFullScreen();
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    } else if (elem.webkitRequestFullScreen) {
                        elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    }
                } else {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            }
        }
    })
;


