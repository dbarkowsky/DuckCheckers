<script lang="ts">
  	export let colour: 'red' | 'black' = 'black';
    export let name: string | undefined;
    export let chipCount: number = 0;

    const black = '#262626';
    const red = '#eb1e1e';

    $: chipColour = colour === 'black' ? black : red;
    $: smallChipColour = colour === 'black' ? red : black;
</script>

<div class="playerCount">
  <div style="--colour:{chipColour};" class="chip" />
  <div>
    <p>{name ?? 'Waiting for Player'}</p>
    <div class="count-box">
      {#each {length: chipCount} as _}
        <div style="--smallChipColour:{smallChipColour}" class="chip small-chip" />
      {/each}
    </div>
  </div>
</div>

<style>
  .playerCount {
		height: 70px;
		width: auto;
		display: flex;
    align-items: center;
	}

  .chip {
		position: relative;
		background-color: var(--colour);
		border-radius: 50%;
		height: 50px;
		width: 50px;
    margin-right: 1em;
    border: solid 1px white;
	}
  .small-chip {
      height: 10px;
      width: 10px;
      margin-right: 1px;
      background-color: var(--smallChipColour);
    }
  
  .count-box {
    display: flex;
    justify-content: start;
  }
</style>
