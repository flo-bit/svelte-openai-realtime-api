<script lang="ts">
	export let height = 'h-screen';
</script>

<div class="flex {height} flex-col">
	<div>
		<slot name="header"></slot>
	</div>
	<div class="flex-grow overflow-y-auto">
		<slot></slot>
	</div>
	<div class="flex">
		<slot name="footer"></slot>
	</div>
</div>
