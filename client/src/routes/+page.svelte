<script>
  fetch('http://localhost:22222/api/ongoing').then(response => {
    console.log(response)
  })

  const tiles = new Array(8).fill(new Array(8).fill(0));
</script>

<div class="background">
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
  <div id="board">
    {#each tiles as row, pindex}
      <div class="row">
      {#each row as tile, index}
        <div class={(pindex + index) % 2 == 0 ? "red" : "black"}>{tile}</div>
      {/each}
      </div>
    {/each}
  </div>
</div>

<style>
	:global(body) {
		background-color: rgb(100, 100, 100);
	}

  .red {
    background-color: red;
  }

  .black {
    background-color: black;
  }

  .red, .black {
    display: inline;
    width: 50px;
    height: 50px;
  }
</style>
