export type FriendStatus = "online" | "away" | "offline";

export type DashboardFriend = {
	id: string;
	name: string;
	status: FriendStatus;
	activity: string;
};

export type DashboardRoom = {
	id: string;
	name: string;
	description: string;
	tone: "focus" | "cozy" | "deep";
	participants: { name: string }[];
};

export type DashboardData = {
	rooms: DashboardRoom[];
	friends: DashboardFriend[];
	dailyGoal: {
		done: number;
		target: number;
	};
	weeklyBars: number[];
};

export type DashboardDemoWidgets = Pick<
	DashboardData,
	"friends" | "dailyGoal" | "weeklyBars"
>;

const mockDashboardData: DashboardData = {
	rooms: [
		{
			id: "cozy-cafe",
			name: "The Cozy Cafe",
			description: "Lofi beats and gentle chatter. Perfect for light reading.",
			tone: "cozy",
			participants: [{ name: "Coco" }, { name: "Milo" }, { name: "Ruby" }],
		},
		{
			id: "quiet-library",
			name: "Quiet Library",
			description: "Strictly silent study. Deep focus encouraged here.",
			tone: "focus",
			participants: [{ name: "Nova" }, { name: "Buster" }],
		},
		{
			id: "riverside-porch",
			name: "Riverside Porch",
			description: "Ambient water sounds and fresh air vibes.",
			tone: "deep",
			participants: [
				{ name: "Ari" },
				{ name: "Jen" },
				{ name: "Fang" },
				{ name: "Beau" },
			],
		},
	],
	friends: [
		{ id: "coco", name: "Coco", status: "online", activity: "In Cozy Cafe" },
		{
			id: "milo",
			name: "Milo",
			status: "online",
			activity: "In Quiet Library",
		},
		{
			id: "buster",
			name: "Buster",
			status: "offline",
			activity: "Exploring offline",
		},
	],
	dailyGoal: { done: 120, target: 180 },
	weeklyBars: [40, 65, 85, 95, 10, 15, 5],
};

export async function loadDashboardData(): Promise<DashboardData> {
	await new Promise<void>((resolve) => setTimeout(resolve, 250));
	return createDashboardDataWithRooms(mockDashboardData.rooms);
}

export function getDashboardDemoWidgets(): DashboardDemoWidgets {
	return {
		friends: mockDashboardData.friends.map((friend) => ({ ...friend })),
		dailyGoal: { ...mockDashboardData.dailyGoal },
		weeklyBars: [...mockDashboardData.weeklyBars],
	};
}

export function createDashboardDataWithRooms(
	rooms: DashboardRoom[],
): DashboardData {
	return {
		rooms: rooms.map((room) => ({
			...room,
			participants: room.participants.map((participant) => ({
				...participant,
			})),
		})),
		...getDashboardDemoWidgets(),
	};
}

export function getDashboardRoomById(
	roomId: string,
): DashboardRoom | undefined {
	return mockDashboardData.rooms.find((room) => room.id === roomId);
}
