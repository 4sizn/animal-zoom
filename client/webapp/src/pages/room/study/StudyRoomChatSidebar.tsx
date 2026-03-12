import React from "react";

import { useAuth } from "../../../auth/AuthContext";

type ServerStudyChatMessage = {
	id: number;
	roomId: string;
	authorUserId: number;
	text: string;
	createdAt: string | Date;
};

type StudyChatMessage = {
	id: number;
	roomId: string;
	authorUserId: number;
	text: string;
	createdAtMs: number;
};

type StudyRoomChatSidebarProps = {
	roomId: string | undefined;
	isDesktop: boolean;
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
};

function formatTime(ms: number): string {
	return new Date(ms).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function decodeJwtUserId(token: string | null): number | null {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length < 2) return null;

	try {
		const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const payload = JSON.parse(atob(normalized)) as Record<string, unknown>;
		const idCandidate = payload.userId ?? payload.id ?? payload.sub;
		if (typeof idCandidate === "number") return idCandidate;
		if (typeof idCandidate === "string") {
			const n = Number(idCandidate);
			return Number.isFinite(n) ? n : null;
		}
		return null;
	} catch {
		return null;
	}
}

function parseCreatedAtMs(value: unknown): number | null {
	if (value instanceof Date) {
		const ms = value.getTime();
		return Number.isFinite(ms) ? ms : null;
	}

	if (typeof value === "string") {
		const ms = Date.parse(value);
		return Number.isFinite(ms) ? ms : null;
	}

	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}

	return null;
}

function normalizeMessage(value: unknown): StudyChatMessage | null {
	if (typeof value !== "object" || value === null) return null;
	const maybe = value as Partial<ServerStudyChatMessage>;

	if (
		typeof maybe.id !== "number" ||
		typeof maybe.roomId !== "string" ||
		typeof maybe.authorUserId !== "number" ||
		typeof maybe.text !== "string"
	) {
		return null;
	}

	const createdAtMs = parseCreatedAtMs(maybe.createdAt);
	if (createdAtMs === null) return null;

	return {
		id: maybe.id,
		roomId: maybe.roomId,
		authorUserId: maybe.authorUserId,
		text: maybe.text,
		createdAtMs,
	};
}

function extractHistoryMessages(value: unknown): StudyChatMessage[] {
	if (Array.isArray(value)) {
		return value
			.map(normalizeMessage)
			.filter((v): v is StudyChatMessage => v !== null);
	}

	if (typeof value !== "object" || value === null) return [];
	const maybe = value as { messages?: unknown; data?: unknown; ok?: unknown };

	if (Array.isArray(maybe.messages)) {
		return maybe.messages
			.map(normalizeMessage)
			.filter((v): v is StudyChatMessage => v !== null);
	}

	if (Array.isArray(maybe.data)) {
		return maybe.data
			.map(normalizeMessage)
			.filter((v): v is StudyChatMessage => v !== null);
	}

	if (maybe.ok === false) return [];

	return [];
}

function isAckOk(value: unknown): boolean {
	if (typeof value === "boolean") return value;
	if (typeof value !== "object" || value === null) return true;
	const maybe = value as { ok?: unknown };
	if (typeof maybe.ok === "boolean") return maybe.ok;
	return true;
}

function getAckErrorMessage(value: unknown): string {
	if (typeof value !== "object" || value === null) {
		return "Message failed to send.";
	}

	const maybe = value as { error?: unknown };
	switch (maybe.error) {
		case "unauthorized":
			return "Session expired. Please sign in again.";
		case "room_not_found":
			return "Room no longer exists.";
		case "rate_limited":
			return "You're sending messages too fast.";
		case "message_too_long":
			return "Message is too long (max 500 chars).";
		case "invalid_text":
			return "Message can't be empty.";
		default:
			return "Message failed to send.";
	}
}

function upsertMessage(
	prev: StudyChatMessage[],
	next: StudyChatMessage,
): StudyChatMessage[] {
	if (prev.some((item) => item.id === next.id)) return prev;
	return [...prev, next].sort((a, b) => a.createdAtMs - b.createdAtMs);
}

export function StudyRoomChatSidebar({
	roomId,
	isDesktop,
	isOpen,
	onOpen,
	onClose,
}: StudyRoomChatSidebarProps) {
	const { token, socket, socketStatus } = useAuth();
	const currentUserId = React.useMemo(() => decodeJwtUserId(token), [token]);

	const [messages, setMessages] = React.useState<StudyChatMessage[]>([]);
	const [draft, setDraft] = React.useState("");
	const [unreadCount, setUnreadCount] = React.useState(0);
	const [error, setError] = React.useState<string | null>(null);

	const listRef = React.useRef<HTMLDivElement | null>(null);
	const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

	const isRealtimeEnabled = Boolean(token && socket && roomId);
	const isSendEnabled = isRealtimeEnabled && socketStatus === "connected";

	const isNearBottom = React.useCallback((): boolean => {
		const list = listRef.current;
		if (list === null) return true;
		const threshold = 40;
		return list.scrollHeight - list.scrollTop - list.clientHeight < threshold;
	}, []);

	const scrollToBottom = React.useCallback(() => {
		const list = listRef.current;
		if (list !== null) {
			list.scrollTop = list.scrollHeight;
		}
	}, []);

	React.useEffect(() => {
		setMessages([]);
		setUnreadCount(0);
		setError(null);
	}, [roomId]);

	React.useEffect(() => {
		if (!isOpen) return;
		setUnreadCount(0);
		scrollToBottom();
		inputRef.current?.focus();
	}, [isOpen, scrollToBottom]);

	const appendMessage = React.useCallback(
		(next: StudyChatMessage, isSelf: boolean) => {
			const shouldStickToBottom = isOpen && isNearBottom();
			setMessages((prev) => upsertMessage(prev, next));

			window.requestAnimationFrame(() => {
				if (isSelf || shouldStickToBottom) {
					scrollToBottom();
					setUnreadCount(0);
					return;
				}
				setUnreadCount((prev) => prev + 1);
			});
		},
		[isNearBottom, isOpen, scrollToBottom],
	);

	React.useEffect(() => {
		if (!isOpen || !roomId || !socket || !token) return;

		let isCancelled = false;

		const onCreated = (payload: unknown) => {
			if (isCancelled) return;
			const next = normalizeMessage(payload);
			if (next === null || next.roomId !== roomId) return;
			appendMessage(
				next,
				currentUserId !== null && next.authorUserId === currentUserId,
			);
		};

		socket.emit("room:join", { roomId }, (ack: unknown) => {
			if (isCancelled) return;
			if (!isAckOk(ack)) {
				setError(getAckErrorMessage(ack));
			}
		});
		socket.on("room:message:created", onCreated);

		socket.emit("room:history", { roomId, limit: 50 }, (ack: unknown) => {
			if (isCancelled) return;
			if (!isAckOk(ack)) {
				setError(getAckErrorMessage(ack));
				return;
			}
			const history = extractHistoryMessages(ack).filter(
				(message) => message.roomId === roomId,
			);
			setMessages(history.sort((a, b) => a.createdAtMs - b.createdAtMs));
			setUnreadCount(0);
			window.requestAnimationFrame(() => {
				scrollToBottom();
			});
		});

		return () => {
			isCancelled = true;
			socket.off("room:message:created", onCreated);
			socket.emit("room:leave", { roomId });
		};
	}, [
		appendMessage,
		currentUserId,
		isOpen,
		roomId,
		scrollToBottom,
		socket,
		token,
	]);

	const sendMessage = React.useCallback(() => {
		const trimmed = draft.replace(/\s+$/g, "");
		if (!trimmed.trim()) return;
		if (!roomId || !socket || !token) {
			setError("Sign in to use room chat.");
			return;
		}
		if (socketStatus !== "connected") {
			setError("Chat is reconnecting. Try again in a moment.");
			return;
		}

		setError(null);
		setDraft("");
		socket.emit("room:message", { roomId, text: trimmed }, (ack: unknown) => {
			if (!isAckOk(ack)) {
				setError(getAckErrorMessage(ack));
				setDraft(trimmed);
				return;
			}

			const messageValue =
				typeof ack === "object" &&
				ack !== null &&
				"message" in ack &&
				typeof (ack as { message?: unknown }).message !== "undefined"
					? (ack as { message?: unknown }).message
					: undefined;

			const next = normalizeMessage(messageValue);
			if (next === null) return;
			appendMessage(
				next,
				currentUserId !== null && next.authorUserId === currentUserId,
			);
		});
		inputRef.current?.focus();
	}, [
		appendMessage,
		currentUserId,
		draft,
		roomId,
		socket,
		socketStatus,
		token,
	]);

	const isVisible = isDesktop ? isOpen : isOpen;

	return (
		<>
			<button
				type="button"
				aria-label="Open chat"
				onClick={onOpen}
				className="fixed right-6 top-6 z-[90] w-11 h-11 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/10 hover:bg-slate-800 transition-colors flex items-center justify-center"
			>
				<span className="material-symbols-outlined text-[20px]">chat</span>
			</button>

			<aside
				className={`fixed inset-y-0 right-0 z-[100] w-[min(400px,100vw)] bg-white dark:bg-[#1c222d] border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-out ${
					isVisible ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="p-6 flex items-center justify-between">
					<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
						Chat
					</h2>
					<button
						type="button"
						aria-label="Close chat"
						onClick={onClose}
						className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
					>
						<span className="material-symbols-outlined text-slate-500">
							close
						</span>
					</button>
				</div>

				<div
					ref={listRef}
					className="relative flex-1 overflow-y-auto p-6 custom-scrollbar"
				>
					{unreadCount > 0 ? (
						<div className="sticky top-0 z-10 pb-4">
							<button
								type="button"
								onClick={() => {
									scrollToBottom();
									setUnreadCount(0);
								}}
								className="mx-auto flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg"
							>
								<span className="material-symbols-outlined text-sm">south</span>
								<span>{`New messages (${unreadCount})`}</span>
							</button>
						</div>
					) : null}

					{!token ? (
						<div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 text-sm text-slate-600 dark:text-slate-300">
							Sign in to join live room chat.
						</div>
					) : null}

					{token && socketStatus !== "connected" ? (
						<div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
							Connecting chat...
						</div>
					) : null}

					<div className="space-y-6 mt-4">
						{messages.map((message, index) => {
							const previous = messages[index - 1];
							const isNewGroup =
								previous === undefined ||
								previous.authorUserId !== message.authorUserId;
							const isMe =
								currentUserId !== null &&
								message.authorUserId === currentUserId;
							const authorLabel = isMe ? "You" : `User ${message.authorUserId}`;

							return (
								<div
									key={message.id}
									className={
										isMe ? "flex flex-row-reverse gap-3" : "flex gap-3"
									}
								>
									{isMe ? (
										<>
											{isNewGroup ? (
												<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
													ME
												</div>
											) : (
												<div className="w-10" />
											)}
											<div className="space-y-1 max-w-[80%] flex flex-col items-end">
												{isNewGroup ? (
													<p className="text-xs font-bold text-slate-500 dark:text-slate-400">
														{`${authorLabel} - ${formatTime(message.createdAtMs)}`}
													</p>
												) : null}
												<div
													className={`bg-primary text-white p-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap ${
														isNewGroup ? "rounded-tr-none" : ""
													}`}
												>
													{message.text}
												</div>
											</div>
										</>
									) : (
										<>
											{isNewGroup ? (
												<div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-semibold">
													{`U${message.authorUserId}`}
												</div>
											) : (
												<div className="w-10" />
											)}
											<div className="space-y-1 max-w-[80%]">
												{isNewGroup ? (
													<p className="text-xs font-bold text-slate-500 dark:text-slate-400">
														{`${authorLabel} - ${formatTime(message.createdAtMs)}`}
													</p>
												) : null}
												<div
													className={`bg-slate-100 dark:bg-bubble-other p-3 rounded-2xl text-sm whitespace-pre-wrap ${
														isNewGroup ? "rounded-tl-none" : ""
													}`}
												>
													{message.text}
												</div>
											</div>
										</>
									)}
								</div>
							);
						})}

						{isRealtimeEnabled && messages.length === 0 ? (
							<p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
								No messages yet.
							</p>
						) : null}
					</div>
				</div>

				<div className="p-6 border-t border-slate-200 dark:border-slate-800">
					{error ? (
						<p className="mb-3 text-xs text-red-600 dark:text-red-400">
							{error}
						</p>
					) : null}
					<div className="relative">
						<label className="sr-only" htmlFor="study-chat-input">
							Message
						</label>
						<textarea
							id="study-chat-input"
							ref={inputRef}
							rows={1}
							value={draft}
							disabled={!isSendEnabled}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									sendMessage();
								}
							}}
							placeholder={
								isSendEnabled ? "Type a message..." : "Chat unavailable"
							}
							className="w-full resize-none bg-slate-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary rounded-xl py-4 pl-4 pr-12 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-70"
						/>
						<button
							type="button"
							aria-label="Send message"
							onClick={sendMessage}
							disabled={!isSendEnabled || draft.trim().length === 0}
							className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
						>
							<span className="material-symbols-outlined text-sm">send</span>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
