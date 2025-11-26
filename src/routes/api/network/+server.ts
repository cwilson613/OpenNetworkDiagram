import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { RequestHandler } from './$types';

// Disable prerendering for this API route
export const prerender = false;

export const GET: RequestHandler = async () => {
	const filePath = '/data/network.json';

	try {
		// Check if file exists
		if (!existsSync(filePath)) {
			console.warn(`Network data file not found at ${filePath}, returning empty structure`);
			return json({
				machines: [],
				devices: []
			});
		}

		// Read and parse the file
		const fileContent = await readFile(filePath, 'utf-8');
		const networkData = JSON.parse(fileContent);

		return json(networkData);
	} catch (error) {
		console.error('Error reading network data:', error);

		// Return empty structure on error
		return json({
			machines: [],
			devices: []
		});
	}
};
