<script lang="ts">
	import type { Machine } from '../../lib/types';
	import VMCard from './VMCard.svelte';

	let { machine }: { machine: Machine } = $props();
	let isExpanded = $state(false);

	function getSpeedColor(speed: number): string {
		if (speed >= 10) return 'var(--color-connection-10g)';
		if (speed >= 2.5) return 'var(--color-connection-2.5g)';
		return 'var(--color-connection-1g)';
	}
</script>

<div class="machine-card">
	<div class="card-header">
		<div class="header-content">
			<div class="icon-container">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
					<line x1="8" y1="21" x2="16" y2="21"></line>
					<line x1="12" y1="17" x2="12" y2="21"></line>
				</svg>
			</div>
			<div class="title-group">
				<h2 class="machine-name">{machine.machineName}</h2>
				<span class="role-badge">{machine.role}</span>
			</div>
		</div>
	</div>

	<div class="card-body">
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">IP Address</span>
				<span class="info-value">{machine.ipAddress}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Operating System</span>
				<span class="info-value">{machine.operatingSystem}</span>
			</div>
			{#if machine.hardware}
				<div class="info-item">
					<span class="info-label">CPU</span>
					<span class="info-value">{machine.hardware.cpu}</span>
				</div>
				<div class="info-item">
					<span class="info-label">RAM</span>
					<span class="info-value">{machine.hardware.ram}</span>
				</div>
			{/if}
		</div>

		{#if machine.ports && machine.ports.length}
			<div class="ports-section">
				<h4 class="section-title">Network Ports</h4>
				<div class="ports-container">
					{#each machine.ports as port}
						<div class="port-item" data-port-key="{machine.machineName}-{port.portName}">
							<div class="port-header">
								<div class="port-indicator" style="background-color: {getSpeedColor(port.speedGbps ?? 1)}"></div>
								<span class="port-name">{port.portName}</span>
								<span class="port-speed">{port.speedGbps ?? 1}GbE</span>
							</div>
							{#if port.connectedTo}
								<div class="port-connection">
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
										<path d="M6 1 L6 11 M6 11 L3 8 M6 11 L9 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
									</svg>
									<span>{port.connectedTo}</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if machine.software?.vms?.length}
			<div class="vms-section">
				<button class="expand-button" onclick={() => (isExpanded = !isExpanded)}>
					<svg class="expand-icon" class:expanded={isExpanded} width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M4 6 L8 10 L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Virtual Machines</span>
					<span class="vm-count">{machine.software.vms.length}</span>
				</button>
				{#if isExpanded}
					<div class="vm-list">
						{#each machine.software.vms as vm}
							<VMCard {vm} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.machine-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
		max-width: 380px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: var(--shadow-md);
		animation: fadeIn 0.5s ease-out;
		position: relative;
	}

	.machine-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-purple));
	}

	.machine-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		border-color: var(--color-border-medium);
	}

	.card-header {
		padding: 1.25rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
		color: white;
		flex-shrink: 0;
	}

	.title-group {
		flex: 1;
		min-width: 0;
	}

	.machine-name {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--color-text-primary);
		letter-spacing: -0.01em;
	}

	.role-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-accent-blue-light);
		background: rgba(59, 130, 246, 0.15);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 9999px;
		letter-spacing: 0.025em;
		text-transform: uppercase;
	}

	.card-body {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.info-grid {
		display: grid;
		gap: 0.875rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.ports-section,
	.vms-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ports-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.port-item {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 0.75rem;
		transition: all 0.2s ease;
	}

	.port-item:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-medium);
	}

	.port-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.port-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		box-shadow: 0 0 8px currentColor;
	}

	.port-name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.port-speed {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
		padding: 0.125rem 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-sm);
	}

	.port-connection {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border-subtle);
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.expand-button {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.expand-button:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-medium);
	}

	.expand-icon {
		transition: transform 0.2s ease;
		color: var(--color-text-secondary);
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.vm-count {
		margin-left: auto;
		padding: 0.125rem 0.5rem;
		background: var(--color-accent-blue);
		color: white;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.vm-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		animation: slideIn 0.3s ease-out;
	}
</style>
