<script>
	import StaticBoard from "./StaticBoard.svelte";

  export let game;
</script>

<div class="game-card">
  <StaticBoard game={game}/>
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
