import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { AuthProvider } from "./auth/AuthContext";
import { AssetsController } from "./core/controllers/AssetsController";
import { StorageController } from "./core/controllers/StorageController";
import { SystemController } from "./core/controllers/system/SystemController";
import { SystemControllerManager } from "./core/managers/system/SystemControllerManager";
import { DashboardPage } from "./pages/dashboard";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { RoomCreatePage } from "./pages/room/create";
import { RoomJoinPage } from "./pages/room/join";
import { RoomStudyPage } from "./pages/room/study";
import {
	MAX_ZOOM_DEMO_PARTICIPANTS,
	resolveParticipantCountFromSearch,
	ZoomRoomExperience,
} from "./pages/room/study/ZoomRoomExperience";

SystemControllerManager.getInstance().registerSystemController(
	new SystemController(new StorageController()),
);
SystemControllerManager.getInstance().registerSystemController(
	new SystemController(new AssetsController()),
);

function App() {
	const participantCount = resolveParticipantCountFromSearch(
		window.location.search,
		MAX_ZOOM_DEMO_PARTICIPANTS,
	);

	return <ZoomRoomExperience participantCount={participantCount} />;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/forgot-password" element={<ForgotPasswordPage />} />
			<Route path="/dashboard" element={<DashboardPage />} />
			<Route path="/room/study/:roomId" element={<RoomStudyPage />} />
			<Route path="/room/join/:roomId" element={<RoomJoinPage />} />
			<Route path="/room/create" element={<RoomCreatePage />} />
			<Route path="*" element={<Navigate replace to="/" />} />
		</Routes>
	);
}

document.documentElement.classList.add("dark");

const rootElement = document.getElementById("root");

if (rootElement === null) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
