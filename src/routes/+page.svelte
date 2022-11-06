<script lang="ts">
    import type {PageData} from './$types';

    export let data: PageData
    console.log("route +page svelte")
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>---------------------</p>

<a href="/posts/{data.posts[0].slug}">linl</a>