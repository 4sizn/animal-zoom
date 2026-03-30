import type { User3DProfile, ZoomParticipant } from "@animal-zoom/share";
import React, { useMemo, useState, useEffect } from "react";
import { EMPTY, type Observable } from "rxjs";
import { getSessionsByDate } from "../../calendar/data";
import { BabylonStudyCanvas } from "./BabylonStudyCanvas";
import { StudyRoomChatSidebar } from "./StudyRoomChatSidebar";

export function resolveParticipantCountFromSearch(
	search: string,
	maxCount: number,
): number {
	const params = new URLSearchParams(search);
	const participantsParam = params.get("participants");

	if (participantsParam === null) {
		return maxCount;
	}

	const parsedCount = Number.parseInt(participantsParam, 10);

	if (!Number.isFinite(parsedCount) || parsedCount < 1) {
		return maxCount;
	}

	return Math.min(parsedCount, maxCount);
}

function formatPeople(count: number): string {
	return count === 1 ? "1 person" : `${count} people`;
}

const participantsFour: ZoomParticipant[] = [
	{
		animal: {
			id: "sysy",
			name: "sysy",
			imageUrl:
				"asset:personal-space/greenchair/textures/GreenChair_01_diff_1k.jpg",
		},
		mediaState: {
			isMicOn: false,
			isCameraOn: true,
			isSpeaking: false,
		},
	},
	{
		animal: {
			id: "oliver",
			name: "oliver",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBmcaS74PWd0rNr9CGpEQir3JgAYDE7iccJh_NeGtqxyRzU7vnl8NwP8BsSCsQa0QtLVMq_F8Yeura-L9z4rhHnkfn9SV2NHqtxIiR03tHwrrxknjVu4o5wpytv9VZ3VgIkjaAoP8s1bspmL_MXTZ0z6S8CuY1Guh_VJyyAq1zEWB15URkTTvnIrIGKyK5ZMPLC2Pb9e23MT4VXNKJPlpwSmsY20IIcVr3lB2GNSaX-AhUdw5XSLRnsXFWWg0Gij-YaBugTADDB1_TI",
		},
		mediaState: {
			isMicOn: true,
			isCameraOn: true,
			isSpeaking: false,
		},
	},
	{
		animal: {
			id: "octavian",
			name: "octavian",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuAVCIibKgC-GBiLcHvcjyH95CBclFzPN5P2IvPpX2yKIK8Y-OZhxPF3cw2aBS6d4XKfmppjbv_Ri6xXKttyRoY6G2-dhQ9_bgilAH1e1GeoXTQ4YWGbOw0nhajsZ0yiKj5C3eVknZ0iVb9vwU8HybcywLJBx1MDetFArO17ntyTIk6ckKNtVBXu2GeyCh8lEDvCG79OHyoFWxBgchei-T91ID4NkjLbdLrO5CGFfiBk_he1RSXiLVCmNy7AZZT32yHC04dxNArWsnOr",
		},
		mediaState: {
			isMicOn: true,
			isCameraOn: true,
			isSpeaking: true,
		},
	},
	{
		animal: {
			id: "jen",
			name: "jen",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDms0lWuqK38hp8fHBpeISQvRcc4D7xK_LUNDjeZPHEhIxyFgVVgKMjLmXvYfUv-F2MSKNIwuKg9Vy9KMo22hFlgGmbIwOLp3NFFkzWXqh9iFx3uoqCNcylMt4H24LBv6p55O_oBT5hqd8FuJT-FI4Ndiwt4r0rCG0v_zEfwX8auOWzQzNtVdA6CzOQgvuy6ac3VNCAJvksERD1UVAXoPK0En5QJfqEraZOszQFSEgRlhTzkWvcEoRFluOBukG00cDREGIt_kQT5wSf",
		},
		mediaState: {
			isMicOn: true,
			isCameraOn: true,
			isSpeaking: false,
		},
	},
];

const participantsTwelve: ZoomParticipant[] = [
	{
		animal: {
			id: "sysy",
			name: "sysy",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBk5iyqtnoYIrA_V2nvDFw4KIUwPqP_67ZNsmbIYGbv3PexsTJQYB0kII33vxonc93Z8S_A9lgfnt3k9pa5PW0zi_m3sEsIflxFTgRbGqUPrxMIxTPQX2iQPvZAir6pdx-LwmVyv-Jvs9YZ_D7HyWbbG5tYLp3_BCczZ4GqQUdh3rK5uYF1jc73PRO4ZLeLxJrv4T4glpHVgoGb0kK7QzggI3DlKz0FQiV4ePm2z_qmA-rGrYMtCOtCzA16cUloMd8RMklZEKfQYFSn",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "oliver",
			name: "oliver",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCRS10DiFYMtIEwM-VSJ00LwlTaNRoDBbDLL4vl_axiKLT-39cj9-V190YMaiaMpMLq6khPIzXmPfd3W97SbcvZ5HvxIwFIBgz5oLtf-6fPDF7VXv9KUk-6YGpZLtlbDfXx80Xeuez9vo_mpqHZDfRGqdGXogehRdVWbfXj65pacM7egsUwhIkVTq6ueZjQNFrfONDDgpQ1TXx1Z2_ljtjKDc6HqdlHY9tynPUliylMyEnSZJLODkNKQbfDs6EGsAFe1bbsHKRtAAW1",
		},
		mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "octavian",
			name: "octavian",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDZ2EJ8WdxSRz32j__YMXYiHEANLzngLE7G3aydsV7UfD5bzuELJjOe19ty3E8rbdo51QSX-iGmkhBmJ8QqRTw171Y7O4WFDL5b91dYrXjjVoQApQdTXWD9hwtAAQG5SgKILfWFTZJ5tLMHKneGEbZWBx2xjIWYw7sOTo4i5OrlNvUw1XLfwJGV3hRSmP-PTatUc66i_9uFkIAMs5liYqQ-5Gpq7wz0Ob8g6zh9bq9_mOBWR58wINuSWSApG0EB23MtWrnErtNaHzKz",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "jen",
			name: "jen",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCiAQmm-iEXfsKmAuAfpqK486B1WjlbQzRkLm53K8k_Rebe5YljqShPFUIvYjrStI0jE_X77SQ2-u_2ozWjPPrFK3eelcsYJi5gRlD0Vdx0D6FqW_odJJb8xBbRuemdsPc4ng6IaTcaV0uVaKOqccHGJmqvBTyD0rShvF4U0-WReE0ulkq_YWPOHW3Fq2dG07rZ0-yIPUO2OR5iWqT0s_NI0aSLJf2chwzzVY0smAVu4HOZq2sh1HSNSvjM10yOuvY4srioCzQsYddw",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "mariana",
			name: "mariana",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuA1qtUdMD9K0EEuVleBBYoGTFgyT1Gth-jJgly_rS5sTAysKjQvCw6F5m2WzG6vfBAnDNXlZ-Pc1fuqgXtO9O9ZohSbErHFiHX_JAJQzjyiOE-aQ-Xjb0BZzGU1QomMNPOHq_YcuzhJvdcMXzCw3jYOtd_m67r5e8j1ydNqMz93O_kyOFjZIcWVPWNKliW_6iuLdpwkPHAqNTmHiF354XzjFXyMZNgAu3_51p0zP0T8wBnHf04NbzgTus_9vKs7LPMrDiZRFyvVKhj2",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "marina",
			name: "marina",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBdMuUeRjsjIg9_M3J_w1DjaDWvGRwy7Zdq_pIEWkn5kXhp2Ve_yg3t6WjszU0QmKu8feFt-rZNRNJhwI2DYeNNPFi5ZMZtIDSY9zQz75wtLLU8cQzVeqi2MLgEcbN2zd97cwuOELptrwlMMXkUdjMGtPdKsxicvJfIHru9wVtHQKWexzEgDc6yHZ8tZfZNlnj-AA4WkZg-oed1it_hg5dzPfMD97fkDmn53d9ILRLuAh0MGE32eOzBrEjrN3YYIV3DFoIhZ_Dp1Ou3",
		},
		mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "renise",
			name: "renise",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBRLsnGL1Yt6y90Q1xunrO5hqkA5jTiDEm4WJruqN-ut8gTe3xeMRirux6rd_7jJA5a4P3nAxCRQL7u3ThzE_Gx3jechRiAi8DLQ0mhbiOiOrJMfXkVM-PfzV_ZRIv2_D5H1ieRt4rO_I0FFANZbRYKb-hzOlFnmyfXvO7l9vHk06eM12P6RUlc9UJVXOOJ7Cxr1bHS5-MU4FsV9_wWfcfYMRDzOuUY5jtAb-fmPqzswA0eFpAo3bMDp1nF0nBzO0I7LNGY9aRGlGqf",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "gloria",
			name: "gloria",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuAUOvk1GeONHAWV1dgl7l3tolNjslpCaF5qE_87_1F_YYj3UK1TQLWMAHpnvw51CRXQDvqGApMmQzwe__3jfYyP2sONNCKmz6B37mSvgiEG_dMhKZW-6RH9CiNZSTBMhcwKicxxVIIhso1j84JvqAbqUsibAzYU7cX2lW6_B4ANCaC1JbOYJMIoTSaQzKpaixNQU_edVjYvQKbCvDNqWzFrhMGTsRTN0cUIthR3S4s5TCd1jzKbjjCUxdZ0iFcuGTzNFVqQ8I1cfTHB",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "cleo",
			name: "cleo",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDv_F44U8ybC-iyeuYWlhaREtjg_m9cMnF8Y-x1r6DxD4_b3QDvNgj8XOqfFtooT6-d4yahQSj75n0t8vQQuoUsYqG46PaqOb9Zi4SmMY0o_sP31hbM7fKvCLO2RTJNd8vLsvPVLKt4z4YPzEgQbZnBxNVyCtk57ihzdRUomo-DYpVVvG1LERJUXR_FTaQD0tD2Yd6hhI6ut7ql4Xh61j51Yn9B4QaMWo1XO1qfWWYuJgp7h8Pgy2FRBJi-jsiJzxbU7mIvFsvqfrlE",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "ruby",
			name: "ruby",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDvnB5r4vlPYqSDAJNtdmhdRKM0jl2V4sCRuIm3w4pI0Mgxftl6o5SBDsDwbyWxxtufM2H_R8ynHdFQqoPVmjLtfpAWpiaruuR2gDtJ0ifZ3hKZCd6Hnua_Mrn0Msjrps4s6mATWtFVqlo-GDcjpVC47OYoRi3ZVZj1upu4nU66yOq696lbxANdlMEu6_Nbc-ox7gQ3nLO5VFet-zXrzKwwxiEQX01wBCzKv4A32nGTyV7Fy0XDgdAbUw99EYdpeAE7ivPNL5fy56mV",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "stitch",
			name: "stitch",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuAYp29-B77H-UvesrBauQM03Ub6d17EfQHtMDX3JJk8P7prH5_WATRD-fFkdf7n4EwA_Jg7BD3rOLqzLg3rgsyTjJt-pAF77CPYSmY0wvxY7FCWW4xVD5ZMksVaH7dYuDd4dfXNstaDHkMTycVNrcU5W9M5DR8mKVmwR1TF_uDQvnvbvbDeMpzXzK2nPbmlKquZOg6J0HpeT0WbC_V4PLKt-NuDaiO8iQ6BWSXJRaHxHiY8OldmAIBoB-VEAuJVoitSZzMy_JXneWBQ",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "tulip",
			name: "tulip",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDmF9sTTZUEC5uvifL1fer-VPa1lNmMhSaBdSictpVqL-v25wX1AXjOKcD-zktcCsZJsd80GK2t8QcfkVVY1fV8qrsUGec_jSrRMG_g4ZRG6XogF359TTOdv9GIaZpN9Cb7UVokuRuutv9_OQ2KkqhwBLsWVI7tcROAv_YWddybPTASBW8MiMPqcrNBpLg6PXWgTQF9Dlfq4cffMis_UlzTFg8edbSrakVIUsfMobbg1YwsfSiQeZ0jj_0Q7Y8zhnLNEKZeRRUJjefX",
		},
		mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false },
	},
];

const participantsScroll: ZoomParticipant[] = [
	{
		animal: {
			id: "sysy",
			name: "sysy",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDXG9zC0j7rigvZuAL57VV1D9W8UAwbZQpLfJ_ZXqYKJGfxljV3bhmz9_9LMcLqqh1pAzKEHz-FmeNDlvF-uL2fNp-o4E8OdR5WokqZclp58_U8s-YlMS0KzQrd-sGTZ8AfZZ-E2st48Q2qe_-QhfwLMhcSetrW17vTm0JwdEOVevMFuGWJrGl5I4f-9is7CODthPn1ppJwxMWJTYfrUZQsuLd_bafyH0Mfc92h8tUHxSElBp8yKJckNxTosybDXbqhmv-7KTgktxr3",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "oliver",
			name: "oliver",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDyAlj1028Y10hE4XA6i6amd4zRWsUERc1DBiSEigEZNs8NqKdcYlm-dSuOpD9SWlBrxOkDApTSWsAHeqqabD6s7zMDenp73RyRQAjxthHRDMje85_1ZlLMbOXR4sPiKjx4lHjrdHDS0-vwy9ZnGlK_XTuML4wXPrCIu9CJmMkR6oX8uL2kbmxdhqApjUETKBSfY1K_5qQQ5HVT_urtE_xTularExL908QppnpaZR0dggF-IkK86_y4zMJiZcIiE4uCNDxXSCgeJyoB",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "octavian",
			name: "octavian",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuAlLHgGzIZpxsbUb3dO9TjQr2GMnTsaJ2lEog7s5ZMpBXOpUV_8DrCe7ljz4OtzecNTs0NgyQrKKIQuHfxeSGsD0ng9aYyM-i0Rty9vF3KWIoilPAzHNLxIuAbr5Fm3_6B_8Nkh7EXjgD6zKfkKUDmc4fIn7dLyhblQJ3EWpSybZjG_m8SW4oNchVI2L9J9LVJDXP6e1IKbRO5rVnqNVtv7Lk6exnFHo-_Nht09CUSq_gBbhOla2HGqzm02oPL4hQ8aKWFiMBDSVfkK",
		},
		mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "jen",
			name: "jen",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuA9Wg24IbSw7c3Sh-4CGMgCiO5YNzvxknuQC0en6W27aqE4uLo5LEcu6irIh7bonGCn6SHDCyZFQRz1KHG1yEyyRDcrRCJwalgdSRJ9JOH6qDForD3qXsNH1epz5D-tHKWSPbgSbaWEzT-S9OrLIBnzrxLJEHjSCYAX8APDulcOyUf8yhJUwkV8kHYsSpAzxEsZQK_YFmL15eamtQB_oeqpeLStaqUAtggyR_JbO5VZWDOORXlK7hX1sUT0Lf81DDYBFuzQUxeqHXZ-",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "mariana",
			name: "mariana",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDe8PP8Tm-1TXag-6lcPonz0Zsd1b9ZF82wnq23n9IEc_Iy5BCkZUSBxObcPLhkJVofKIjMdDfR6UWVA_kj8naDuy-SRS6LRGKzCNdVABNTveezwE4xo4lEkiIZhQFbzxIbciiFoVGp7Mjnwumi-baqO1L6mzFwUH3jr88fjTWZYUO3y8h6iJP0WHxvub_L8iTTA8IWmHtFyQnjYYmk4h3j6k5ljjVX6J3pWrxv6VmVslnMJ9J0vHroko2SO7ocgTaLbwHyeo2sKdEq",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "marina",
			name: "marina",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCZCS9QuLP-lryw5OAgqMitJ3vWjxs7ci0bD0dTWguY8ETFFAHQ8yiS0l-PyhML7xbZuzfWOuKUyGToWHUyNWJgSpG6gSTHQaLcFczLEftmTXfB4F-ks5q5p6UNwz-Ct2A43BMWyV4NLJp1g_uFy-8BOUH2opXhj8l405qXUIhxFb4oYtTTQEymoO-UtY1UIhnUw7BKYE7uTiqP4wL96rD9wbqGBNOL3e80scmDfHzpuByMCWZu9P-hkRq9J8I5m8A1ti9Y5S10RyXa",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "renise",
			name: "renise",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBx631F1-l_5FxTCYecADAizYXW949ONrIidbD4ck02gkta7a8Paow4FKSBBk7r_S0gbGU-Ktqp-V1BOf2HlejEIavgwUDBLxGg4oKO4LyVP9NyxzhxnScP_tuVPd0EU1l3xMEO9uNy3vmO6iQ2mPOpR0Xz-3XIav5uCWiuvqvj6INLPS-ZizSoz8P4UQl7B_AJK8HlAIBImCR87H7ikFU_k564WS0iPqT-LqunpxtlUOoLSd2--iMRohFGxcPjCopocJ222U3HErlX",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "gloria",
			name: "gloria",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDot3AQJ8DwrJB59oh-77THvIg3hIGmQ9JwolhR80514p06qeMUg-k7jAZb-yN6EkFQNWrySUNAdJ3nwO0aiKVuWVuhCyqhY-AQxU7EZXlveTkvVyvaL4wT6sqt5bmrU7Q8HvkQxNezgl7c7tWt1MEY_m9AnqQbqOQ1zJvPTHpxozYSSOmpidRctDtH-qf-EaHSUo4A64fbeoWRrqeZa4DI8FtkDDHAJ_81GIBMJC5FI3RBnF8fKrIVNwwfMZL8n-HDYWUOlukYlXk0",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "cleo",
			name: "cleo",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCnWiMaTXsbGKKuSsdTM7cWPkfUtC9HPLI5GDlFbQNF0bJdAxta7HwTPvhmZ9o7O-elGKQcygNyqPIt5jSTagh8k35Qxbeh8y7nEPi2P2KRNKS8jhYXZCEBGyq3BwT6mAr2zt7eWSDG9rpTJ8i15IfgR2f31sw9FzlMCiwfN9AWk8nEeRm8ggMaXozMZpaXAHCmQHnNP3QpOMOeDnxx4u0TgrpX_8NCcUaFMmpNhD367UdcwyzP0e4w4N_lGVjpDJJQrMPp1_45K7Du",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "ruby",
			name: "ruby",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuATs0_AN2iGT73Z43Yo-1kUveXgkWNQ3D2qHzza90kYJQczn5X9-3HuG9sGAegPKNRH4iOqKt37ODHNGvXz9Yegc8gsj5Pa0-9ZibpHHmlsVD7V_I-vF3R3TdnKoykH_rH6vFQDK687YpXDM_Lyg68dkvX3OcALM-Yivh3qC3TdGqqQ4ZlMnPT3MkcUprewJT8NlYEEhjk1lUAjpVPR8UPQ2xbevdl8KOI-2ElWy28MHeKkz1gVGERPayjNb-WYjngj5NyggjYNhzhi",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "stitch",
			name: "stitch",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuAlbzW4kmhmDW7_GM6FbXZw1iXhdVvqFUL8z1uwc9lSK5t4Y8Qd94gYiPZeyki5VnF1To6B1ZxWNpCofRyfwILB4QNnFq5ASCW1DR_O2qWuIV09Y6RiSYbBZl_AHcsjjxVnbXCmiRwSHj9KQw00jRAneXitqCxUdgLCS9U3kMfEPF5PIznj4OQAF3rH8ndWaqflSDECIT4yguq5FNn5X5zliFeONQUy8fZDEaUeGtswSW6BRXxeWyfcbRrxHfWr6YfW5GBPycAGUT5u",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "tulip",
			name: "tulip",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBiF4G-HnNADm6ID0kli82aJ1NY2DpRzeiR_wnmMRckF5Vh8T7pkPHfUwU9P5UpbG_-vxuE5Fb0XiahNman6e8HmpCQ9A-GUc0sb7FbsIKatfTMvk0qGuqhSK0haf_U5AN3TkjKPd2wCLLsQRH27k1yJO6p_eVQn_HcQ8az2gf2XPKI2Qa60oAryANkpztrDZOZjZ6lDnq3u9OwgWexvBjfa1ht3Etxz9G9QcoEF3mTYUhWjY9oK_cGBUY30H1vXbtH77uxOCS7VF2P",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "apollo",
			name: "apollo",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDb0Uq1bUAMyTVHyoXeH4aQOTIeIMggHYrxDg3mlDoGvp68yvZkv2dmcRIul5HGFw23m9lAbOVP4wTLkj-3IrklxUFC9xRayAOkC1kIgjA6nFRKWowixJWMj-1O3P0gPNrFLXsZsMRgWXdt_hu36jB3hWzpKddlEOPl0zmP0sRDfPOQ0Bn-9D3xXWNhcmTyLX14DeNheFmLng5AIwJsCl-tXNneA5I8KzshSNBvk773kvY-tscSFY9VIYi7U4YkVlQER7UiUfuGwIxQ",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "fang",
			name: "fang",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBpG0xNdU4LwnbvITx3xHHZJpCitrFc99hSTcdMPbAylfVK-H0TVynTQWkLuUi2XtRkMkvmCF5l8whEdCWTATWE7hg2njeGdsJNvEumK0cbHJIJc0NWlPWmVRjNvgFBQB8kcRE4_vkcbdqLq7jtPYNuQFKXhLqZJawHlwuftgfNvogAxvC7oD1Bcw5jFvbbvzJMsL_Ia-WmjCK7i8lPyKAWpj2MRp0xCF6d6fvdLhQNW25MI9vHSRS7zNDBTN8Z1WpUN0GPofRBGCqT",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "whitney",
			name: "whitney",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuC28TwGESoio0Su0spLwe2ANALS_oGn_ouDLrVseXE08Bd8dKjSECkTb5jwsmuJEOEbKxnS9pcmz2bi1kCNbFYDVLQugovybXCnMxQZzty7uo3aA_HS7K4ftdGe-ByQymeLD4eGepRM7DTx8yOR-OE8_S0sQN3AxVAlSFDqym4o0zxGvWhqtauE5yWKUQyKVUuIW84Okukzwhkadn-Fuc4nbvLg8FaLLgQGuk-mFBZ77rNOd_CqSvfeOeMr0GD0eAoTeIEKmzXBZfWs",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "beau",
			name: "beau",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBRXtikgEASNRA4nIy9k7v7CyQZR4KYoAEjiirTgfevUnfWJ-J7uc-ESC98zx1XXjlGwgoEcCr38Qa4EP5kqw5Q521K7UP0xKloKUnK1iqXmzGeT0u6WYAk5oR4My8XWne7kxqQA6Zx1H29oaaI5ir4uSLeypqZEp6srJ1oDNPoMYXlRmfeOGtSyLTx5OB7fLY4ff5rdfUaTvxDsZuyTHS_67XJuWqvWnPVgldaSXA71Kqco-OnMATn4Xo4q5v_M366pk15CM0sf8jy",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
	{
		animal: {
			id: "fauna",
			name: "fauna",
			imageUrl:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuD460d17wzkfujAzHnpaxW_xDZHNGw05_Mylal_NS5k05uPgtv9sgj4FQGrvfo7ANd4wOJluGwqjElyQrPOvkhuY2Az1RWAFF7ntqy15zfLtpeKnJRi-iLpbYjrzTun9m-rstxVb10YZQ2WX96pQt83K4FBibvWPI_117pj2uLGknvjpoxRoM_c1m8uuoLuabumu5mBfj2y_7JjvRGiF74Dro3KGKhj-Iq_Jka3srvm7WJAWLC-yI50efj9ayOrT8XvKk3LkTfBmewE",
		},
		mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false },
	},
];

const twelveAltById: Record<string, string> = {
	sysy: "sysy's room with colorful decor",
	oliver: "oliver's aesthetic neon workspace",
	octavian: "octavian's deep sea themed room",
	jen: "jen's modern minimalist room",
	mariana: "mariana's cozy ambient lighting",
	marina: "marina's pink aesthetic room",
	renise: "renise's galaxy themed background",
	gloria: "gloria's elegant victorian study",
	cleo: "cleo's artistic abstract background",
	ruby: "ruby's serene space themed room",
	stitch: "stitch's playful colorful bedroom",
	tulip: "tulip's cozy reading nook",
};

const zoomEvents$: Observable<unknown> = EMPTY;

export const MAX_ZOOM_DEMO_PARTICIPANTS = participantsScroll.length;

function FourParticipantLayout({
	participants,
	participantCount,
	my3DProfile,
	isStudying,
}: {
	participants: ZoomParticipant[];
	participantCount: number;
	my3DProfile: User3DProfile | null;
	isStudying: boolean;
}) {
	const isSingleParticipant = participantCount === 1;

	return (
		<div className="bg-[#1a1a1a] h-screen w-full flex flex-col font-body overflow-hidden text-white">
			<main className="flex-grow flex items-center justify-center p-4 lg:p-12 w-full h-full relative">
				<div
					className={`grid grid-cols-1 gap-4 md:gap-6 w-full max-w-7xl mx-auto items-center justify-center ${
						isSingleParticipant ? "" : "md:grid-cols-2"
					}`}
				>
					{participants.map((participant) => (
						<div
							key={participant.animal.id}
							className={`relative group rounded-2xl overflow-hidden shadow-2xl aspect-video-custom bg-[#2c2c2c] ${
								isSingleParticipant ? "w-full" : ""
							}`}
						>
							<BabylonStudyCanvas
								participant={participant}
								my3DProfile={my3DProfile}
								alt={`${participant.animal.name}'s video feed`}
								className="w-full h-full object-cover"
								isStudying={isStudying}
							/>
							<div className="absolute bottom-4 left-4 z-10">
								<span className="text-white text-xl font-medium drop-shadow-md">
									{participant.animal.name}
								</span>
							</div>
							{participant.mediaState.isSpeaking ? (
								<div className="absolute top-3 right-3 z-10 bg-blue-600/90 backdrop-blur-md p-2 rounded-full flex items-center justify-center animate-pulse">
									<span className="material-symbols-outlined text-white text-[20px]">
										graphic_eq
									</span>
								</div>
							) : participant.animal.id === "oliver" ? null : (
								<div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-md p-2 rounded-full flex items-center justify-center">
									<span className="material-symbols-outlined text-white text-[20px]">
										{participant.mediaState.isMicOn ? "mic" : "mic_off"}
									</span>
								</div>
							)}
							{participant.mediaState.isCameraOn ? null : (
								<div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-md p-2 rounded-full flex items-center justify-center">
									<span className="material-symbols-outlined text-white text-[20px]">
										videocam_off
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			</main>
			<footer className="h-20 flex-shrink-0 grid grid-cols-3 items-center px-8 bg-[#1a1a1a] z-50 mb-2">
				<div className="flex flex-col justify-center">
					<h1 className="text-base font-medium text-gray-200">
						group study - day ten
					</h1>
				</div>
				<div className="flex items-center justify-center gap-4">
					<button
						type="button"
						className="w-12 h-12 rounded-full bg-[#EA4335] hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95"
						title="Turn on microphone"
					>
						<span className="material-symbols-outlined text-[24px]">mic_off</span>
					</button>
					<button
						type="button"
						className="w-12 h-12 rounded-full bg-[#3C4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition-all active:scale-95"
						title="Turn off camera"
					>
						<span className="material-symbols-outlined text-[24px]">videocam_off</span>
					</button>
					<button
						type="button"
						className="w-12 h-12 rounded-full bg-[#3C4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition-all active:scale-95"
						title="More options"
					>
						<span className="material-symbols-outlined text-[24px]">more_horiz</span>
					</button>
					<button
						type="button"
						className="w-12 h-12 rounded-full bg-[#EA4335] hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95 ml-1"
						title="Leave call"
					>
						<span className="material-symbols-outlined text-[28px]">call_end</span>
					</button>
				</div>
				<div className="flex items-center justify-end text-gray-300">
					<span className="text-sm font-medium px-3">
						{formatPeople(participantCount)}
					</span>
				</div>
			</footer>
		</div>
	);
}

function TwelveParticipantLayout({
	participants,
	participantCount,
	my3DProfile,
	isStudying,
}: {
	participants: ZoomParticipant[];
	participantCount: number;
	my3DProfile: User3DProfile | null;
	isStudying: boolean;
}) {
	const displayedParticipantCount =
		participantCount === 12 ? 13 : participantCount;

	return (
		<div className="bg-charcoal-dark font-sans text-gray-200 h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white transition-colors duration-300">
			<main className="flex-grow p-4 md:p-8 overflow-y-auto flex items-center justify-center">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-[1400px] h-full content-center">
					{participants.map((participant) => (
						<div
							key={participant.animal.id}
							className="relative group aspect-video rounded-xl overflow-hidden bg-charcoal-light ring-1 ring-white/5 shadow-lg"
						>
							<BabylonStudyCanvas
								participant={participant}
								my3DProfile={my3DProfile}
								alt={
									twelveAltById[participant.animal.id] ??
									`${participant.animal.name}`
								}
								className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
								isStudying={isStudying}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
							<div className="absolute bottom-3 left-3 z-10 bg-overlay-plate backdrop-blur-[2px] px-3 py-1 rounded-md">
								<span className="text-white text-base font-medium tracking-wide">
									{participant.animal.name}
								</span>
							</div>
							{participant.mediaState.isMicOn ? null : (
								<div className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
									<span className="material-symbols-outlined text-white text-[16px]">
										mic_off
									</span>
								</div>
							)}
							{participant.mediaState.isCameraOn ? null : (
								<div className="absolute top-3 left-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
									<span className="material-symbols-outlined text-white text-[16px]">
										videocam_off
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			</main>
			<footer className="h-20 shrink-0 bg-charcoal-dark flex items-center justify-between px-6 md:px-10 z-50">
				<div className="w-48 hidden md:block">
					<h2 className="text-base font-medium text-gray-200 tracking-wide">
						group study - day ten
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="w-11 h-11 rounded-full flex items-center justify-center bg-primary hover:bg-red-600 text-white transition-all duration-200"
					>
						<span className="material-symbols-outlined text-[20px] filled">mic_off</span>
					</button>
					<button
						type="button"
						className="w-11 h-11 rounded-full flex items-center justify-center bg-control-bg hover:bg-gray-600 text-gray-300 transition-all duration-200"
					>
						<span className="material-symbols-outlined text-[20px] filled">videocam_off</span>
					</button>
					<button
						type="button"
						className="w-11 h-11 rounded-full flex items-center justify-center bg-control-bg hover:bg-gray-600 text-gray-300 transition-all duration-200"
					>
						<span className="material-symbols-outlined text-[20px]">more_horiz</span>
					</button>
					<button
						type="button"
						className="w-16 h-10 rounded-full flex items-center justify-center bg-primary hover:bg-red-600 text-white transition-all duration-200 ml-1 shadow-md"
					>
						<span className="material-symbols-outlined text-[24px] filled">call_end</span>
					</button>
				</div>
				<div className="w-48 hidden md:flex justify-end items-center gap-2 text-gray-400">
					<span className="material-symbols-outlined text-[20px]">group</span>
					<span className="text-sm font-medium tracking-wide">
						{formatPeople(displayedParticipantCount)}
					</span>
				</div>
				<div className="md:hidden flex items-center">
					<span className="text-sm font-medium text-gray-400">
						{displayedParticipantCount}
					</span>
				</div>
			</footer>
		</div>
	);
}

function ScrollableParticipantLayout({
	participants,
	participantCount,
	my3DProfile,
	isStudying,
}: {
	participants: ZoomParticipant[];
	participantCount: number;
	my3DProfile: User3DProfile | null;
	isStudying: boolean;
}) {
	return (
		<div className="bg-[#202124] text-gray-100 font-display h-screen flex flex-col overflow-hidden transition-colors duration-300">
			<main
				className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 lg:py-8"
				data-participants={participantCount}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1800px] mx-auto pb-32">
					{participants.map((participant) => (
						<div
							key={participant.animal.id}
							className="video-tile bg-surface-dark rounded-2xl shadow-lg group ring-1 ring-white/10"
						>
							<BabylonStudyCanvas
								participant={participant}
								my3DProfile={my3DProfile}
								alt={`${participant.animal.name} avatar`}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								isStudying={isStudying}
							/>
							<div className="name-overlay absolute inset-0 flex items-end p-4 rounded-2xl">
								<span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
									{participant.animal.name}
								</span>
							</div>
							{participant.mediaState.isMicOn ? null : (
								<div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
									<span className="material-icons-round text-white text-sm block">
										mic_off
									</span>
								</div>
							)}
							{participant.mediaState.isCameraOn ? null : (
								<div className="absolute top-3 left-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
									<span className="material-icons-round text-white text-sm block">
										videocam_off
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			</main>
			<footer className="relative flex-none h-20 bg-[#202124] border-t border-white/5 px-4 md:px-8 flex items-center gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
				<div className="hidden md:flex flex-col">
					<h1 className="text-base font-semibold text-gray-100">
						group study - day ten
					</h1>
					<span className="text-xs text-gray-400">01:45:23 elapsed</span>
				</div>
				<div className="flex flex-1 items-center justify-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2 md:flex-none">
					<button
						type="button"
						className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EA4335] text-white hover:bg-red-600 transition-colors shadow-lg"
					>
						<span className="material-icons-round text-xl">mic_off</span>
					</button>
					<button
						type="button"
						className="w-10 h-10 rounded-full flex items-center justify-center bg-[#3C4043] text-gray-200 hover:bg-[#5F6368] transition-colors"
					>
						<span className="material-icons-round text-xl">videocam_off</span>
					</button>
					<button
						type="button"
						className="w-10 h-10 rounded-full flex items-center justify-center bg-[#3C4043] text-gray-200 hover:bg-[#5F6368] transition-colors"
					>
						<span className="material-icons-round text-xl">more_horiz</span>
					</button>
					<button
						type="button"
						className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EA4335] text-white hover:bg-red-600 transition-colors shadow-lg ml-1"
					>
						<span className="material-icons-round text-2xl">call_end</span>
					</button>
				</div>
				<div className="flex items-center">
					<span className="text-sm text-gray-300">
						{formatPeople(participantCount)}
					</span>
				</div>
			</footer>
		</div>
	);
}

export function ZoomRoomExperience({
	roomId,
	participantCount,
	my3DProfile,
}: {
	roomId: string | undefined;
	participantCount: number;
	my3DProfile: User3DProfile | null;
}) {
	const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
		if (typeof window === "undefined") {
			return true;
		}
		return window.matchMedia("(min-width: 768px)").matches;
	});
	const [isChatOpen, setIsChatOpen] = React.useState<boolean>(() => {
		if (typeof window === "undefined") {
			return true;
		}
		return window.matchMedia("(min-width: 768px)").matches;
	});
	// ── 뽀모도로 상태 ──────────────────────────────────────────
	type PomodoroPhase = "idle" | "focus" | "break";
	const FOCUS_MIN = 25;
	const BREAK_MIN = 5;

	const [pomodoroPhase, setPomodoroPhase] = React.useState<PomodoroPhase>("idle");
	const [secondsLeft, setSecondsLeft] = React.useState(FOCUS_MIN * 60);
	const [currentTask, setCurrentTask] = React.useState<string | null>(null);
	const [completedRounds, setCompletedRounds] = React.useState(0);
	const [isPomodoroOpen, setIsPomodoroOpen] = React.useState(false);
	const [focusInput, setFocusInput] = React.useState("");

	const isStudying = pomodoroPhase === "focus";

	// 오늘의 태스크 목록
	const tasks = useMemo(() => {
		const today = new Date().toISOString().slice(0, 10);
		const sessions = getSessionsByDate(today).map((s) => s.roomName);
		try {
			const raw = localStorage.getItem(`today_focus_${today}`);
			const focusTask = raw ? (JSON.parse(raw) as { text: string }).text : null;
			const all = [...new Set([focusTask, ...sessions].filter(Boolean))] as string[];
			return all.length > 0 ? all : ["자유 공부"];
		} catch {
			return sessions.length > 0 ? sessions : ["자유 공부"];
		}
	}, []);

	// 누적 공부 시간
	function accumulateStudyTime(minutes: number) {
		const key = `study_accumulated_${new Date().toISOString().slice(0, 10)}`;
		try {
			const raw = localStorage.getItem(key);
			const prev = raw ? (JSON.parse(raw) as { totalMin: number }).totalMin : 0;
			localStorage.setItem(key, JSON.stringify({ totalMin: prev + minutes }));
		} catch { /* noop */ }
	}
	function getTodayStudyMin(): number {
		const key = `study_accumulated_${new Date().toISOString().slice(0, 10)}`;
		try {
			const raw = localStorage.getItem(key);
			return raw ? ((JSON.parse(raw) as { totalMin: number }).totalMin ?? 0) : 0;
		} catch { return 0; }
	}
	function formatSeconds(s: number): string {
		return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
	}

	// 타이머 tick
	useEffect(() => {
		if (pomodoroPhase === "idle") return;
		const id = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					if (pomodoroPhase === "focus") {
						accumulateStudyTime(FOCUS_MIN);
						setCompletedRounds((r) => r + 1);
						setPomodoroPhase("break");
						return BREAK_MIN * 60;
					}
					setPomodoroPhase("focus");
					return FOCUS_MIN * 60;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(id);
	}, [pomodoroPhase]);

	const onTogglePomodoro = React.useCallback(() => {
		setIsPomodoroOpen((prev) => {
			if (!prev) setIsChatOpen(false);
			return !prev;
		});
	}, []);

	const onToggleChat = React.useCallback(() => {
		setIsChatOpen((prev) => {
			if (!prev) setIsPomodoroOpen(false);
			return !prev;
		});
	}, []);

	const todayStudyMin = getTodayStudyMin();

	// 뽀모도로 패널 UI
	const pomodoroPanel: React.ReactNode = null;

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQuery = window.matchMedia("(min-width: 768px)");
		const update = (event: MediaQueryListEvent | MediaQueryList) => {
			const next = "matches" in event ? event.matches : mediaQuery.matches;
			setIsDesktop(next);
			setIsChatOpen(next);
		};

		update(mediaQuery);
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	React.useEffect(() => {
		const subscription = zoomEvents$.subscribe({ next: () => {} });
		return () => subscription.unsubscribe();
	}, []);

	let content: React.ReactNode;

	if (participantCount <= 4) {
		content = (
			<FourParticipantLayout
				participants={participantsFour.slice(0, participantCount)}
				participantCount={participantCount}
				my3DProfile={my3DProfile}
				isStudying={isStudying}
			/>
		);
	} else if (participantCount <= 12) {
		content = (
			<TwelveParticipantLayout
				participants={participantsTwelve.slice(0, participantCount)}
				participantCount={participantCount}
				my3DProfile={my3DProfile}
				isStudying={isStudying}
			/>
		);
	} else {
		content = (
			<ScrollableParticipantLayout
				participants={participantsScroll.slice(0, participantCount)}
				participantCount={participantCount}
				my3DProfile={my3DProfile}
				isStudying={isStudying}
			/>
		);
	}

	return (
		<div
			className={`relative h-screen w-screen ${
				isDesktop && isPomodoroOpen
					? "md:pr-[376px]"
					: isDesktop && isChatOpen
					? "md:pr-[456px]"
					: "md:pr-[56px]"
			}`}
		>
			{/* 뽀모도로 사이드바 */}
			<aside
				className={`fixed inset-y-0 right-[56px] z-[95] w-[320px] bg-[#1c222d] border-l border-slate-800 flex flex-col transition-transform duration-200 ease-out ${
					isPomodoroOpen ? "translate-x-0" : "translate-x-[calc(100%+56px)]"
				}`}
			>
				{/* 헤더 */}
				<div className="px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
					<h2 className="text-lg font-bold text-white flex items-center gap-2">
						<span className="material-symbols-outlined text-[20px] text-primary">timer</span>
						뽀모도로
					</h2>
					<button
						type="button"
						aria-label="Close pomodoro"
						onClick={() => setIsPomodoroOpen(false)}
						className="w-8 h-8 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center"
					>
						<span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
					</button>
				</div>

				{/* 컨텐츠 */}
				<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

					{/* 태스크 선택 */}
					<div className="flex flex-col gap-2">
						<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">오늘의 태스크</label>
						<select
							value={currentTask ?? ""}
							onChange={(e) => setCurrentTask(e.target.value || null)}
							className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
						>
							<option value="">태스크 선택...</option>
							{tasks.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>
						{currentTask && (
							<p className="text-xs text-slate-400 truncate">현재: {currentTask}</p>
						)}
					</div>

					{/* 타이머 */}
					<div className="flex flex-col items-center gap-3 py-4">
						<div className={`text-7xl font-mono font-bold tabular-nums ${
							pomodoroPhase === "focus" ? "text-red-400" :
							pomodoroPhase === "break" ? "text-green-400" :
							"text-slate-400"
						}`}>
							{formatSeconds(secondsLeft)}
						</div>
						<div className="flex items-center gap-2">
							<span className={`w-2 h-2 rounded-full ${
								pomodoroPhase === "focus" ? "bg-red-400 animate-pulse" :
								pomodoroPhase === "break" ? "bg-green-400 animate-pulse" :
								"bg-slate-600"
							}`} />
							<span className="text-sm text-slate-400">
								{pomodoroPhase === "focus" ? "집중 중" :
								 pomodoroPhase === "break" ? "휴식 중" :
								 "대기"}
							</span>
						</div>
					</div>

					{/* 컨트롤 버튼 */}
					<div className="flex gap-2">
						{pomodoroPhase === "idle" ? (
							<button
								onClick={() => {
									if (!currentTask && tasks[0]) setCurrentTask(tasks[0]);
									setPomodoroPhase("focus");
									setSecondsLeft(FOCUS_MIN * 60);
								}}
								className="flex-1 bg-primary hover:bg-primary/80 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
							>
								<span className="material-symbols-outlined text-[18px]">play_arrow</span>
								시작
							</button>
						) : (
							<>
								<button
									onClick={() => {
										if (pomodoroPhase === "focus") accumulateStudyTime(Math.floor((FOCUS_MIN * 60 - secondsLeft) / 60));
										setPomodoroPhase("idle");
										setSecondsLeft(FOCUS_MIN * 60);
									}}
									className="flex-1 bg-white/10 hover:bg-white/15 text-white rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
								>
									<span className="material-symbols-outlined text-[18px]">stop</span>
									중단
								</button>
								<button
									onClick={() => {
										if (pomodoroPhase === "focus") {
											accumulateStudyTime(FOCUS_MIN);
											setCompletedRounds((r) => r + 1);
											setPomodoroPhase("break");
											setSecondsLeft(BREAK_MIN * 60);
										} else {
											setPomodoroPhase("focus");
											setSecondsLeft(FOCUS_MIN * 60);
										}
									}}
									className="flex-1 bg-primary hover:bg-primary/80 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
								>
									<span className="material-symbols-outlined text-[18px]">
										{pomodoroPhase === "focus" ? "coffee" : "play_arrow"}
									</span>
									{pomodoroPhase === "focus" ? "휴식" : "재시작"}
								</button>
							</>
						)}
					</div>

					{/* 구분선 */}
					<div className="border-t border-slate-800" />

					{/* 세션 정보 */}
					<div className="flex flex-col gap-3">
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">오늘의 기록</p>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1">
								<span className="text-2xl font-bold text-white">{completedRounds}</span>
								<span className="text-xs text-slate-400">완료한 뽀모도로</span>
							</div>
							<div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1">
								<span className="text-2xl font-bold text-white">
									{todayStudyMin + (isStudying ? Math.floor((FOCUS_MIN * 60 - secondsLeft) / 60) : 0)}
								</span>
								<span className="text-xs text-slate-400">누적 공부(분)</span>
							</div>
						</div>
					</div>

					{/* 뽀모도로 설명 */}
					<div className="bg-white/5 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
						🍅 25분 집중 → 5분 휴식 반복<br/>
						집중 세션 완료 시 공부 시간이 자동 누적됩니다.
					</div>

				</div>
			</aside>
			{content}

			{/* 우측 아이콘 Nav */}
			<nav className="fixed inset-y-0 right-0 z-[100] hidden md:flex w-[56px] flex-col items-center justify-center gap-1 bg-[#161b25] border-l border-slate-800/60">
				<button
					type="button"
					onClick={onTogglePomodoro}
					title="뽀모도로"
					className={`flex flex-col items-center gap-1 w-full py-3 transition-colors ${
						isPomodoroOpen
							? "text-primary bg-primary/10 border-r-2 border-primary"
							: "text-slate-400 hover:text-white hover:bg-white/5"
					}`}
				>
					<span className="material-symbols-outlined text-[22px]">timer</span>
					<span className="text-[9px] font-medium tracking-wide leading-none">타이머</span>
				</button>
				<button
					type="button"
					onClick={onToggleChat}
					title="채팅"
					className={`flex flex-col items-center gap-1 w-full py-3 transition-colors ${
						isChatOpen
							? "text-primary bg-primary/10 border-r-2 border-primary"
							: "text-slate-400 hover:text-white hover:bg-white/5"
					}`}
				>
					<span className="material-symbols-outlined text-[22px]">chat</span>
					<span className="text-[9px] font-medium tracking-wide leading-none">채팅</span>
				</button>
			</nav>

			<StudyRoomChatSidebar
				roomId={roomId}
				isOpen={isChatOpen}
				onClose={() => setIsChatOpen(false)}
			/>
		</div>
	);
}
