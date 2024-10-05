<script lang="ts">
	export let tooltipText: string;
	export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="tooltip" on:click={onClick}>
	<slot />
	<span class="tooltiptext">{tooltipText}</span>
</div>

<style>
	/* Tooltip container */
	.tooltip {
		position: relative;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		border: solid 1px white;
    border-radius: 10px;
		padding: 0.5em;
    width: 9em;
		&:hover {
			cursor: pointer;
		}
	}

	/* Tooltip text */
	.tooltip .tooltiptext {
		visibility: hidden;
		width: 200px;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;

		/* Position the tooltip text */
		position: absolute;
		z-index: 1;
    top: 2em;
    left: -1em;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}
</style>
