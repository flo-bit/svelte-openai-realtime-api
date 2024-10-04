<script lang="ts">
	// toggle between options

	export let options = ['1', '2', '3'];

	export let selected = options[0];
</script>

<span class="isolate inline-flex rounded-md shadow-sm">
	{#each options as option, index}
		<button
			on:click={() => (selected = option)}
			type="button"
			class="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-neutral-50 ring-1 ring-inset focus:z-10 {index ==
			0
				? 'rounded-l-full'
				: index == options.length - 1
					? 'rounded-r-full -ml-px'
					: '-ml-px'} {selected == option
				? 'bg-amber-500/20 text-amber-200 ring-amber-500/20'
				: 'bg-white/5 hover:bg-white/10 ring-white/15 '}
                    ">{option}</button
		>
	{/each}
</span>
