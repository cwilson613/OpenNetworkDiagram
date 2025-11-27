<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { networkStore, loadNetworkData } from '../../stores/networkStore';
	import { get } from 'svelte/store';
	import MachineCard from './MachineCard.svelte';
	import DeviceCard from './DeviceCard.svelte';

	import type { NetworkData, Port } from '../../lib/types';
	import { astar } from '../utils/pathfinding';
	import type { Point } from '../utils/pathfinding';

	let { jsonPath = '/api/network' }: { jsonPath?: string } = $props();

	let data = $state<NetworkData | undefined>(undefined);

	// DEBUG: Log when component mounts
	onMount(() => {
		// Async block for data loading and initial connection
		(async () => {
			console.log('NetworkDiagram mounted');
			await loadNetworkData(jsonPath);
			data = get(networkStore);
			console.log('Loaded network data:', data);
			console.log(`Data contains: ${data?.machines?.length || 0} machines, ${data?.devices?.length || 0} devices`);

			// Check for connectedTo in data
			let portsWithConnections = 0;
			data?.machines?.forEach(m => {
				m.ports?.forEach(p => {
					if (p.connectedTo) portsWithConnections++;
				});
			});
			data?.devices?.forEach(d => {
				d.ports?.forEach(p => {
					if (p.connectedTo) portsWithConnections++;
				});
			});
			console.log(`Ports with connectedTo: ${portsWithConnections}`);
			await tick(); // Wait for DOM update
			const container = document.querySelector('.diagram-container');
			if (container) {
				updateSVGConnections();
			} else {
				console.warn('Container not found, skipping updateSVGConnections');
			}
		})();

		// Optionally, update connections on window resize
		const handleResize = () => {
			const container = document.querySelector('.diagram-container');
			if (container) updateSVGConnections();
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// SVG-based connection rendering
	let svgWidth = $state(0);
	let svgHeight = $state(0);
	let svgOffsetX = $state(0);
	let svgOffsetY = $state(0);
	let svgConnections = $state<{ points: [number, number][]; color: string; label: string }[]>([]);

	const GRID_SIZE = 40; // px per grid cell

	function updateSVGConnections() {
		const container = document.querySelector('.diagram-container') as HTMLElement;
		if (!container) {
			console.warn('No container element found in updateSVGConnections');
			return;
		}
		const rect = container.getBoundingClientRect();
		svgWidth = rect.width;
		svgHeight = rect.height;
		svgOffsetX = rect.left;
		svgOffsetY = rect.top;

		console.log('updateSVGConnections called');

		const portDataMap: Map<string, { element: HTMLDivElement; port: Port }> = new Map();
		// Gather all port elements
		if (!data) {
			console.warn('No data loaded in updateSVGConnections');
			return;
		}

		for (const machine of data.machines) {
			if (machine.ports) {
				for (const p of machine.ports) {
					const key = `${machine.machineName}-${p.portName}`;
					const elem = document.querySelector(`[data-port-key="${key}"]`) as HTMLDivElement;
					if (elem) {
						portDataMap.set(key, { element: elem, port: p });
					} else {
						console.warn(`Port element not found for ${key}`);
					}
				}
			}
		}

		for (const dev of data.devices) {
			if (dev.ports) {
				for (const p of dev.ports) {
					const key = `${dev.name}-${p.portName}`;
					const elem = document.querySelector(`[data-port-key="${key}"]`) as HTMLDivElement;
					if (elem) {
						portDataMap.set(key, { element: elem, port: p });
					} else {
						console.warn(`Port element not found for ${key}`);
					}
				}
			}
		}

		console.log(`Found ${portDataMap.size} port elements`);
		console.log('Port keys:', Array.from(portDataMap.keys()).slice(0, 10));

		// DRAW CONNECTIONS
		svgConnections = [];
		// Pathfinding: mark all cards as obstacles
		const cols = Math.ceil(svgWidth / GRID_SIZE);
		const rows = Math.ceil(svgHeight / GRID_SIZE);
		const cardElements = document.querySelectorAll('.device-card, .machine-card');
		const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
		for (const el of cardElements) {
			const r = el.getBoundingClientRect();
			const left = Math.floor((r.left - svgOffsetX) / GRID_SIZE);
			const top = Math.floor((r.top - svgOffsetY) / GRID_SIZE);
			const right = Math.ceil((r.right - svgOffsetX) / GRID_SIZE);
			const bottom = Math.ceil((r.bottom - svgOffsetY) / GRID_SIZE);
			for (let y = top; y < bottom; y++) {
				for (let x = left; x < right; x++) {
					if (x >= 0 && y >= 0 && x < cols && y < rows) grid[y][x] = 1;
				}
			}
		}

		svgConnections = [];
		let connectionAttempts = 0;
		let successfulConnections = 0;
		for (const [key, info] of portDataMap.entries()) {
			const localPort = info.port;
			if (!localPort.connectedTo) continue;
			connectionAttempts++;
			const remoteInfo = portDataMap.get(localPort.connectedTo);
			if (!remoteInfo) {
				console.warn(`Connection target not found: ${key} -> ${localPort.connectedTo}`);
				continue;
			}
			if (key > localPort.connectedTo) continue; // Avoid duplicates
			successfulConnections++;

			const a = info.element.getBoundingClientRect();
			const b = remoteInfo.element.getBoundingClientRect();
			const PADDING = 8;
			const isRightward = (b.left + b.width / 2) > (a.left + a.width / 2);
			const startX = isRightward ? a.right - svgOffsetX + PADDING : a.left - svgOffsetX - PADDING;
			const endX = isRightward ? b.left - svgOffsetX - PADDING : b.right - svgOffsetX + PADDING;
			const startY = a.top + a.height / 2 - svgOffsetY;
			const endY = b.top + b.height / 2 - svgOffsetY;

			// Source/target grid points
			const start: Point = [Math.floor(startX / GRID_SIZE), Math.floor(startY / GRID_SIZE)];
			const end: Point = [Math.floor(endX / GRID_SIZE), Math.floor(endY / GRID_SIZE)];
			// Temporarily clear source/target cells
			grid[start[1]][start[0]] = 0;
			grid[end[1]][end[0]] = 0;

			let path = astar(grid, start, end);
			let points: [number, number][] = [];
			if (path.length > 0) {
				points = path.map(([gx, gy]) => [
					gx * GRID_SIZE + GRID_SIZE / 2,
					gy * GRID_SIZE + GRID_SIZE / 2
				]);
				// Ensure start and end points are exactly at the card edges
				points[0] = [startX, startY];
				points[points.length - 1] = [endX, endY];
			} else {
				// fallback: simple L-bend
				points = [
					[startX, startY],
					[endX, startY],
					[endX, endY]
				];
			}
			const speed = Math.min(localPort.speedGbps ?? 1, remoteInfo.port.speedGbps ?? 1);
			const color = getLineColor(speed);
			const label = `${speed}GbE`;
			svgConnections.push({ points, color, label });
		}
		console.log(`Connection summary: ${connectionAttempts} attempts, ${successfulConnections} successful, ${svgConnections.length} drawn`);
	}

	

	function getLineColor(speed: number): string {
		if (speed >= 10) return '#f59e0b';
		if (speed >= 2.5) return '#10b981';
		if (speed >= 1) return '#3b82f6';
		return '#6b7a99';
	}
</script>

<main class="main-container">
	<div class="header">
		<div class="header-content">
			<div class="title-section">
				<h1 class="title">Network Infrastructure</h1>
				<p class="subtitle">Visual documentation of your network topology</p>
			</div>
			<div class="stats">
				{#if data}
					<div class="stat-item">
						<span class="stat-value">{data.machines.length}</span>
						<span class="stat-label">Machines</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{data.devices.length}</span>
						<span class="stat-label">Devices</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{data.machines.reduce((sum, m) => sum + (m.software?.vms?.length ?? 0), 0)}</span>
						<span class="stat-label">VMs</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if data}
		<div class="diagram-wrapper">
			<div class="diagram-container" style="position:relative;">
				<svg
					class="diagram-svg"
					width={svgWidth}
					height={svgHeight}
					style="position:absolute;top:0;left:0;z-index:0;pointer-events:none;"
				>
					<defs>
						<filter id="glow">
							<feGaussianBlur stdDeviation="2" result="coloredBlur"/>
							<feMerge>
								<feMergeNode in="coloredBlur"/>
								<feMergeNode in="SourceGraphic"/>
							</feMerge>
						</filter>
					</defs>
					{#each svgConnections as conn, i}
						<g class="connection-group" style="animation: fadeIn 0.6s ease-out {i * 0.05}s backwards;">
							<polyline
								points={conn.points.map(([x, y]) => `${x},${y}`).join(' ')}
								stroke={conn.color}
								stroke-width="3"
								fill="none"
								opacity="0.6"
								stroke-linecap="round"
								stroke-linejoin="round"
								filter="url(#glow)"
							/>
							<text
								x={(conn.points[Math.floor(conn.points.length / 2)][0])}
								y={(conn.points[Math.floor(conn.points.length / 2)][1] - 8)}
								font-size="11"
								font-weight="600"
								fill="var(--color-text-primary)"
								text-anchor="middle"
								class="connection-label"
							>
								<tspan class="label-bg">{conn.label}</tspan>
							</text>
						</g>
					{/each}
				</svg>
				{#each data.machines as machine, i}
					<div style="animation: fadeIn 0.5s ease-out {i * 0.1}s backwards;">
						<MachineCard {machine} />
					</div>
				{/each}
				{#each data.devices as device, i}
					<div style="animation: fadeIn 0.5s ease-out {(data.machines.length + i) * 0.1}s backwards;">
						<DeviceCard {device} />
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p class="loading-text">Loading network data...</p>
		</div>
	{/if}
</main>

<style>
	.main-container {
		min-height: 100vh;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--color-border-subtle);
		padding-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 2rem;
	}

	.title-section {
		flex: 1;
		min-width: 250px;
	}

	.title {
		font-size: 2.25rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-blue-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 1rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.stats {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 1.25rem;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		min-width: 80px;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-accent-blue-light);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.diagram-wrapper {
		background: rgba(30, 36, 51, 0.3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		padding: 2rem;
		min-height: 600px;
	}

	.diagram-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 1rem;
		position: relative;
		align-items: flex-start;
		align-content: flex-start;
	}

	.diagram-svg {
		pointer-events: none;
	}

	.connection-label {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
	}

	.label-bg {
		background: var(--color-bg-card);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1.5rem;
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-border-subtle);
		border-top-color: var(--color-accent-blue);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
		animation: pulse 2s ease-in-out infinite;
	}

	@media (max-width: 768px) {
		.main-container {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
		}

		.stats {
			justify-content: space-between;
			gap: 1rem;
		}

		.stat-item {
			flex: 1;
			min-width: 0;
		}

		.title {
			font-size: 1.75rem;
		}

		.diagram-wrapper {
			padding: 1rem;
		}
	}
</style>
