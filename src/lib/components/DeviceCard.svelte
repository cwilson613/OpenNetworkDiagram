<script lang="ts">
	import type { NetworkDevice } from '../../lib/types';
	let { device }: { device: NetworkDevice } = $props();

	function getSpeedColor(speed: number): string {
		if (speed >= 10) return 'var(--color-connection-10g)';
		if (speed >= 2.5) return 'var(--color-connection-2.5g)';
		return 'var(--color-connection-1g)';
	}

	function getDeviceIcon(type: string): string {
		const lowerType = type.toLowerCase();
		if (lowerType.includes('router')) return 'router';
		if (lowerType.includes('switch')) return 'switch';
		if (lowerType.includes('firewall')) return 'firewall';
		if (lowerType.includes('access point') || lowerType.includes('ap')) return 'wifi';
		return 'network';
	}

	const iconType = getDeviceIcon(device.type);
</script>

<div class="device-card">
	<div class="card-header">
		<div class="header-content">
			<div class="icon-container {iconType}">
				{#if iconType === 'router'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="8" width="20" height="8" rx="2" ry="2"></rect>
						<line x1="6" y1="1" x2="6" y2="4"></line>
						<line x1="10" y1="1" x2="10" y2="4"></line>
						<line x1="14" y1="1" x2="14" y2="4"></line>
						<line x1="18" y1="1" x2="18" y2="4"></line>
						<line x1="9" y1="21" x2="9" y2="16"></line>
						<line x1="15" y1="21" x2="15" y2="16"></line>
					</svg>
				{:else if iconType === 'switch'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
						<circle cx="6" cy="12" r="1"></circle>
						<circle cx="10" cy="12" r="1"></circle>
						<circle cx="14" cy="12" r="1"></circle>
						<circle cx="18" cy="12" r="1"></circle>
					</svg>
				{:else if iconType === 'wifi'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
						<path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
						<path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
						<line x1="12" y1="20" x2="12.01" y2="20"></line>
					</svg>
				{:else if iconType === 'firewall'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="2" y1="12" x2="22" y2="12"></line>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
					</svg>
				{/if}
			</div>
			<div class="title-group">
				<h3 class="device-name">{device.name}</h3>
				<span class="type-badge">{device.type}</span>
			</div>
		</div>
	</div>

	<div class="card-body">
		<div class="info-item">
			<span class="info-label">IP Address</span>
			<span class="info-value">{device.ipAddress}</span>
		</div>

		{#if device.notes}
			<div class="notes-section">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
				<span>{device.notes}</span>
			</div>
		{/if}

		{#if device.ports && device.ports.length}
			<div class="ports-section">
				<h4 class="section-title">Network Ports</h4>
				<div class="ports-container">
					{#each device.ports as port}
						<div class="port-item" data-port-key={device.name + '-' + port.portName}>
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
	</div>
</div>

<style>
	.device-card {
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

	.device-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--color-accent-orange), var(--color-accent-green));
	}

	.device-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		border-color: var(--color-border-medium);
	}

	.card-header {
		padding: 1.25rem;
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.1));
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
		color: white;
		flex-shrink: 0;
	}

	.icon-container.router {
		background: linear-gradient(135deg, #f59e0b, #d97706);
	}

	.icon-container.switch {
		background: linear-gradient(135deg, #10b981, #059669);
	}

	.icon-container.wifi {
		background: linear-gradient(135deg, #8b5cf6, #7c3aed);
	}

	.icon-container.firewall {
		background: linear-gradient(135deg, #ef4444, #dc2626);
	}

	.icon-container.network {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
	}

	.title-group {
		flex: 1;
		min-width: 0;
	}

	.device-name {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--color-text-primary);
		letter-spacing: -0.01em;
	}

	.type-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-accent-orange);
		background: rgba(245, 158, 11, 0.15);
		border: 1px solid rgba(245, 158, 11, 0.3);
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

	.notes-section {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgba(59, 130, 246, 0.1);
		border-left: 2px solid var(--color-accent-blue);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.notes-section svg {
		flex-shrink: 0;
		margin-top: 0.125rem;
		color: var(--color-accent-blue);
	}

	.ports-section {
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
</style>
