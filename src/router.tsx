import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createStart } from "@tanstack/react-start";

import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});

	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
		context: { queryClient },
	});

	return router;
}

export const getRouter = createRouter;

export default createRouter;
