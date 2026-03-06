import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function RoomJoinPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		const normalizedRoomId = roomId?.trim();

		if (normalizedRoomId === undefined || normalizedRoomId.length === 0) {
			navigate("/dashboard", { replace: true });
			return;
		}

		navigate(`/room/study/${normalizedRoomId}`, { replace: true });
	}, [roomId, navigate]);

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans grid place-items-center px-6">
			<p className="text-sm text-gray-400">Joining room...</p>
		</div>
	);
}
