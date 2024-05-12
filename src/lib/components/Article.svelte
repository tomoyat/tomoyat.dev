<script lang="ts">
	import type {Post} from "$lib/posts";

	export let post: Post;
</script>

<article class="mt-12">
	<h1 class="font-medium text-2xl text-navy-dark text-center">{ post.title }</h1>
	<p class="text-sm text-navy-light mt-2 text-right">{post.publishedAtString}</p>
	<div class="prose mt-12 tracking-wider text-justify max-w-none prose-h1:text-2xl
			prose-h2:text-xl prose-h2:underline prose-h2:decoration-blue prose-h3:text-lg
      prose-p:text-base prose-p:font-light prose-a:text-base prose-li:text-base prose-li:font-light">
		<svelte:component this={post.component}/>
	</div>
</article>
