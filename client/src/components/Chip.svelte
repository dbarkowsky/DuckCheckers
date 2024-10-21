<script lang="ts">
	export let colour: string = 'black';
	export let rotate: boolean = false; // Rotate if player two or user is player two and chip is duck.
</script>

<div style="--colour:{colour};" class="chip {rotate ? 'rotate' : ''}">
	<slot />
</div>

<style>
	.chip {
		position: relative;
		background-color: var(--colour);
		border-radius: 50%;
    border: 1px yellow solid;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90%;
		width: 90%;
		transition: all 1s ease-in-out;
	}

	.rotate {
		rotate: 180deg;
	}
</style>
