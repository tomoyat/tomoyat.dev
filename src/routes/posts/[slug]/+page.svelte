<script lang="ts">
    import type {Post} from "$lib/posts";

    export let data;
    const post: Post = data.post
</script>

<article class="prose">
    <h1>{ post.title }</h1>
    <p>Published: {post.publishedAtString}</p>
    <svelte:component this={post.component} />
</article>