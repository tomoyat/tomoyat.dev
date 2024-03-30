<script lang="ts">
  import type { Post } from "$lib/posts";

  export let linkUrl: string;
  export let post: Post;
</script>

<div class="mt-8 border-l-2 border-blue px-4 py-2">
  <a href="{linkUrl}">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
    <h2 class="text-xl text-navy-dark">{post.title}</h2>
    <div class="mt-1 text-sm text-navy-light">{post.publishedAtString}</div>
  </div>
  {#if post.description}
    <p class="mt-4 text-sm text-navy-light">
      {post.description}
    </p>
  {/if}
  </a>
</div>
