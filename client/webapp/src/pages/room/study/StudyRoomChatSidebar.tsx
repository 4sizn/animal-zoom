import React from "react";

type StudyChatMessage = {
	id: string;
	authorId: string;
	authorName: string;
	authorAvatarUrl?: string;
	text: string;
	createdAt: number;
};

type ChatAuthor = {
	authorId: string;
	authorName: string;
	authorAvatarUrl: string;
};

const chatAuthors: ChatAuthor[] = [
	{
		authorId: "marina",
		authorName: "Marina",
		authorAvatarUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGtlxIdZ6DCigRf3Dh6qYJAAc_9qh36Amm75FPZAnkenslQ_ITGEDPXzVMUWQ5dQpwJ5bgJDRuHzHb_TdV7_aZyk7KJEYKsvP_adkApCYAW1NTQrHvYHyIjMxveCUieMFhNdy4jAPL2lPG1GsGs8Iq-9DRSyw1Ee9N1E7NygE3qObUvmGCMeCo0RTy47vUMtpR0x-jNVpLipsZ1zxxjJv0E_Ifo0LeJSTy8UdsIq7fTrppZtH9fJgErAoCfVwHgyeP3bxDPi25oOw",
	},
	{
		authorId: "sam",
		authorName: "Sam",
		authorAvatarUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuA6fFbiEsl2ggrgWz7w3yHIIDCOaTwSgMSbl0EUdSkG_VJOrHuFPwstm1GE69CUl3Lz1FjYLvJ3M6XalgmUzrJsciVK0uCZtnXv4SP2XDe0FufuoXFo-tMq9LxnMi6nXwQdA-DFDeFY-Q4co10Q91u84FmfHugJkmGsQJSF6JVonrhLxlKYO4-VagETSWbikiihtU0J4il-9-1IhSUzGG2eoJXIr6_5hMozBtGDDHUQkGFMTxy6F-AhlrW1Yue-iJMq52EfLItlmak",
	},
	{
		authorId: "biagis",
		authorName: "Biagis",
		authorAvatarUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAdadjP9lUN-TEYcgvaMKakVoEjt5cXYvFPaJH90iV0_8NKk3E4r6vnFZhU9xGUEabov2fwjcKAf12ot4kGyt2i5RKZR9BO30RqAFuImVZ1mlVp_H25srG5r6RkWwl9Izmlvh-AKMgnxgWJNSZjryYxoQdR846pXAA1SijbvkyvLzXTSNLbGxKJ_Jq_ODhceOhNC7eGt95dIlmwYtGCJcSY9OXnMbp5RT7CJrVJcdW6F5HjjNlBhyCGlEZvM7E9VPJC77hl8PJyq1s",
	},
	{
		authorId: "liam",
		authorName: "Liam",
		authorAvatarUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAxt-gZckIOrgUHwcwhnNoB3v5KIjDe3PJ6izSg8xQO0_P8pg-53eXCZSKa5NA4uHK1cFTTm9WGkn1BDT_nfYcZDMZ2Jjkyr6XA1vaI0eOOZyo6tG6x4sHcNN4oIpsWC4czAAhmbF41aDjYms5ek0_h7woky6mY6RUF0SiwvLLjghPE1D4nNWlACn1oo-zJ-TVWXvOrrdi7cOnLD1e1f1Xc5ylunvm79-L9EQhSVzWHbkx5C-b-c2oEcJAy3gpxe97WHHNQVoIQWAg",
	},
];

const cannedTexts = [
	"What section are you working on?",
	"Nice - I can help review it.",
	"Give me 2 minutes, grabbing notes.",
	"Anyone want to pair on this part?",
	"I think we should keep it simple.",
	"Agreed. Let's ship a demo first.",
];

function uid(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomBetween(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms: number): string {
	return new Date(ms).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function buildDefaultMessages(now: number): StudyChatMessage[] {
	return [
		{
			id: uid(),
			authorId: "marina",
			authorName: "Marina",
			authorAvatarUrl: chatAuthors[0].authorAvatarUrl,
			text: "omg yes!!",
			createdAt: now - 1000 * 60 * 8,
		},
		{
			id: uid(),
			authorId: "marina",
			authorName: "Marina",
			authorAvatarUrl: chatAuthors[0].authorAvatarUrl,
			text: "I have a lot of ideas to share!",
			createdAt: now - 1000 * 60 * 7,
		},
		{
			id: uid(),
			authorId: "sam",
			authorName: "Sam",
			authorAvatarUrl: chatAuthors[1].authorAvatarUrl,
			text: "Same here, excited to brainstorm!",
			createdAt: now - 1000 * 60 * 6,
		},
		{
			id: uid(),
			authorId: "me",
			authorName: "Jen",
			text: "Great! How do you want to start?",
			createdAt: now - 1000 * 60 * 5,
		},
		{
			id: uid(),
			authorId: "marina",
			authorName: "Marina",
			authorAvatarUrl: chatAuthors[0].authorAvatarUrl,
			text: "Maybe we can go over the project details first?",
			createdAt: now - 1000 * 60 * 4,
		},
		{
			id: uid(),
			authorId: "biagis",
			authorName: "Biagis",
			authorAvatarUrl: chatAuthors[2].authorAvatarUrl,
			text: "Good idea!",
			createdAt: now - 1000 * 60 * 3,
		},
		{
			id: uid(),
			authorId: "biagis",
			authorName: "Biagis",
			authorAvatarUrl: chatAuthors[2].authorAvatarUrl,
			text: "What about you all?",
			createdAt: now - 1000 * 60 * 2,
		},
		{
			id: uid(),
			authorId: "me",
			authorName: "Jen",
			text: "Thanks everyone!",
			createdAt: now - 1000 * 60,
		},
		{
			id: uid(),
			authorId: "liam",
			authorName: "Liam",
			authorAvatarUrl: chatAuthors[3].authorAvatarUrl,
			text: "No problem!",
			createdAt: now - 1000 * 40,
		},
	];
}

function isMessage(value: unknown): value is StudyChatMessage {
	if (typeof value !== "object" || value === null) return false;
	const maybe = value as Record<string, unknown>;
	return (
		typeof maybe.id === "string" &&
		typeof maybe.authorId === "string" &&
		typeof maybe.authorName === "string" &&
		typeof maybe.text === "string" &&
		typeof maybe.createdAt === "number"
	);
}

function loadMessages(storageKey: string): StudyChatMessage[] {
	const raw = window.localStorage.getItem(storageKey);
	if (raw === null) {
		return buildDefaultMessages(Date.now());
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isMessage);
	} catch {
		return [];
	}
}

type StudyRoomChatSidebarProps = {
	roomId: string | undefined;
	isDesktop: boolean;
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
};

export function StudyRoomChatSidebar({
	roomId,
	isDesktop,
	isOpen,
	onOpen,
	onClose,
}: StudyRoomChatSidebarProps) {
	const storageKey = React.useMemo(
		() => `animal-zoom:study-room-chat:${roomId ?? "default"}:v1`,
		[roomId],
	);

	const [messages, setMessages] = React.useState<StudyChatMessage[]>([]);
	const [draft, setDraft] = React.useState("");
	const [unreadCount, setUnreadCount] = React.useState(0);

	const listRef = React.useRef<HTMLDivElement | null>(null);
	const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

	React.useEffect(() => {
		setMessages(loadMessages(storageKey));
		setUnreadCount(0);
	}, [storageKey]);

	React.useEffect(() => {
		window.localStorage.setItem(storageKey, JSON.stringify(messages));
	}, [messages, storageKey]);

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
		if (!isOpen) return;
		setUnreadCount(0);
		scrollToBottom();
		inputRef.current?.focus();
	}, [isOpen, scrollToBottom]);

	const appendMessage = React.useCallback(
		(next: StudyChatMessage, isSelf: boolean) => {
			const shouldStickToBottom = isOpen && isNearBottom();
			setMessages((prev) => [...prev, next]);

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

	const sendMessage = React.useCallback(() => {
		const trimmed = draft.replace(/\s+$/g, "");
		if (!trimmed.trim()) return;

		appendMessage(
			{
				id: uid(),
				authorId: "me",
				authorName: "Jen",
				text: trimmed,
				createdAt: Date.now(),
			},
			true,
		);

		setDraft("");
		inputRef.current?.focus();
	}, [appendMessage, draft]);

	React.useEffect(() => {
		let isCancelled = false;
		let timerId: number | undefined;

		const schedule = () => {
			timerId = window.setTimeout(
				() => {
					if (isCancelled) return;
					const author = chatAuthors[randomBetween(0, chatAuthors.length - 1)];
					const text = cannedTexts[randomBetween(0, cannedTexts.length - 1)];
					appendMessage(
						{
							id: uid(),
							authorId: author.authorId,
							authorName: author.authorName,
							authorAvatarUrl: author.authorAvatarUrl,
							text,
							createdAt: Date.now(),
						},
						false,
					);
					schedule();
				},
				randomBetween(7000, 14000),
			);
		};

		schedule();

		return () => {
			isCancelled = true;
			if (timerId !== undefined) {
				window.clearTimeout(timerId);
			}
		};
	}, [appendMessage]);

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

					<div className="space-y-6">
						{messages.map((message, index) => {
							const previous = messages[index - 1];
							const isNewGroup =
								previous === undefined ||
								previous.authorId !== message.authorId;
							const isMe = message.authorId === "me";

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
														{`${message.authorName} - ${formatTime(message.createdAt)}`}
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
												<img
													alt={`Avatar ${message.authorName}`}
													src={message.authorAvatarUrl}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : (
												<div className="w-10" />
											)}
											<div className="space-y-1 max-w-[80%]">
												{isNewGroup ? (
													<p className="text-xs font-bold text-slate-500 dark:text-slate-400">
														{`${message.authorName} - ${formatTime(message.createdAt)}`}
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
					</div>
				</div>

				<div className="p-6 border-t border-slate-200 dark:border-slate-800">
					<div className="relative">
						<label className="sr-only" htmlFor="study-chat-input">
							Message
						</label>
						<textarea
							id="study-chat-input"
							ref={inputRef}
							rows={1}
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									sendMessage();
								}
							}}
							placeholder="Type a message..."
							className="w-full resize-none bg-slate-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary rounded-xl py-4 pl-4 pr-12 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
						/>
						<button
							type="button"
							aria-label="Send message"
							onClick={sendMessage}
							className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							<span className="material-symbols-outlined text-sm">send</span>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
