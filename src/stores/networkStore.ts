import { writable } from 'svelte/store';
import type { NetworkData } from '../lib/types';

// Create a writable store for the data
export const networkStore = writable<NetworkData>({
	machines: [],
	devices: []
});

// A function to load JSON from an API or local file if needed
export async function loadNetworkData(jsonPath: string) {
	try {
		// Fetch network data from the API endpoint
		const response = await fetch('/api/network');

		if (!response.ok) {
			throw new Error(`Failed to fetch network data: ${response.statusText}`);
		}

		const data: NetworkData = await response.json();
		networkStore.set(data);

		console.log('Successfully loaded network data from API');
	} catch (error) {
		console.error('Error loading network data:', error);

		// Set empty data structure on error
		networkStore.set({
			machines: [],
			devices: []
		});
	}
}
