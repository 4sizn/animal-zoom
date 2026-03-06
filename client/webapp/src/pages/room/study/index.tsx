import { useParams } from "react-router-dom";
import { getDashboardRoomById } from "../../dashboard/data";
import {
	MAX_ZOOM_DEMO_PARTICIPANTS,
	resolveParticipantCountFromSearch,
	ZoomRoomExperience,
} from "./ZoomRoomExperience";

function getRoomParticipantCount(roomId: string | undefined): number {
	if (roomId === undefined) {
		return resolveParticipantCountFromSearch(
			window.location.search,
			MAX_ZOOM_DEMO_PARTICIPANTS,
		);
	}

	const room = getDashboardRoomById(roomId);

	if (room === undefined) {
		return resolveParticipantCountFromSearch(
			window.location.search,
			MAX_ZOOM_DEMO_PARTICIPANTS,
		);
	}

	return Math.min(
		Math.max(room.participants.length, 1),
		MAX_ZOOM_DEMO_PARTICIPANTS,
	);
}

export function RoomStudyPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const participantCount = getRoomParticipantCount(roomId);

	return <ZoomRoomExperience participantCount={participantCount} />;
}
