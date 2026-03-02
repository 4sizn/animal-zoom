import {
	Color3,
	Engine,
	StandardMaterial,
} from "@babylonjs/core";
import {
	createParticipantViewSceneBundle,
	createSingleViewSceneBundle,
	createSingleViewSceneBundleAsync,
	type SceneBundle,
} from "./scene/sceneFactory";

const ROUTES = ["/solo", "/room", "/my-room"] as const;

type RoutePath = (typeof ROUTES)[number];
type MyRoomTheme = "default" | "library" | "cafe";
type MyRoomAvatar = "cat" | "bear" | "penguin" | "rabbit";

const appRoot = getAppRoot();
const engineRuntime = createEngineRuntime();
let currentRoute: RoutePath | null = null;

injectBaseStyles();
window.addEventListener("popstate", () => {
	renderRoute(normalizePath(window.location.pathname));
});

renderRoute(normalizePath(window.location.pathname));

function normalizePath(pathname: string): RoutePath {
	if ((ROUTES as readonly string[]).includes(pathname)) {
		return pathname as RoutePath;
	}

	window.history.replaceState(null, "", "/solo");
	return "/solo";
}

function navigate(path: RoutePath): void {
	if (path !== window.location.pathname) {
		window.history.pushState(null, "", path);
	}
	renderRoute(path);
}

function renderRoute(path: RoutePath): void {
	engineRuntime.handleRouteExit(currentRoute);
	engineRuntime.clearViews();
	appRoot.replaceChildren();

	const container = createPageContainer(path);

	switch (path) {
		case "/solo": {
			container.append(createCanvasPlaceholder("solo-canvas", "solo-canvas"));
			break;
		}
		case "/room": {
			const controls = document.createElement("section");
			controls.id = "room-controls";
			controls.className = "room-controls";

			const addParticipantButton = document.createElement("button");
			addParticipantButton.id = "room-add-participant";
			addParticipantButton.type = "button";
			addParticipantButton.textContent = "Add participant";

			const removeParticipantButton = document.createElement("button");
			removeParticipantButton.id = "room-remove-participant";
			removeParticipantButton.type = "button";
			removeParticipantButton.textContent = "Remove participant";

			const participantCount = document.createElement("span");
			participantCount.id = "room-participant-count";
			participantCount.textContent = "Participants: 0";

			controls.append(
				addParticipantButton,
				removeParticipantButton,
				participantCount,
			);

			const grid = document.createElement("section");
			grid.id = "room-canvas-grid";
			grid.className = "room-canvas-grid";
			container.append(controls, grid);
			break;
		}
		case "/my-room": {
			const shell = document.createElement("section");
			shell.id = "my-room-shell";
			shell.className = "my-room-shell";

			const controls = document.createElement("aside");
			controls.id = "my-room-controls";
			controls.className = "my-room-controls";

			const title = document.createElement("h2");
			title.textContent = "My room controls";

			const themeLabel = document.createElement("label");
			themeLabel.setAttribute("for", "my-room-theme-select");
			themeLabel.textContent = "Theme";

			const themeSelect = document.createElement("select");
			themeSelect.id = "my-room-theme-select";
			["default", "library", "cafe"].forEach((theme) => {
				const option = document.createElement("option");
				option.value = theme;
				option.textContent = theme;
				themeSelect.append(option);
			});

			const avatarLabel = document.createElement("label");
			avatarLabel.setAttribute("for", "my-room-avatar-select");
			avatarLabel.textContent = "Avatar";

			const avatarSelect = document.createElement("select");
			avatarSelect.id = "my-room-avatar-select";
			["cat", "bear", "penguin", "rabbit"].forEach((avatar) => {
				const option = document.createElement("option");
				option.value = avatar;
				option.textContent = avatar;
				avatarSelect.append(option);
			});

			controls.append(
				title,
				themeLabel,
				themeSelect,
				avatarLabel,
				avatarSelect,
			);

			shell.append(
				controls,
				createCanvasPlaceholder("my-room-canvas", "my-room-canvas"),
			);
			container.append(shell);
			break;
		}
	}

	appRoot.append(container);
	engineRuntime.registerViews(path, getRouteCanvases(path));
	currentRoute = path;
}

function createPageContainer(path: RoutePath): HTMLElement {
	const page = document.createElement("main");
	page.className = "page";

	const title = document.createElement("h1");
	title.textContent = `Route: ${path}`;

	const nav = document.createElement("nav");
	nav.className = "route-nav";

	ROUTES.forEach((route) => {
		const link = document.createElement("a");
		link.href = route;
		link.textContent = route;
		if (route === path) {
			link.setAttribute("aria-current", "page");
		}

		link.addEventListener("click", (event) => {
			event.preventDefault();
			navigate(route);
		});

		nav.append(link);
	});

	page.append(title, nav);
	return page;
}

function createCanvasPlaceholder(
	id: string,
	className: string,
): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.id = id;
	canvas.className = `canvas-placeholder ${className}`;
	return canvas;
}

function getRouteCanvases(path: RoutePath): HTMLCanvasElement[] {
	switch (path) {
		case "/solo": {
			const canvas = appRoot.querySelector<HTMLCanvasElement>("#solo-canvas");
			return canvas ? [canvas] : [];
		}
		case "/room": {
			return [
				...appRoot.querySelectorAll<HTMLCanvasElement>(
					"#room-canvas-grid canvas.room-canvas",
				),
			];
		}
		case "/my-room": {
			const canvas =
				appRoot.querySelector<HTMLCanvasElement>("#my-room-canvas");
			return canvas ? [canvas] : [];
		}
	}
}

function createEngineRuntime(): {
	registerViews: (path: RoutePath, canvases: HTMLCanvasElement[]) => void;
	handleRouteExit: (path: RoutePath | null) => void;
	clearViews: () => void;
} {
	type RegisteredView = ReturnType<Engine["registerView"]>;
		type RoomParticipantView = {
			participantId: string;
			tile: HTMLElement;
			canvas: HTMLCanvasElement;
			bundle: SceneBundle;
			view: RegisteredView;
		};

	const workingCanvas = createWorkingCanvas();
	const engine = new Engine(workingCanvas, true);
	const registeredViews = new Set<HTMLCanvasElement>();
	const roomParticipantViews = new Map<
		HTMLCanvasElement,
		RoomParticipantView
	>();
	const roomErroredParticipantIds = new Set<string>();
	const roomSupportsIntersectionObserver = "IntersectionObserver" in window;
	let soloSceneBundle: SceneBundle | null = null;
	let myRoomSceneBundle: SceneBundle | null = null;
	let roomControlsCleanup: (() => void) | null = null;
	let myRoomControlsCleanup: (() => void) | null = null;
	let roomVisibilityObserver: IntersectionObserver | null = null;
	let nextParticipantIndex = 1;
	let runtimeRoute: RoutePath | null = null;
	let soloRenderEnabled = false;
	let myRoomRenderEnabled = false;
	let hasRenderError = false;
	let hasMyRoomRenderError = false;
	let soloLoadRequestId = 0;

	engine.runRenderLoop(() => {
		if (runtimeRoute === "/solo") {
			if (!soloRenderEnabled || !soloSceneBundle) {
				return;
			}

			try {
				soloSceneBundle.scene.render();
			} catch (error) {
				soloRenderEnabled = false;
				if (!hasRenderError) {
					hasRenderError = true;
					console.error(
						"Solo scene render disabled after runtime error",
						error,
					);
				}
			}

			return;
		}

		if (runtimeRoute === "/my-room") {
			if (!myRoomRenderEnabled || !myRoomSceneBundle) {
				return;
			}

			try {
				myRoomSceneBundle.scene.render();
			} catch (error) {
				myRoomRenderEnabled = false;
				if (!hasMyRoomRenderError) {
					hasMyRoomRenderError = true;
					console.error(
						"My-room scene render disabled after runtime error",
						error,
					);
				}
			}

			return;
		}

		if (runtimeRoute !== "/room") {
			return;
		}

		const activeCanvas = getActiveViewCanvas(engine.activeView);
		if (!activeCanvas) {
			return;
		}

		const roomView = roomParticipantViews.get(activeCanvas);
		if (!roomView) {
			return;
		}

		try {
			roomView.bundle.scene.render();
		} catch (error) {
			if (!roomErroredParticipantIds.has(roomView.participantId)) {
				roomErroredParticipantIds.add(roomView.participantId);
				console.error(
					`Room scene render disabled for ${roomView.participantId}`,
					error,
				);
			}
		}
	});

	window.addEventListener("resize", () => {
		engine.resize();
	});

	const clearViews = (): void => {
		registeredViews.forEach((canvas) => {
			engine.unRegisterView(canvas);
		});
		registeredViews.clear();
	};

	const disposeSoloScene = (): void => {
		soloLoadRequestId += 1;
		soloRenderEnabled = false;
		if (!soloSceneBundle) {
			return;
		}

		soloSceneBundle.dispose();
		soloSceneBundle = null;
	};

	const normalizeMyRoomTheme = (value: string): MyRoomTheme => {
		if (value === "library" || value === "cafe") {
			return value;
		}

		return "default";
	};

	const normalizeMyRoomAvatar = (value: string): MyRoomAvatar => {
		if (value === "bear" || value === "penguin" || value === "rabbit") {
			return value;
		}

		return "cat";
	};

	const applyMyRoomTheme = (theme: MyRoomTheme): void => {
		const scene = myRoomSceneBundle?.scene;
		if (!scene) {
			return;
		}

		const light = scene.getLightByName("single-view-light");

		if (theme === "library") {
			scene.clearColor.set(0.88, 0.91, 0.95, 1);
			if (light) {
				light.intensity = 0.85;
			}
			return;
		}

		if (theme === "cafe") {
			scene.clearColor.set(0.98, 0.91, 0.82, 1);
			if (light) {
				light.intensity = 1.05;
			}
			return;
		}

		scene.clearColor.set(0.94, 0.97, 1.0, 1);
		if (light) {
			light.intensity = 0.95;
		}
	};

	const applyMyRoomAvatar = (avatar: MyRoomAvatar): void => {
		const scene = myRoomSceneBundle?.scene;
		if (!scene) {
			return;
		}

		const avatarMesh = scene.getMeshByName("single-view-avatar-proxy");
		if (!avatarMesh) {
			return;
		}

		const avatarMaterial = avatarMesh.material;
		if (!(avatarMaterial instanceof StandardMaterial)) {
			return;
		}

		if (avatar === "bear") {
			avatarMaterial.diffuseColor = new Color3(0.58, 0.38, 0.24);
			avatarMesh.scaling.set(1.15, 1.15, 1.15);
			return;
		}

		if (avatar === "penguin") {
			avatarMaterial.diffuseColor = new Color3(0.2, 0.26, 0.37);
			avatarMesh.scaling.set(0.95, 1.35, 0.95);
			return;
		}

		if (avatar === "rabbit") {
			avatarMaterial.diffuseColor = new Color3(0.78, 0.78, 0.88);
			avatarMesh.scaling.set(0.85, 1.4, 0.85);
			return;
		}

		avatarMaterial.diffuseColor = new Color3(0.8, 0.56, 0.35);
		avatarMesh.scaling.set(1, 1, 1);
	};

	const syncMyRoomSceneFromControls = (): void => {
		const themeSelect = appRoot.querySelector<HTMLSelectElement>(
			"#my-room-theme-select",
		);
		const avatarSelect = appRoot.querySelector<HTMLSelectElement>(
			"#my-room-avatar-select",
		);

		const theme = normalizeMyRoomTheme(themeSelect?.value ?? "default");
		const avatar = normalizeMyRoomAvatar(avatarSelect?.value ?? "cat");

		applyMyRoomTheme(theme);
		applyMyRoomAvatar(avatar);
	};

	const disposeMyRoomScene = (): void => {
		myRoomRenderEnabled = false;
		myRoomControlsCleanup?.();
		myRoomControlsCleanup = null;

		if (!myRoomSceneBundle) {
			return;
		}

		myRoomSceneBundle.dispose();
		myRoomSceneBundle = null;
	};

	const updateRoomParticipantCount = (): void => {
		const countElement = appRoot.querySelector<HTMLElement>(
			"#room-participant-count",
		);
		if (!countElement) {
			return;
		}

		countElement.textContent = `Participants: ${roomParticipantViews.size}`;
	};

	const isCanvasVisibleInViewport = (canvas: HTMLCanvasElement): boolean => {
		const rect = canvas.getBoundingClientRect();
		return (
			rect.width > 0 &&
			rect.height > 0 &&
			rect.bottom > 0 &&
			rect.right > 0 &&
			rect.top < window.innerHeight &&
			rect.left < window.innerWidth
		);
	};

	const updateParticipantViewEnabled = (
		canvas: HTMLCanvasElement,
		enabled: boolean,
	): void => {
		const roomView = roomParticipantViews.get(canvas);
		if (!roomView) {
			return;
		}

		roomView.view.enabled = enabled;
	};

	const ensureRoomVisibilityObserver = (): IntersectionObserver | null => {
		if (!roomSupportsIntersectionObserver) {
			return null;
		}

		if (roomVisibilityObserver) {
			return roomVisibilityObserver;
		}

		roomVisibilityObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!(entry.target instanceof HTMLCanvasElement)) {
					return;
				}

				updateParticipantViewEnabled(entry.target, entry.isIntersecting);
			});
		});

		return roomVisibilityObserver;
	};

	const observeRoomParticipantCanvas = (canvas: HTMLCanvasElement): void => {
		if (!roomSupportsIntersectionObserver) {
			updateParticipantViewEnabled(canvas, true);
			return;
		}

		const observer = ensureRoomVisibilityObserver();
		if (!observer) {
			updateParticipantViewEnabled(canvas, true);
			return;
		}

		observer.observe(canvas);
		updateParticipantViewEnabled(canvas, isCanvasVisibleInViewport(canvas));
	};

	const unobserveRoomParticipantCanvas = (canvas: HTMLCanvasElement): void => {
		roomVisibilityObserver?.unobserve(canvas);
	};

	const disposeRoomVisibilityObserver = (): void => {
		roomVisibilityObserver?.disconnect();
		roomVisibilityObserver = null;
	};

	const removeRoomParticipantByCanvas = (canvas: HTMLCanvasElement): void => {
		const roomView = roomParticipantViews.get(canvas);
		if (!roomView) {
			return;
		}

		unobserveRoomParticipantCanvas(canvas);
		engine.unRegisterView(canvas);
		registeredViews.delete(canvas);
		roomView.bundle.dispose();
		roomParticipantViews.delete(canvas);
		roomErroredParticipantIds.delete(roomView.participantId);
		roomView.tile.remove();
		updateRoomParticipantCount();
	};

	const disposeRoomScene = (): void => {
		[...roomParticipantViews.keys()].forEach((canvas) => {
			removeRoomParticipantByCanvas(canvas);
		});

		disposeRoomVisibilityObserver();

		roomControlsCleanup?.();
		roomControlsCleanup = null;
	};

	const registerRoomControls = (): void => {
		roomControlsCleanup?.();
		roomControlsCleanup = null;

		const grid = appRoot.querySelector<HTMLElement>("#room-canvas-grid");
		const addButton = appRoot.querySelector<HTMLButtonElement>(
			"#room-add-participant",
		);
		const removeButton = appRoot.querySelector<HTMLButtonElement>(
			"#room-remove-participant",
		);

		if (!grid || !addButton || !removeButton) {
			return;
		}

		const addParticipant = (): void => {
			const participantId = `participant-${nextParticipantIndex}`;
			const tile = document.createElement("div");
			tile.className = "room-tile";
			tile.classList.toggle("room-tile-speaking", nextParticipantIndex % 3 === 0);

			const canvas = createCanvasPlaceholder(
				`room-canvas-${nextParticipantIndex}`,
				"room-canvas",
			);
			const label = document.createElement("div");
			label.className = "room-tile-label";
			label.textContent = participantId;
			tile.append(canvas, label);
			nextParticipantIndex += 1;

			grid.append(tile);

			try {
				const bundle = createParticipantViewSceneBundle(engine, participantId, {
					attachControl: false,
					inputElement: canvas,
				});
				const view = engine.registerView(canvas, bundle.camera);

				roomParticipantViews.set(canvas, {
					participantId,
					tile,
					canvas,
					bundle,
					view,
				});
				registeredViews.add(canvas);
				observeRoomParticipantCanvas(canvas);
				updateRoomParticipantCount();
			} catch (error) {
				tile.remove();
				console.error(
					`Failed to initialize room scene for ${participantId}`,
					error,
				);
			}
		};

		const removeParticipant = (): void => {
			const lastCanvas = [...roomParticipantViews.keys()].at(-1);
			if (!lastCanvas) {
				return;
			}

			removeRoomParticipantByCanvas(lastCanvas);
		};

		addButton.addEventListener("click", addParticipant);
		removeButton.addEventListener("click", removeParticipant);
		updateRoomParticipantCount();

		roomControlsCleanup = () => {
			addButton.removeEventListener("click", addParticipant);
			removeButton.removeEventListener("click", removeParticipant);
		};
	};

	const registerMyRoomControls = (): void => {
		myRoomControlsCleanup?.();
		myRoomControlsCleanup = null;

		const themeSelect = appRoot.querySelector<HTMLSelectElement>(
			"#my-room-theme-select",
		);
		const avatarSelect = appRoot.querySelector<HTMLSelectElement>(
			"#my-room-avatar-select",
		);
		if (!themeSelect || !avatarSelect) {
			return;
		}

		const handleThemeChange = (): void => {
			applyMyRoomTheme(normalizeMyRoomTheme(themeSelect.value));
		};

		const handleAvatarChange = (): void => {
			applyMyRoomAvatar(normalizeMyRoomAvatar(avatarSelect.value));
		};

		themeSelect.addEventListener("change", handleThemeChange);
		avatarSelect.addEventListener("change", handleAvatarChange);

		myRoomControlsCleanup = () => {
			themeSelect.removeEventListener("change", handleThemeChange);
			avatarSelect.removeEventListener("change", handleAvatarChange);
		};
	};

	const registerViews = (
		path: RoutePath,
		canvases: HTMLCanvasElement[],
	): void => {
		runtimeRoute = path;

		if (canvases.length === 0) {
			if (path === "/solo") {
				soloRenderEnabled = false;
			}

			if (path === "/room") {
				registerRoomControls();
			}

			return;
		}

		if (path === "/solo") {
			const soloCanvas = canvases[0];

			if (!soloCanvas) {
				soloRenderEnabled = false;
				return;
			}

			const loadRequestId = soloLoadRequestId + 1;
			soloLoadRequestId = loadRequestId;
			soloSceneBundle = null;
			soloRenderEnabled = false;

			void createSingleViewSceneBundleAsync(engine, {
				attachControl: false,
				inputElement: soloCanvas,
			})
				.then((bundle) => {
					if (loadRequestId !== soloLoadRequestId || runtimeRoute !== "/solo") {
						bundle.dispose();
						return;
					}

					try {
						engine.registerView(soloCanvas, bundle.camera);
						registeredViews.add(soloCanvas);
						soloSceneBundle = bundle;
						hasRenderError = false;
						soloRenderEnabled = true;
					} catch (error) {
						bundle.dispose();
						soloSceneBundle = null;
						soloRenderEnabled = false;
						if (loadRequestId === soloLoadRequestId) {
							console.error("Failed to initialize solo scene", error);
						}
					}
				})
				.catch((error) => {
					if (loadRequestId !== soloLoadRequestId) {
						return;
					}

					soloSceneBundle = null;
					soloRenderEnabled = false;
					console.error("Failed to initialize solo scene", error);
				});

			return;
		}

		if (path === "/room") {
			registerRoomControls();
			return;
		}

		if (path === "/my-room") {
			registerMyRoomControls();

			const myRoomCanvas = canvases[0];
			if (!myRoomCanvas) {
				myRoomRenderEnabled = false;
				return;
			}

			try {
				myRoomSceneBundle = createSingleViewSceneBundle(engine, {
					attachControl: false,
					inputElement: myRoomCanvas,
				});
				engine.registerView(myRoomCanvas, myRoomSceneBundle.camera);
				registeredViews.add(myRoomCanvas);
				hasMyRoomRenderError = false;
				myRoomRenderEnabled = true;
				syncMyRoomSceneFromControls();
			} catch (error) {
				myRoomRenderEnabled = false;
				myRoomSceneBundle = null;
				console.error("Failed to initialize my-room scene", error);
			}

			return;
		}

		canvases.forEach((canvas) => {
			engine.registerView(canvas);
			registeredViews.add(canvas);
		});
	};

	const handleRouteExit = (path: RoutePath | null): void => {
		if (path === "/solo") {
			disposeSoloScene();
			return;
		}

		if (path === "/room") {
			disposeRoomScene();
			return;
		}

		if (path === "/my-room") {
			disposeMyRoomScene();
		}
	};

	return {
		registerViews,
		handleRouteExit,
		clearViews,
	};
}

function createWorkingCanvas(): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.id = "babylon-working-canvas";
	canvas.setAttribute("aria-hidden", "true");
	canvas.style.position = "fixed";
	canvas.style.width = "1px";
	canvas.style.height = "1px";
	canvas.style.opacity = "0";
	canvas.style.pointerEvents = "none";
	canvas.style.left = "-10000px";
	canvas.style.top = "-10000px";
	document.body.append(canvas);
	return canvas;
}

function getActiveViewCanvas(activeView: unknown): HTMLCanvasElement | null {
	if (!activeView || typeof activeView !== "object") {
		return null;
	}

	if (!("target" in activeView)) {
		return null;
	}

	const maybeCanvas = (activeView as { target?: unknown }).target;
	return maybeCanvas instanceof HTMLCanvasElement ? maybeCanvas : null;
}

function injectBaseStyles(): void {
	const style = document.createElement("style");
	style.textContent = `
    :root {
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      color: #1f2937;
      background: #f8fafc;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
    }

    .page {
      min-height: 100vh;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .route-nav {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .route-nav a {
      color: #0f766e;
      text-decoration: none;
      font-weight: 600;
    }

    .route-nav a[aria-current="page"] {
      text-decoration: underline;
    }

    .canvas-placeholder {
      width: 100%;
      min-height: 280px;
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      background: #e2e8f0;
    }

    .room-canvas-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .room-tile {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      background: #0b1220;
    }

    .room-tile .canvas-placeholder {
      min-height: 220px;
      border: none;
      border-radius: 0;
      background: transparent;
    }

    .room-tile-label {
      position: absolute;
      left: 12px;
      bottom: 10px;
      color: #ffffff;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 0.01em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      pointer-events: none;
    }

    .room-tile-speaking {
      outline: 4px solid #22c55e;
      outline-offset: -4px;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
    }

    .room-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .room-controls button {
      border: 1px solid #0f766e;
      background: #ecfeff;
      color: #134e4a;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
    }

    .my-room-shell {
      display: grid;
      gap: 12px;
      grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
      align-items: start;
    }

    .my-room-controls {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
      background: #ffffff;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .my-room-controls h2 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .my-room-controls label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f172a;
    }

    .my-room-controls select {
      border: 1px solid #94a3b8;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
      color: #0f172a;
    }

    @media (max-width: 800px) {
      .my-room-shell {
        grid-template-columns: 1fr;
      }
    }
  `;

	document.head.append(style);
}

function getAppRoot(): HTMLElement {
	const root = document.getElementById("app");
	if (!root) {
		throw new Error("Missing #app root element");
	}

	return root;
}
