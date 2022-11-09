<script lang="ts">
    import type {Post} from '$lib/posts'

    export let data;
    const posts: Post[] = data.posts;
    posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
</script>

<div class="mt-4">
    {#each posts as post, i}
        {#if i < 1}
            <div class="mt-12">
                <a href="/posts/{post.slug}"><h2 class="text-xl text-navy-dark">{post.title}</h2></a>
                <div class="mt-1 text-sm text-navy-light">{post.publishedAtString}</div>
            </div>
        {:else}
            <div class="mt-8">
                <a href="/posts/{post.slug}"><h2 class="text-xl text-navy-dark">{post.title}</h2></a>
                <div class="mt-1 text-sm text-navy-light">{post.publishedAtString}</div>
            </div>
        {/if}
    {/each}
</div>
