<script lang="ts">
	import type { VMInfo } from '../../stores/networkStore';
	let { vm }: { vm: VMInfo } = $props();
</script>

<div class="vm-card">
	<div class="vm-header">
		<div class="vm-icon">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
				<line x1="8" y1="21" x2="16" y2="21"></line>
				<line x1="12" y1="17" x2="12" y2="21"></line>
			</svg>
		</div>
		<div class="vm-info">
			<span class="vm-name">{vm.name}</span>
			<span class="vm-role">{vm.role}</span>
		</div>
	</div>
	<div class="vm-footer">
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="2" y1="12" x2="22" y2="12"></line>
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
		</svg>
		<span class="vm-ip">{vm.ipAddress}</span>
	</div>
</div>

<style>
	.vm-card {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 0.875rem;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.vm-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: linear-gradient(180deg, var(--color-accent-purple), var(--color-accent-blue));
	}

	.vm-card:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-border-medium);
		transform: translateX(4px);
	}

	.vm-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.625rem;
	}

	.vm-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		background: rgba(139, 92, 246, 0.15);
		color: var(--color-accent-purple);
		flex-shrink: 0;
	}

	.vm-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.vm-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		letter-spacing: -0.01em;
	}

	.vm-role {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		font-weight: 500;
	}

	.vm-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.625rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.vm-footer svg {
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.vm-ip {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: 500;
	}
</style>
