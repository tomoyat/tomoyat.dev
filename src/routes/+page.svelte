<script lang="ts">
  import type { Post } from "$lib/posts";
  import ArticleListBlock from "$lib/components/ArticleListBlock.svelte";

  let { data } = $props();
  let posts: Post[] = $state(data.posts);
  posts = posts.filter((p) => p.type == "tech");
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
</script>

<div class="pt-4">
  {#each posts as post}
    <ArticleListBlock linkUrl="/posts/{post.slug}" post={post} />
  {/each}
</div>
