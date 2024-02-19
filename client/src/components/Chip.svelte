<script lang="ts">
  export let colour: string = 'black';
</script>

<div style="--colour:{colour};" class="chip">
</div>

<style>
  .chip {
    top: 5px;
    left: 5px;
    position: relative;
    background-color: var(--colour);
    border-radius: 50%;
    display: inline-block;
    height: 90%;
    width: 90%;
  }
</style>
