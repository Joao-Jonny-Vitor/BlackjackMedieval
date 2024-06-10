
let deck_info = {}
let player_hand = []
let computer_hand = []
let computer_blackJack
let player_blackJack
let player_life = 100;
let enemy_life = 100;

const openModal = (idModal) => {
	const modal = document.getElementById(idModal)
	modal.style.display = 'flex'
}

const closeModal = (event, id) => {
	if(id){
		const modal = document.getElementById(id)
		modal.style.display = 'none'
		return
	}

	if(event?.target?.className === "modal"){
		const modal = document.getElementById(event.target.id)
		modal.style.display = 'none'
		return
	}
}

async function addDeck() {
    try {
        const response = await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
        const result = await response.json()
        if (!response.ok) {
            throw new Error("Erro ao buscar dados")
        }
        if (result) {
            deck_info = {
                deck_id: result.deck_id,
                cartas: result.remaining
            }
            console.log(deck_info)
        }
    } catch (error) {
        alert("erro ao consultar ação: " + error.message)
    }

}

async function drawCard(quantidade) {
    try {

        if (!deck_info.deck_id) {
            throw new Error("deck_id não definido")
        }
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deck_info.deck_id}/draw/?count=${quantidade}`)
        const result = await response.json()
        return result.cards;

    } catch (error) {
        alert("erro ao puxar carta: " + error.message)
    }
}

async function gameStart() {
    //inicia o jogo chamando a API para gerar um deck de cartas
    await addDeck()
    //inicia comprando as duas cartas do jogador
    const data = await drawCard(2)
    if (data) {
        player_hand = data.map(card => ({
            valor: card.value,
            naipe: card.suit,
            image: card.image
        }))
        console.log(player_hand)
    }
    //calcula o total das cartas utilizando a função calcularTotal
    let numtotal = calcularTotal(player_hand)
    if(numtotal == 21){
        console.log("blackJack " + numtotal)
        player_blackJack = true
        computerPlay()
    }
    console.log(numtotal)
}

async function moreCard() {
    //requisita a API para comprar uma carta
    const data = await drawCard(1)
    if (data) {
        data.forEach(card => {
            player_hand.push({
                valor: card.value,
                naipe: card.suit,
                image: card.image
            });
        });
        console.log(player_hand)

        //calcula o total das cartas utilizando a função calcularTotal
        let numtotal = calcularTotal(player_hand)
        if(numtotal == 21){
            console.log("Atingiu 21")
            player_blackJack = true;
        }
        if (numtotal > 21) {
            const button = document.getElementById(idButton)
            console.log(`passou 21: ${numtotal}`)
            computerPlay()
            return
        }
        console.log(numtotal)

    }
}

function stopCard(){
    computerPlay()
}

function calcularTotal(hand) {
    let total = 0
    let aces = 0
    //calcula o valor das cartas atualmente em posse
    hand.forEach(card => {
        let num = parseInt(card.valor)

        //verifica se o valor da carta é diferente de um numero
        if (isNaN(num)) {
            if (card.valor === "ACE") {
                aces++
                return
            } else {
                num = 10
            }
        }
        total += num
    })
    //calculo dos ÁS's que pode assumir valor 1 ou 11
    for (let i = 0; i < aces; i++) {
        if ((total + 11) <= 21) {
            total += 11
        } else {
            total += 1
        }
    }

    if(hand === "player_hand"){
        document.getElementById('totalValue').textContent = total;
    }
    return total
}

async function computerInitialDraw(){
    const data = await drawCard(2);
    if (data) {
        computer_hand = data.map(card => ({
            valor: card.value,
            naipe: card.suit,
            image: card.image
        }));
    }

    const total = calcularTotal(computer_hand);
    if (total == 21) {
        console.log(`Atingiu 21: ${total}`);
        computer_blackJack = true;
    }
}

async function computerDraw(){
    const data = await drawCard(1);
    if (data) {
        data.forEach(card => {
            computer_hand.push({
                valor: card.value,
                naipe: card.suit,
                image: card.image
            });
        });
    }
}

async function computerPlay(){
    await computerInitialDraw();
    console.log("Mão do computador:", computer_hand);

    await delay(1000);

    while (calcularTotal(computer_hand) < 17) {
        await computerDraw();
        console.log("Mão do computador:", calcularTotal(computer_hand));
        await delay(500);
    }
    console.log(winner())
}

function winner(){
    let player = calcularTotal(player_hand)
    let computer = calcularTotal(computer_hand)

    if (player > 21 && computer > 21) {
        return "Nenhum jogador ganha, ambos estouraram";
    } else if (player > 21) {
        return "Computador ganha, jogador estourou";
    } else if (computer > 21) {
        return "Jogador ganha, computador estourou";
    } else if (player === computer) {
        return "Empate";
    } else if (player > computer) {
        return "Jogador ganha";
    } else {
        return "Computador ganha";
    }

}

function deleteCards(){
    deck_info = {}
    player_hand = []
}

function rolldice(dice){
    Math. floor(Math. random() * (dice - 1 + 1)) + 1
}

function decreaseLife(character, qtd) {
    if (character === 'player') {
        player_life -= qtd;
        if (player_life < 0) {
            player_life = 0;
        }
    } else if (character === 'enemy') {
        enemy_life -= qtd;
        if (enemy_life < 0) {
            enemy_life = 0;
        }
    }
    updateLifeBar(character);
}

function updateLifeBar(character) {
    let lifeBarInner;
    let currentLife;

    if (character === 'player') {
        lifeBarInner = document.getElementById('bar_user_pt');
        currentLife = player_life;
    } else if (character === 'enemy') {
        lifeBarInner = document.getElementById('bar_enemy_pt');
        currentLife = enemy_life;
    }
    console.log("iniciou updateLifebar")
    lifeBarInner.style.width = currentLife + '%';
}

// Função delay que retorna uma Promise que resolve após o tempo especificado
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}