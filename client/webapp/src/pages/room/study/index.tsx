import type {
	GetRoomResponse,
	Me3DProfileResponse,
	User3DProfile,
} from "@animal-zoom/share";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { apiRequest } from "../../../network/apiClient";
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

function getRealRoomParticipantCount(): number {
	return Math.min(
		Math.max(resolveParticipantCountFromSearch(window.location.search, 1), 1),
		MAX_ZOOM_DEMO_PARTICIPANTS,
	);
}

export function RoomStudyPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();
	const { token, logout } = useAuth();
	const [participantCount, setParticipantCount] = React.useState(() =>
		getRoomParticipantCount(roomId),
	);
	const [my3DProfile, setMy3DProfile] = React.useState<User3DProfile | null>(
		null,
	);

	React.useEffect(() => {
		setParticipantCount(getRoomParticipantCount(roomId));
	}, [roomId]);

	React.useEffect(() => {
		if (!token || !roomId) return;

		let cancelled = false;
		apiRequest<GetRoomResponse>({
			path: `/rooms/${encodeURIComponent(roomId)}`,
			method: "GET",
			token,
		})
			.then((res) => {
				if (cancelled) return;
				if (!res.ok) {
					if (res.error === "unauthorized") {
						logout();
						navigate(
							`/login?next=${encodeURIComponent(`/room/study/${roomId}`)}`,
							{ replace: true },
						);
					}
					return;
				}
				setParticipantCount(getRealRoomParticipantCount());
			})
			.catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, [logout, navigate, roomId, token]);

	React.useEffect(() => {
		if (!token) {
			setMy3DProfile(null);
			return;
		}

		let cancelled = false;
		apiRequest<Me3DProfileResponse>({
			path: "/users/me/3d-profile",
			method: "GET",
			token,
		})
			.then((res) => {
				if (cancelled) return;
				if (!res.ok || !res.profile) {
					setMy3DProfile(null);
					return;
				}
				setMy3DProfile(res.profile);
			})
			.catch(() => {
				if (cancelled) return;
				setMy3DProfile(null);
			});

		return () => {
			cancelled = true;
		};
	}, [token]);

	return (
		<ZoomRoomExperience
			roomId={roomId}
			participantCount={participantCount}
			my3DProfile={my3DProfile}
		/>
	);
}
