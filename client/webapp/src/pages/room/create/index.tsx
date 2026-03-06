import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function createRoomId(): string {
	const id = `room-${Date.now().toString(36)}`;

	if (id.length === 0) {
		throw new Error("Failed to create room id");
	}

	return id;
}

export function RoomCreatePage() {
	const navigate = useNavigate();

	useEffect(() => {
		try {
			const newRoomId = createRoomId();
			navigate(`/room/study/${newRoomId}`, { replace: true });
		} catch {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate]);

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans grid place-items-center px-6">
			<p className="text-sm text-gray-400">Creating room...</p>
		</div>
	);
}
