<script lang="ts">
	import TextRing from '$lib/components/TextRing.svelte';
</script>

<footer class="mt-5">
	<div class="flex justify-end">
		<a href="/">
			<div class="ring-wrapper text-navy-dark text-sm">
				<div class="spin" style="position: absolute; top: 50%; left: 50%;">
					<TextRing text="blog.tomoyat.dev   " charSize="{1.2}" />
				</div>
			</div>
		</a>
	</div>
</footer>


<style>
    .ring-wrapper {
        width: 80px;
        height: 80px;
        position: relative;
    }
    .spin {
        animation: ring-spin 6s infinite linear;
    }
    @keyframes ring-spin {
        to {
            rotate: -360deg;
        }
    }
</style>
