<script lang="ts">
    import type {Post} from "$lib/posts";
    import Article from '$lib/components/Article.svelte';

    export let data;
    const post: Post = data.post;
    const slug: string = data.slug;
</script>

<svelte:head>
    <title>{post.title}</title>
    <meta property="og:title" content="{post.title}"/>
    <meta property="og:type" content="article"/>
    <meta property="og:url" content="https://blog.tomoyat.dev/diary/{slug}/"/>
    {#if post.description}
        <meta property="og:description" content="{post.description}">
    {/if}
</svelte:head>

<Article post={post} />
