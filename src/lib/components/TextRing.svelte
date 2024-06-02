<script lang="ts">

	export let text: string = 'Happy Hacking !  ';
	export let charSize: number = 1.5;

	function radius(): number {
		return charSize / (2.0 * Math.sin(Math.PI / text.length));
	}
</script>

<div>
	{#if text.length > 0}
	<span class="text-ring spin">
		{#each text as char, index}
			<span class="text-ring-ch" style="--index: {index}; --total: {text.length}; --radius: {radius()}">{char}</span>
		{/each}
	</span>
	{/if}
</div>

<style>
    .text-ring-ch {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(calc(360deg / var(--total) * var(--index))) translateY(calc(var(--radius) * -1ch))
    }
</style>
