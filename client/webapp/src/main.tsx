import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AuthLayout } from "./layouts";
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
import { CalendarPage } from "./pages/calendar";
import { SettingsPage } from "./pages/settings";

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

	return (
		<ZoomRoomExperience
			roomId={undefined}
			participantCount={participantCount}
			my3DProfile={null}
		/>
	);
}

function HomeRoute() {
	const { token } = useAuth();

	if (token) {
		return <Navigate replace to="/dashboard" />;
	}

	return <App />;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<HomeRoute />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/forgot-password" element={<ForgotPasswordPage />} />
			<Route path="/dashboard" element={<AuthLayout><DashboardPage /></AuthLayout>} />
			<Route path="/calendar" element={<AuthLayout><CalendarPage /></AuthLayout>} />
			<Route path="/settings" element={<AuthLayout><SettingsPage /></AuthLayout>} />
			<Route path="/room/study/:roomId" element={<AuthLayout><RoomStudyPage /></AuthLayout>} />
			<Route path="/room/join/:roomId" element={<AuthLayout><RoomJoinPage /></AuthLayout>} />
			<Route path="/room/create" element={<AuthLayout><RoomCreatePage /></AuthLayout>} />
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
