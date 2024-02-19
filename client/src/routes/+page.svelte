<script lang="ts">
	import { onMount } from 'svelte';
	import Chip from '../components/Chip.svelte';
	import Board from '../components/Board.svelte';

  let fieldValue = '';
  let socket: WebSocket;

	onMount(() => {
		// fetch('http://localhost:22222/api/ongoing').then((response) => {
		// 	console.log(response);
		// });
    socket = new WebSocket("ws://localhost:22222/123");
    socket.addEventListener("open", () => {
      console.log("Connected")
    })
    socket.addEventListener('message', (e) => {
      console.log(`Received: ${e.data.toString()}`);
    })
	});

  const sendMessage = (e: Event) => {
    socket.send(fieldValue);
  }

</script>

<div class="background">
  <input type="text" bind:value={fieldValue} />
  <button on:click={sendMessage}>Send</button>
	<Board />
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	
</style>
