
let deck_info = {}
let player_hand = []
let computer_hand = []

async function addDeck() {
    try {
        const response = await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
        const result = await response.json()
        console.log(result)
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
    if (numtotal >= 21) {
        const button = document.getElementById(idButton)
        console.log(`atingiu ou passou 21: ${numtotal}`)
        return
    }
    console.log(numtotal)
}

async function moreCard(idButton) {
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
        if (numtotal >= 21) {
            const button = document.getElementById(idButton)
            console.log(`atingiu ou passou 21: ${numtotal}`)
            computerPlay()
            return
        }
        console.log(numtotal)

    }
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

    //calculo da propriedade dos ÁS que pode assumir valor 1 ou 11
    for (let i = 0; i < aces; i++) {
        if ((total + 11) <= 21) {
            total += 11
        } else {
            total += 1
        }
    }
    return total
}

async function computerDraw(){
    const data = await drawCard(2)
    if (data) {
        computer_hand = data.map(card => ({
            valor: card.value,
            naipe: card.suit,
            image: card.image
        }))
        console.log(computer_hand)
    }
    //calcula o total das cartas utilizando a função calcularTotal
    let numtotal = calcularTotal(computer_hand)
    if (numtotal >= 21) {
        console.log(`atingiu ou passou 21: ${numtotal}`)
        return
    }
    console.log(numtotal)
}

async function computerPlay(){
    computerDraw()
    if(calcularTotal(computer_hand) < 17)
}