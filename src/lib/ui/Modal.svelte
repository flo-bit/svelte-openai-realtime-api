<script lang="ts">
	import { onMount } from "svelte";


    export let apiKey = "";

    onMount(() => {
        apiKey = localStorage.getItem("tmp::voice_api_key") || "";
    });

    export let onStart: () => void;

    export let visible = true;
</script>

{#if visible}
<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-75 transition-opacity z-10" aria-hidden="true"></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full w-full items-end justify-center p-4 sm:items-center sm:p-0">
			<div
				class="relative transform w-full overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/15 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"
			>
				<div>
					<h3 class="text-lg font-semibold leading-6 text-neutral-50" id="modal-title">
						Start a realtime chat
					</h3>

					<div class="mt-4">
						<label for="api-key" class="block text-sm font-medium leading-6 text-neutral-300"
							>OpenAI API key:</label
						>
						<div class="mt-2">
							<input
								type="password"
								name="api-key"
								id="api-key"
								class="block w-full rounded-md border-0 py-1.5 text-neutral-50 shadow-sm ring-1 ring-inset ring-neutral-700 bg-white/5 placeholder:text-neutral-600 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
								placeholder="sk-..."
                                bind:value={apiKey}
							/>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-6">
					<button
                        on:click={() => {
                            if(onStart && apiKey) {
                                // save api key
                                localStorage.clear();
                                localStorage.setItem("tmp::voice_api_key", apiKey);
                                
                                onStart();
                                visible = false;
                            }
                        }}
						type="button"
						class="inline-flex w-full justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
						>Start</button
					>
				</div>
			</div>
		</div>
	</div>
</div>
{/if}