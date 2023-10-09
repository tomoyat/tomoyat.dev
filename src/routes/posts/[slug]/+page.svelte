<script lang="ts">
    import type {Post} from "$lib/posts";

    export let data;
    const post: Post = data.post;
    const slug: string = data.slug;
</script>

<svelte:head>
    <title>{post.title}</title>
    <meta property="og:title" content="{post.title}"/>
    <meta property="og:type" content="article"/>
    <meta property="og:url" content="https://blog.tomoyat.dev/posts/{slug}/"/>
    {#if post.description}
        <meta property="og:description" content="{post.description}">
    {/if}
</svelte:head>

<article class="mt-12">
    <h1 class="font-medium text-2xl text-navy-dark text-center">{ post.title }</h1>
    <p class="text-sm text-navy-light mt-2 text-right">{post.publishedAtString}</p>
    <div class="prose mt-12 tracking-wider text-justify max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-base prose-a:text-base prose-li:text-base">
        <svelte:component this={post.component}/>
    </div>
</article>
