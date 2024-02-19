<script lang="ts">
  export let isRed: boolean;
</script>
<div class={isRed ? 'red' : 'black'}><slot/></div>

<style>
	.red {
		background-color: rgb(255, 103, 103);
	}

	.black {
		background-color: rgb(78, 78, 78);
	}

	.red,
	.black {
		display: inline-block;
		width: 100px;
		height: 100px;
	}
</style>
