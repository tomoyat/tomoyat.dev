<script lang="ts">
  import type { Post } from "$lib/posts";

  export let data;
  let posts: Post[] = data.posts;
  posts = posts.filter((p) => p.type == "diary");
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
</script>

<div class="pt-4">
  {#each posts as post}
    <div class="mt-8">
      <a href="/diary/{post.slug}"><h2 class="text-xl text-navy-dark">{post.title}</h2></a>
      <div class="mt-1 text-sm text-navy-light">{post.publishedAtString}</div>
    </div>
  {/each}
</div>
