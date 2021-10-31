window.onload = function () {


    const game = {
        fields: "",
        startMinutes: Date.now(),
        timer_id: "",
        init: function () {

            this.timer_id = setInterval(this.minutesCounter, 1000, this.startMinutes);
            this.drawBoard();
            this.fields = document.querySelectorAll('.game-field .row .field');
            this.setFlagCounter();
            this.initClicks();
        },
        drawBoard: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const rows = parseInt(urlParams.get('rows'));
            const cols = parseInt(urlParams.get('cols'));
            const mineCount = parseInt(urlParams.get('mines'));
            const minePlaces = this.getRandomMineIndexes(mineCount, cols, rows);

            let gameField = document.querySelector(".game-field");
            this.setGameFieldSize(gameField, rows, cols);
            let cellIndex = 0
            for (let row = 0; row < rows; row++) {
                const rowElement = this.addRow(gameField);
                for (let col = 0; col < cols; col++) {
                    this.addCell(rowElement, row, col, minePlaces.has(cellIndex));
                    cellIndex++;
                }
            }
        },
        getRandomMineIndexes: function (mineCount, cols, rows) {
            const cellCount = cols * rows;
            let mines = new Set();
            do {
                mines.add(Math.round(Math.random() * (cellCount - 1)));
            } while (mines.size < mineCount && mines.size < cellCount);
            return mines;
        },
        setGameFieldSize: function (gameField, rows, cols) {
            gameField.style.width = (gameField.dataset.cellWidth * rows) + 'px';
            gameField.style.height = (gameField.dataset.cellHeight * cols) + 'px';
        },
        addRow: function (gameField) {
            gameField.insertAdjacentHTML(
                'beforeend',
                '<div class="row"></div>'
            );
            return gameField.lastElementChild;
        },
        addCell: function (rowElement, row, col, isMine) {
            rowElement.insertAdjacentHTML(
                'beforeend',
                `<div class="field${isMine ? ' mine' : ''}"
                        data-row="${row}"
                        data-col="${col}"></div>`);
        },

        minutesCounter: function () {
            let gameTime = document.getElementById('elapsed-time-counter');
            let newMinutes = Math.floor((Date.now() - game.startMinutes) / 1000);
            let calcMinute = Math.floor(newMinutes/60);
            let calcSec = Math.floor(newMinutes%60);
            gameTime.value = (calcMinute < 10 ? "0" + calcMinute : calcMinute) + ":" + (calcSec < 10 ? "0" + calcSec : calcSec)  ;
        },
        rightClickHandler: function (event) {
            event.preventDefault();
            game.flagController(event);
        },

        writeMineCount: function (target, numberOfMines) {
            target.innerText = numberOfMines;
            let targetCell = target;
            game.numberStyling(targetCell, numberOfMines);
        },
        handleFieldOpening: function (target) {
            target.classList.add('opened');
            let currentRow = parseInt(target.dataset.row);
            let currentCol = parseInt(target.dataset.col);
            let numberOfMines = game.countMines(game.fields, currentRow, currentCol);
            if (numberOfMines !== 0) {
                game.writeMineCount(target, numberOfMines);
            }
            if (numberOfMines === 0) {
                game.autoFieldOpening(game.fields, currentRow, currentCol);
            }
            if (game.checkWin()) {
                game.handleWinCase();
                }
        },
        handleMineOpening: function (event) {
            event.currentTarget.classList.add('mined');
            clearInterval(game.timer_id);
            alert("Game over!")
            for (let field of game.fields) {
                if (field.className === 'field mine') {
                    field.classList.add('mined');
                }
                field.removeEventListener('click', game.leftClickHandler);
                field.removeEventListener('contextmenu', game.rightClickHandler);
            }
        },
        leftClickHandler: function (event) {  //needs to be stored in a variable, as it is not allowed to remove listeners for anonymus functions
            let target = event.currentTarget;
            if (target.className === 'field') {
                game.handleFieldOpening(target);
            }
            if (target.className === 'field mine') {
                game.handleMineOpening(event);
            }
        },
        numberStyling: function (targetCell, numberOfMines) {
            targetCell.classList.add("bolding");
            switch (numberOfMines) {
                case 1: targetCell.style.color = "blue";
                    break
                case 2: targetCell.style.color = "green";
                    break
                case 3: targetCell.style.color = "red";
                    break
                case 4: targetCell.style.color = "darkblue";
                    break
                case 5: targetCell.style.color = "brown";
                    break
                case 6: targetCell.style.color = "coral";
                    break
                case 7: targetCell.style.color = "black";
                    break
                case 8: targetCell.style.color = "black";
                    break
            }
        },
        initClicks: function () {
            for (let field of game.fields) {
                field.addEventListener('click', game.leftClickHandler);
                field.addEventListener('contextmenu', game.rightClickHandler);
            }
        },
        autoFieldOpeningSubControl: function (field, fields) {
            field.classList.add('opened');
            let mines = game.countMines(fields, parseInt(field.dataset.row), parseInt(field.dataset.col));
            if (mines !== 0) {
                field.innerText = mines;
                game.numberStyling(numberToStyle = field, numberOfMines = mines);
            }
            if (mines === 0) {
                game.autoFieldOpening(document.querySelectorAll('.game-field .row .field'), parseInt(field.dataset.row), parseInt(field.dataset.col));
            }
        },
        autoFieldOpening: function (fields, currentRow, currentCol) {
            let checkLeft = currentCol - 1;
            let checkRight = currentCol + 1;
            let checkTop = currentRow - 1;
            let checkBottom = currentRow + 1;
            for (let field of fields) {
                let fieldRow = parseInt(field.dataset.row);
                let fieldCol = parseInt(field.dataset.col);

                if (field.className === 'field') {
                    if ((fieldRow === checkTop && (fieldCol === checkLeft || fieldCol === currentCol || fieldCol === checkRight)) ||
                        (fieldRow === currentRow && (fieldCol === checkLeft || fieldCol === checkRight)) ||
                        (fieldRow === checkBottom && (fieldCol === checkLeft || fieldCol === currentCol || fieldCol === checkRight))) {
                        game.autoFieldOpeningSubControl(field, fields);
                    }
                }
            }
        },
        countMines: function (fields, currentRow, currentCol) {
            let checkLeft = currentCol - 1;
            let checkRight = currentCol + 1;
            let checkTop = currentRow - 1;
            let checkBottom = currentRow + 1;
            let countMines = 0;
            for (let field of fields) {
                let fieldRow = parseInt(field.dataset.row);
                let fieldCol = parseInt(field.dataset.col);

                if (field.className === 'field mine' || field.className === 'field mine flagged') {
                    if ((fieldRow === checkTop && (fieldCol === checkLeft || fieldCol === currentCol || fieldCol === checkRight)) ||
                        (fieldRow === currentRow && (fieldCol === checkLeft || fieldCol === checkRight)) ||
                        (fieldRow === checkBottom && (fieldCol === checkLeft || fieldCol === currentCol || fieldCol === checkRight))) {
                        countMines += 1;
                    }
                }
            }
            return countMines;
        },
        setFlagCounter: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const flagCount = parseInt(urlParams.get('mines'));
            let flagsLeftCounter = document.getElementById('flags-left-counter');
            flagsLeftCounter.value = flagCount;
        },
        flagController: function (event) {  // and "flagged" class toggles on the clicked element // (styles of "flagged" class are defined in style.css)
            let flagsLeftCounter = document.getElementById('flags-left-counter');
            let flagsCountActual = parseInt(flagsLeftCounter.value);
            let newFlagsCount;
            if ((event.currentTarget.className === 'field' || event.currentTarget.className === 'field mine') && flagsCountActual === 0) {
                alert("You ran out of flags!");
            } else {
                if (event.currentTarget.className === 'field flagged' || event.currentTarget.className === 'field mine flagged') {
                    newFlagsCount = flagsCountActual + 1;
                }
                if (event.currentTarget.className === 'field' || event.currentTarget.className === 'field mine') {
                    newFlagsCount = flagsCountActual - 1;
                }
                flagsLeftCounter.value = newFlagsCount;
                event.currentTarget.classList.toggle('flagged');
            }
        },
        checkWin: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const rowCount = parseInt(urlParams.get('rows'));
            const colCount = parseInt(urlParams.get('cols'));
            const mineCount = parseInt(urlParams.get('mines'));
            let fieldCount = rowCount * colCount;
            let mineFlagged = 0;
            let countOpenedFields = 0;
            for (let field of game.fields) {
                if (field.className === 'field mine flagged') {
                    mineFlagged += 1;
                }
                if ((field.className === 'field opened') || (field.className === 'field opened bolding')) {
                    countOpenedFields += 1;
                }
            }
            return (mineFlagged === mineCount && countOpenedFields === (fieldCount - mineCount));
        },
        handleWinCase: function () {
            clearInterval(game.timer_id);
            alert("You won!")
            for (let field of game.fields) {
                field.removeEventListener('click', game.leftClickHandler);
                field.removeEventListener('contextmenu', game.rightClickHandler);
            }
        }
    };

    game.init();

}