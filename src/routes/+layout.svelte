<script>
    import "../app.css";
    import Footer from '$lib/components/Footer.svelte';

</script>

<div class="max-w-4xl w-full mx-auto mt-0">
    <div class="mx-4 mb-10">
        <header class="h-20 mt-4">
            <a href="/" class="text-base text-navy-dark">blog.tomoyat.dev</a>
        </header>
        <hr class="border-blue border-t">
        <slot/>
        <hr class="mt-10 border-blue border-t">
        <Footer />
    </div>
</div>
