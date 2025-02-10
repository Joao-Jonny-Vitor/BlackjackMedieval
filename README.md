# Projeto Medieval Blackjack

Desenvolvido para a disciplina de Desenvolvimento Web I, ministrada pelo professor Renan Cavichi.  

**Tecnologias Utilizadas:** HTML, CSS, JavaScript  
**API Utilizada:** [Deck of Cards API](https://deckofcardsapi.com)  

Este projeto é uma versão temática medieval do clássico jogo de cartas Blackjack, também conhecido como 21.  

## 🎯 **Objetivo**  
Alcançar o valor mais próximo de 21 sem ultrapassar, reduzindo a vida do inimigo a zero.  

## 📜 **Regras Básicas**  
- Cartas de 2 a 10 têm seus respectivos valores;  
- J, Q e K valem 10 pontos;  
- Ás pode valer 1 ou 11 pontos;  
- O jogador e o dealer começam com duas cartas.  

## ⚔️ **Mecânica de Dano**  
Antes de cada rodada, escolha um dado: d4, d6, d10 ou d12.  
O valor do dado escolhido determinará o dano causado ao dealer (ou recebido pelo jogador, dependendo do resultado).  

## 🎮 **Ações do Jogador**  
- **Hit (Pedir Carta):** Adiciona uma carta à mão.  
- **Stand (Parar):** Mantém as cartas atuais.  

## 🏆 **Resultado do Jogo**  
- **Vitória:** O jogador causa o dano escolhido ao dealer.  
- **Derrota:** O jogador recebe o dano escolhido.  
- **Empate (Push):** Nenhum dano é aplicado.  
