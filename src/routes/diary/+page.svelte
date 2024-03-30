<script lang="ts">
  import type { Post } from "$lib/posts";
  import ArticleListBlock from "$lib/components/ArticleListBlock.svelte";

  export let data;
  let posts: Post[] = data.posts;
  posts = posts.filter((p) => p.type == "diary");
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
</script>

<div class="pt-4">
  {#each posts as post}
    <ArticleListBlock linkUrl="/diary/{post.slug}" post={post} />
  {/each}
</div>
