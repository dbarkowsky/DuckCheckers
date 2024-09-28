<script lang="ts">
	import StaticBoard from "./StaticBoard.svelte";
  import { goto } from "$app/navigation";
	import { type IGame } from "../../stores/gameStore";

  export let game: IGame;

  const handleObserveClick = () =>{
    goto(`/game/${game._id}`)
  }
</script>

<div class="game-card">
  <StaticBoard game={game}/>
  <button on:click={handleObserveClick}>Observe</button>
</div>

<style>
  .game-card {
    display: block;
    width: 225px;
    border: white solid 2px;
    border-radius: 5%;
    padding: 1em;
    margin: 0.5em;
  }
</style>
