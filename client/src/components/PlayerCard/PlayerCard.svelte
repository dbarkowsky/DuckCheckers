<script lang="ts">
  	export let colour: 'red' | 'black' = 'black';
    export let name: string | undefined = 'Waiting for Player';
    export let chipCount: number = 0;

    const black = '#262626';
    const red = '#eb1e1e';

    $: chipColour = colour === 'black' ? black : red;
    $: smallChipColour = colour === 'black' ? red : black;
</script>

<div class="player-count">
  <div style="--colour:{chipColour};" class="chip" />
  <div class="name-box">
    <p class="player-name">{name}</p>
    <div class="count-box">
      {#each {length: chipCount} as _}
        <div style="--smallChipColour:{smallChipColour}" class="chip small-chip" />
      {/each}
    </div>
  </div>
</div>

<style>
  .player-count {
		height: 70px;
		width: fit-content;
		display: flex;
    align-items: center;
    border: 1px solid white;
    border-radius: 10px;
    padding: 3px 10px;
	}

  .player-name {
    font-family: "Atma", system-ui;
    font-weight: 700;
    font-size: 1rem;
    color: yellow;
  }

  .name-box{
    width: 100%;
  }

  .chip {
		position: relative;
		background-color: var(--colour);
		border-radius: 50%;
		height: 50px;
		width: 50px;
    min-width: 50px;
    margin-right: 1em;
    border: solid 1px white;
	}
  .small-chip {
      height: 10px;
      width: 10px;
      min-width: 10px;
      margin-right: 1px;
      background-color: var(--smallChipColour);
    }
  
  .count-box {
    display: flex;
    justify-content: start;
  }
</style>
