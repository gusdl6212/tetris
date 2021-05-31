function main() {
    rebuild();
    window.addEventListener('resize', rebuild);
}
function reset() {
    matrixMainBoard = initMatrix(ROWS_MAIN_BOARD, COLS_MAIN_BOARD);
    resetScoreBoard();
    time = 0;
    timeForRemovingLines = 0;
    mainBlock = null;
    nextBlock = null;
    bgmElem.pause();
    bgmElem.currentTime = 0;
}

function start() {
    reset();
    gameStatus = 'A';
    window.addEventListener('keydown', keyHandler);
    setNextBlock();
    repeatMotion(0);
}
function reset() {
    matrixMainBoard = initMatrix(ROWS_MAIN_BOARD, COLS_MAIN_BOARD);
    time = 0;
    timeForRemovingLines = 0;
    mainBlock = null;
    nextBlock = null;
}

function quit() {
    window.cancelAnimationFrame(requestAnimationId);
    requestAnimationId = null;
    window.removeEventListener('keydown', keyHandler);
   
    ctxMainBoard.fillStyle = '#f0b71b';
    ctxMainBoard.fillRect(1, 3, 8, 1.8);
    ctxMainBoard.font = '1px NeoDungGeunMo';
    ctxMainBoard.fillStyle = '#ffffff';
    
    let highScore = Number(highScoreElem.textContent);
    if(totalScore > highScore) {
        localStorage.setItem('high-score', totalScore);
        highScoreElem.textContent = totalScore;
        ctxMainBoard.fillText('기록 갱신', 2.8, 4.2);
    } else {
        ctxMainBoard.fillText('게임 오버', 2.8, 4.2);
    }
    gameStatus = 'Q';
}

function pause() {
    if(requestAnimationId) {
        window.cancelAnimationFrame(requestAnimationId);
        requestAnimationId = null;
        gameStatus = 'P';
        
        ctxMainBoard.fillStyle = '#6f9cf0';
        ctxMainBoard.fillRect(1, 3, 8, 1.8);
        ctxMainBoard.font = '1px NeoDungGeunMo';
        ctxMainBoard.fillStyle = '#ffffff';
        ctxMainBoard.fillText('일시 정지', 2.8, 4.2);
    
    } else {
        gameStatus = 'A';
        repeatMotion(0);
    }
}
function nextStep() {
    stack(mainBlock, matrixMainBoard);
    filledLines = checkFilledLines(matrixMainBoard);

    if(filledLines.length === 0) {
        playSound('drop');
        addScore(globalAddScore);
        globalAddScore = 0;
        comboCount = 0;
        matrixMainBoard.board[0].some((value, x) => {
            if(value > 0) {
                gameStatus = 'Q';
                return true;
            }
        });

        const cloneNextBlock = clone(nextBlock);
        cloneNextBlock.y = 0;
        cloneNextBlock.x = 3;
        if(validate(cloneNextBlock, matrixMainBoard)) {
            setNextBlock();
        } else {
            gameStatus = 'Q';
        }
    }
}
function repeatMotion(timeStamp) {
    if(time === 0) {
        time = timeStamp;
    }

    if(timeStamp - time > 2000/currentLevel) {
        if(!validMove(mainBlock, matrixMainBoard, 0, 1)) {
            nextStep();
        }
        time = timeStamp;
    }

    if(filledLines.length > 0) {
        if(timeForRemovingLines === 0) {
            timeForRemovingLines = timeStamp;
        }

        if(timeStamp - timeForRemovingLines > 100) {
            playSound('remove');
            removeLines(matrixMainBoard, filledLines);
            comboCount++;
            globalAddScore += 100*filledLines.length*currentLevel*comboCount;
            addScore(globalAddScore);
            globalAddScore = 0;
            addLines(filledLines.length*-1);

            while(remaningLines <= 0) {
                addLevel(1);
                addLines(3*currentLevel);
            }

            initRemoveLines();
            setNextBlock();
        }
    }

    if(currentLevel >= levelToStartForMakingOneLine) {
        if(timeForMakingOneLine === 0) {
            timeForMakingOneLine = timeStamp;
        }

        if(timeStamp - timeForMakingOneLine > 10000/(currentLevel-levelToStartForMakingOneLine+1)*2) {
            makeOneLine();
            timeForMakingOneLine = timeStamp;
        }
    }

    rebuild();

    if(gameStatus === 'A') {
        requestAnimationId = window.requestAnimationFrame(repeatMotion);
    } else {
        quit();
    }
}

const startButton = document.querySelector('#start-button');
const quitButton = document.querySelector('#quit-button');
const pauseButton = document.querySelector('#pause-button');