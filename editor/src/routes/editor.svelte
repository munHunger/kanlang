<script lang="ts">
  export let code: string = "";
  export let language: string = "javascript";

  export let listen: boolean = false;
</script>

<textarea bind:value={code} />

<style>
  textarea {
    width: 100%;
    height: 100vh;
    border: none;
    background: none;
    font-family: monospace;
    font-size: 1.2em;
    outline: none;
    padding: 0em;
  }
</style>
