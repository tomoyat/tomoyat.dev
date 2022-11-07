<script lang="ts">
    import type {Post} from '$lib/posts'

    export let data;
    const posts: Post[] = data.posts;
    posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
</script>

{#each posts as post}
    <a href="/posts/{post.slug}">{post.title}</a>
{/each}