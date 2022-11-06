<script lang="ts">
    export let data;
</script>

<article class="prose">
    <h1>{ data.title }</h1>
    <p>Published: {data.date}</p>
    <svelte:component this={data.content} />
</article>