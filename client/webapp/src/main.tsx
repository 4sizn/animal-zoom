import type { ZoomParticipant } from "@animal-zoom/share";
import { EMPTY, type Observable } from "rxjs";
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function getParticipantCount(maxCount: number): number {
  const params = new URLSearchParams(window.location.search);
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

const participantsFour: ZoomParticipant[] = [
  {
    animal: {
      id: "sysy",
      name: "sysy",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC79Q7zqZWS7GV9q570BwkwTc_fb1ZRmBIwTRR5YrAYp34MwEEWmkqUzOTeGjp2mbmCnGkHsAljuZGrjJinUHPyNJRcfDufTM5dKsFSMdogiI2l_mXD429tBWYZ1c3GR5cHeNcaAGeyT9tLzQwQa0HJJVbkoHz8JsPsNDQcqgNBZMITTt_UQAs0XlPfquy2BruxujaomW_VaUdQ122aMJFqEfUCQTXAmHDd2ptm2OdopO98dAOv0ZvIerrZtu-F91lE7qS7A2kpTmrz"
    },
    mediaState: {
      isMicOn: false,
      isCameraOn: true,
      isSpeaking: false
    }
  },
  {
    animal: {
      id: "oliver",
      name: "oliver",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmcaS74PWd0rNr9CGpEQir3JgAYDE7iccJh_NeGtqxyRzU7vnl8NwP8BsSCsQa0QtLVMq_F8Yeura-L9z4rhHnkfn9SV2NHqtxIiR03tHwrrxknjVu4o5wpytv9VZ3VgIkjaAoP8s1bspmL_MXTZ0z6S8CuY1Guh_VJyyAq1zEWB15URkTTvnIrIGKyK5ZMPLC2Pb9e23MT4VXNKJPlpwSmsY20IIcVr3lB2GNSaX-AhUdw5XSLRnsXFWWg0Gij-YaBugTADDB1_TI"
    },
    mediaState: {
      isMicOn: true,
      isCameraOn: true,
      isSpeaking: false
    }
  },
  {
    animal: {
      id: "octavian",
      name: "octavian",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAVCIibKgC-GBiLcHvcjyH95CBclFzPN5P2IvPpX2yKIK8Y-OZhxPF3cw2aBS6d4XKfmppjbv_Ri6xXKttyRoY6G2-dhQ9_bgilAH1e1GeoXTQ4YWGbOw0nhajsZ0yiKj5C3eVknZ0iVb9vwU8HybcywLJBx1MDetFArO17ntyTIk6ckKNtVBXu2GeyCh8lEDvCG79OHyoFWxBgchei-T91ID4NkjLbdLrO5CGFfiBk_he1RSXiLVCmNy7AZZT32yHC04dxNArWsnOr"
    },
    mediaState: {
      isMicOn: true,
      isCameraOn: true,
      isSpeaking: true
    }
  },
  {
    animal: {
      id: "jen",
      name: "jen",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDms0lWuqK38hp8fHBpeISQvRcc4D7xK_LUNDjeZPHEhIxyFgVVgKMjLmXvYfUv-F2MSKNIwuKg9Vy9KMo22hFlgGmbIwOLp3NFFkzWXqh9iFx3uoqCNcylMt4H24LBv6p55O_oBT5hqd8FuJT-FI4Ndiwt4r0rCG0v_zEfwX8auOWzQzNtVdA6CzOQgvuy6ac3VNCAJvksERD1UVAXoPK0En5QJfqEraZOszQFSEgRlhTzkWvcEoRFluOBukG00cDREGIt_kQT5wSf"
    },
    mediaState: {
      isMicOn: true,
      isCameraOn: true,
      isSpeaking: false
    }
  }
];

const participantsTwelve: ZoomParticipant[] = [
  {
    animal: {
      id: "sysy",
      name: "sysy",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBk5iyqtnoYIrA_V2nvDFw4KIUwPqP_67ZNsmbIYGbv3PexsTJQYB0kII33vxonc93Z8S_A9lgfnt3k9pa5PW0zi_m3sEsIflxFTgRbGqUPrxMIxTPQX2iQPvZAir6pdx-LwmVyv-Jvs9YZ_D7HyWbbG5tYLp3_BCczZ4GqQUdh3rK5uYF1jc73PRO4ZLeLxJrv4T4glpHVgoGb0kK7QzggI3DlKz0FQiV4ePm2z_qmA-rGrYMtCOtCzA16cUloMd8RMklZEKfQYFSn"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "oliver",
      name: "oliver",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCRS10DiFYMtIEwM-VSJ00LwlTaNRoDBbDLL4vl_axiKLT-39cj9-V190YMaiaMpMLq6khPIzXmPfd3W97SbcvZ5HvxIwFIBgz5oLtf-6fPDF7VXv9KUk-6YGpZLtlbDfXx80Xeuez9vo_mpqHZDfRGqdGXogehRdVWbfXj65pacM7egsUwhIkVTq6ueZjQNFrfONDDgpQ1TXx1Z2_ljtjKDc6HqdlHY9tynPUliylMyEnSZJLODkNKQbfDs6EGsAFe1bbsHKRtAAW1"
    },
    mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "octavian",
      name: "octavian",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ2EJ8WdxSRz32j__YMXYiHEANLzngLE7G3aydsV7UfD5bzuELJjOe19ty3E8rbdo51QSX-iGmkhBmJ8QqRTw171Y7O4WFDL5b91dYrXjjVoQApQdTXWD9hwtAAQG5SgKILfWFTZJ5tLMHKneGEbZWBx2xjIWYw7sOTo4i5OrlNvUw1XLfwJGV3hRSmP-PTatUc66i_9uFkIAMs5liYqQ-5Gpq7wz0Ob8g6zh9bq9_mOBWR58wINuSWSApG0EB23MtWrnErtNaHzKz"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "jen",
      name: "jen",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCiAQmm-iEXfsKmAuAfpqK486B1WjlbQzRkLm53K8k_Rebe5YljqShPFUIvYjrStI0jE_X77SQ2-u_2ozWjPPrFK3eelcsYJi5gRlD0Vdx0D6FqW_odJJb8xBbRuemdsPc4ng6IaTcaV0uVaKOqccHGJmqvBTyD0rShvF4U0-WReE0ulkq_YWPOHW3Fq2dG07rZ0-yIPUO2OR5iWqT0s_NI0aSLJf2chwzzVY0smAVu4HOZq2sh1HSNSvjM10yOuvY4srioCzQsYddw"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "mariana",
      name: "mariana",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1qtUdMD9K0EEuVleBBYoGTFgyT1Gth-jJgly_rS5sTAysKjQvCw6F5m2WzG6vfBAnDNXlZ-Pc1fuqgXtO9O9ZohSbErHFiHX_JAJQzjyiOE-aQ-Xjb0BZzGU1QomMNPOHq_YcuzhJvdcMXzCw3jYOtd_m67r5e8j1ydNqMz93O_kyOFjZIcWVPWNKliW_6iuLdpwkPHAqNTmHiF354XzjFXyMZNgAu3_51p0zP0T8wBnHf04NbzgTus_9vKs7LPMrDiZRFyvVKhj2"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "marina",
      name: "marina",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBdMuUeRjsjIg9_M3J_w1DjaDWvGRwy7Zdq_pIEWkn5kXhp2Ve_yg3t6WjszU0QmKu8feFt-rZNRNJhwI2DYeNNPFi5ZMZtIDSY9zQz75wtLLU8cQzVeqi2MLgEcbN2zd97cwuOELptrwlMMXkUdjMGtPdKsxicvJfIHru9wVtHQKWexzEgDc6yHZ8tZfZNlnj-AA4WkZg-oed1it_hg5dzPfMD97fkDmn53d9ILRLuAh0MGE32eOzBrEjrN3YYIV3DFoIhZ_Dp1Ou3"
    },
    mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "renise",
      name: "renise",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBRLsnGL1Yt6y90Q1xunrO5hqkA5jTiDEm4WJruqN-ut8gTe3xeMRirux6rd_7jJA5a4P3nAxCRQL7u3ThzE_Gx3jechRiAi8DLQ0mhbiOiOrJMfXkVM-PfzV_ZRIv2_D5H1ieRt4rO_I0FFANZbRYKb-hzOlFnmyfXvO7l9vHk06eM12P6RUlc9UJVXOOJ7Cxr1bHS5-MU4FsV9_wWfcfYMRDzOuUY5jtAb-fmPqzswA0eFpAo3bMDp1nF0nBzO0I7LNGY9aRGlGqf"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "gloria",
      name: "gloria",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAUOvk1GeONHAWV1dgl7l3tolNjslpCaF5qE_87_1F_YYj3UK1TQLWMAHpnvw51CRXQDvqGApMmQzwe__3jfYyP2sONNCKmz6B37mSvgiEG_dMhKZW-6RH9CiNZSTBMhcwKicxxVIIhso1j84JvqAbqUsibAzYU7cX2lW6_B4ANCaC1JbOYJMIoTSaQzKpaixNQU_edVjYvQKbCvDNqWzFrhMGTsRTN0cUIthR3S4s5TCd1jzKbjjCUxdZ0iFcuGTzNFVqQ8I1cfTHB"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "cleo",
      name: "cleo",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDv_F44U8ybC-iyeuYWlhaREtjg_m9cMnF8Y-x1r6DxD4_b3QDvNgj8XOqfFtooT6-d4yahQSj75n0t8vQQuoUsYqG46PaqOb9Zi4SmMY0o_sP31hbM7fKvCLO2RTJNd8vLsvPVLKt4z4YPzEgQbZnBxNVyCtk57ihzdRUomo-DYpVVvG1LERJUXR_FTaQD0tD2Yd6hhI6ut7ql4Xh61j51Yn9B4QaMWo1XO1qfWWYuJgp7h8Pgy2FRBJi-jsiJzxbU7mIvFsvqfrlE"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "ruby",
      name: "ruby",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvnB5r4vlPYqSDAJNtdmhdRKM0jl2V4sCRuIm3w4pI0Mgxftl6o5SBDsDwbyWxxtufM2H_R8ynHdFQqoPVmjLtfpAWpiaruuR2gDtJ0ifZ3hKZCd6Hnua_Mrn0Msjrps4s6mATWtFVqlo-GDcjpVC47OYoRi3ZVZj1upu4nU66yOq696lbxANdlMEu6_Nbc-ox7gQ3nLO5VFet-zXrzKwwxiEQX01wBCzKv4A32nGTyV7Fy0XDgdAbUw99EYdpeAE7ivPNL5fy56mV"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "stitch",
      name: "stitch",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAYp29-B77H-UvesrBauQM03Ub6d17EfQHtMDX3JJk8P7prH5_WATRD-fFkdf7n4EwA_Jg7BD3rOLqzLg3rgsyTjJt-pAF77CPYSmY0wvxY7FCWW4xVD5ZMksVaH7dYuDd4dfXNstaDHkMTycVNrcU5W9M5DR8mKVmwR1TF_uDQvnvbvbDeMpzXzK2nPbmlKquZOg6J0HpeT0WbC_V4PLKt-NuDaiO8iQ6BWSXJRaHxHiY8OldmAIBoB-VEAuJVoitSZzMy_JXneWBQ"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "tulip",
      name: "tulip",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmF9sTTZUEC5uvifL1fer-VPa1lNmMhSaBdSictpVqL-v25wX1AXjOKcD-zktcCsZJsd80GK2t8QcfkVVY1fV8qrsUGec_jSrRMG_g4ZRG6XogF359TTOdv9GIaZpN9Cb7UVokuRuutv9_OQ2KkqhwBLsWVI7tcROAv_YWddybPTASBW8MiMPqcrNBpLg6PXWgTQF9Dlfq4cffMis_UlzTFg8edbSrakVIUsfMobbg1YwsfSiQeZ0jj_0Q7Y8zhnLNEKZeRRUJjefX"
    },
    mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false }
  }
];

const participantsScroll: ZoomParticipant[] = [
  {
    animal: {
      id: "sysy",
      name: "sysy",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDXG9zC0j7rigvZuAL57VV1D9W8UAwbZQpLfJ_ZXqYKJGfxljV3bhmz9_9LMcLqqh1pAzKEHz-FmeNDlvF-uL2fNp-o4E8OdR5WokqZclp58_U8s-YlMS0KzQrd-sGTZ8AfZZ-E2st48Q2qe_-QhfwLMhcSetrW17vTm0JwdEOVevMFuGWJrGl5I4f-9is7CODthPn1ppJwxMWJTYfrUZQsuLd_bafyH0Mfc92h8tUHxSElBp8yKJckNxTosybDXbqhmv-7KTgktxr3"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "oliver",
      name: "oliver",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyAlj1028Y10hE4XA6i6amd4zRWsUERc1DBiSEigEZNs8NqKdcYlm-dSuOpD9SWlBrxOkDApTSWsAHeqqabD6s7zMDenp73RyRQAjxthHRDMje85_1ZlLMbOXR4sPiKjx4lHjrdHDS0-vwy9ZnGlK_XTuML4wXPrCIu9CJmMkR6oX8uL2kbmxdhqApjUETKBSfY1K_5qQQ5HVT_urtE_xTularExL908QppnpaZR0dggF-IkK86_y4zMJiZcIiE4uCNDxXSCgeJyoB"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "octavian",
      name: "octavian",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAlLHgGzIZpxsbUb3dO9TjQr2GMnTsaJ2lEog7s5ZMpBXOpUV_8DrCe7ljz4OtzecNTs0NgyQrKKIQuHfxeSGsD0ng9aYyM-i0Rty9vF3KWIoilPAzHNLxIuAbr5Fm3_6B_8Nkh7EXjgD6zKfkKUDmc4fIn7dLyhblQJ3EWpSybZjG_m8SW4oNchVI2L9J9LVJDXP6e1IKbRO5rVnqNVtv7Lk6exnFHo-_Nht09CUSq_gBbhOla2HGqzm02oPL4hQ8aKWFiMBDSVfkK"
    },
    mediaState: { isMicOn: false, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "jen",
      name: "jen",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA9Wg24IbSw7c3Sh-4CGMgCiO5YNzvxknuQC0en6W27aqE4uLo5LEcu6irIh7bonGCn6SHDCyZFQRz1KHG1yEyyRDcrRCJwalgdSRJ9JOH6qDForD3qXsNH1epz5D-tHKWSPbgSbaWEzT-S9OrLIBnzrxLJEHjSCYAX8APDulcOyUf8yhJUwkV8kHYsSpAzxEsZQK_YFmL15eamtQB_oeqpeLStaqUAtggyR_JbO5VZWDOORXlK7hX1sUT0Lf81DDYBFuzQUxeqHXZ-"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "mariana",
      name: "mariana",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDe8PP8Tm-1TXag-6lcPonz0Zsd1b9ZF82wnq23n9IEc_Iy5BCkZUSBxObcPLhkJVofKIjMdDfR6UWVA_kj8naDuy-SRS6LRGKzCNdVABNTveezwE4xo4lEkiIZhQFbzxIbciiFoVGp7Mjnwumi-baqO1L6mzFwUH3jr88fjTWZYUO3y8h6iJP0WHxvub_L8iTTA8IWmHtFyQnjYYmk4h3j6k5ljjVX6J3pWrxv6VmVslnMJ9J0vHroko2SO7ocgTaLbwHyeo2sKdEq"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "marina",
      name: "marina",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZCS9QuLP-lryw5OAgqMitJ3vWjxs7ci0bD0dTWguY8ETFFAHQ8yiS0l-PyhML7xbZuzfWOuKUyGToWHUyNWJgSpG6gSTHQaLcFczLEftmTXfB4F-ks5q5p6UNwz-Ct2A43BMWyV4NLJp1g_uFy-8BOUH2opXhj8l405qXUIhxFb4oYtTTQEymoO-UtY1UIhnUw7BKYE7uTiqP4wL96rD9wbqGBNOL3e80scmDfHzpuByMCWZu9P-hkRq9J8I5m8A1ti9Y5S10RyXa"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "renise",
      name: "renise",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBx631F1-l_5FxTCYecADAizYXW949ONrIidbD4ck02gkta7a8Paow4FKSBBk7r_S0gbGU-Ktqp-V1BOf2HlejEIavgwUDBLxGg4oKO4LyVP9NyxzhxnScP_tuVPd0EU1l3xMEO9uNy3vmO6iQ2mPOpR0Xz-3XIav5uCWiuvqvj6INLPS-ZizSoz8P4UQl7B_AJK8HlAIBImCR87H7ikFU_k564WS0iPqT-LqunpxtlUOoLSd2--iMRohFGxcPjCopocJ222U3HErlX"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "gloria",
      name: "gloria",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDot3AQJ8DwrJB59oh-77THvIg3hIGmQ9JwolhR80514p06qeMUg-k7jAZb-yN6EkFQNWrySUNAdJ3nwO0aiKVuWVuhCyqhY-AQxU7EZXlveTkvVyvaL4wT6sqt5bmrU7Q8HvkQxNezgl7c7tWt1MEY_m9AnqQbqOQ1zJvPTHpxozYSSOmpidRctDtH-qf-EaHSUo4A64fbeoWRrqeZa4DI8FtkDDHAJ_81GIBMJC5FI3RBnF8fKrIVNwwfMZL8n-HDYWUOlukYlXk0"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "cleo",
      name: "cleo",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCnWiMaTXsbGKKuSsdTM7cWPkfUtC9HPLI5GDlFbQNF0bJdAxta7HwTPvhmZ9o7O-elGKQcygNyqPIt5jSTagh8k35Qxbeh8y7nEPi2P2KRNKS8jhYXZCEBGyq3BwT6mAr2zt7eWSDG9rpTJ8i15IfgR2f31sw9FzlMCiwfN9AWk8nEeRm8ggMaXozMZpaXAHCmQHnNP3QpOMOeDnxx4u0TgrpX_8NCcUaFMmpNhD367UdcwyzP0e4w4N_lGVjpDJJQrMPp1_45K7Du"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "ruby",
      name: "ruby",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuATs0_AN2iGT73Z43Yo-1kUveXgkWNQ3D2qHzza90kYJQczn5X9-3HuG9sGAegPKNRH4iOqKt37ODHNGvXz9Yegc8gsj5Pa0-9ZibpHHmlsVD7V_I-vF3R3TdnKoykH_rH6vFQDK687YpXDM_Lyg68dkvX3OcALM-Yivh3qC3TdGqqQ4ZlMnPT3MkcUprewJT8NlYEEhjk1lUAjpVPR8UPQ2xbevdl8KOI-2ElWy28MHeKkz1gVGERPayjNb-WYjngj5NyggjYNhzhi"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "stitch",
      name: "stitch",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAlbzW4kmhmDW7_GM6FbXZw1iXhdVvqFUL8z1uwc9lSK5t4Y8Qd94gYiPZeyki5VnF1To6B1ZxWNpCofRyfwILB4QNnFq5ASCW1DR_O2qWuIV09Y6RiSYbBZl_AHcsjjxVnbXCmiRwSHj9KQw00jRAneXitqCxUdgLCS9U3kMfEPF5PIznj4OQAF3rH8ndWaqflSDECIT4yguq5FNn5X5zliFeONQUy8fZDEaUeGtswSW6BRXxeWyfcbRrxHfWr6YfW5GBPycAGUT5u"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "tulip",
      name: "tulip",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBiF4G-HnNADm6ID0kli82aJ1NY2DpRzeiR_wnmMRckF5Vh8T7pkPHfUwU9P5UpbG_-vxuE5Fb0XiahNman6e8HmpCQ9A-GUc0sb7FbsIKatfTMvk0qGuqhSK0haf_U5AN3TkjKPd2wCLLsQRH27k1yJO6p_eVQn_HcQ8az2gf2XPKI2Qa60oAryANkpztrDZOZjZ6lDnq3u9OwgWexvBjfa1ht3Etxz9G9QcoEF3mTYUhWjY9oK_cGBUY30H1vXbtH77uxOCS7VF2P"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "apollo",
      name: "apollo",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDb0Uq1bUAMyTVHyoXeH4aQOTIeIMggHYrxDg3mlDoGvp68yvZkv2dmcRIul5HGFw23m9lAbOVP4wTLkj-3IrklxUFC9xRayAOkC1kIgjA6nFRKWowixJWMj-1O3P0gPNrFLXsZsMRgWXdt_hu36jB3hWzpKddlEOPl0zmP0sRDfPOQ0Bn-9D3xXWNhcmTyLX14DeNheFmLng5AIwJsCl-tXNneA5I8KzshSNBvk773kvY-tscSFY9VIYi7U4YkVlQER7UiUfuGwIxQ"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "fang",
      name: "fang",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBpG0xNdU4LwnbvITx3xHHZJpCitrFc99hSTcdMPbAylfVK-H0TVynTQWkLuUi2XtRkMkvmCF5l8whEdCWTATWE7hg2njeGdsJNvEumK0cbHJIJc0NWlPWmVRjNvgFBQB8kcRE4_vkcbdqLq7jtPYNuQFKXhLqZJawHlwuftgfNvogAxvC7oD1Bcw5jFvbbvzJMsL_Ia-WmjCK7i8lPyKAWpj2MRp0xCF6d6fvdLhQNW25MI9vHSRS7zNDBTN8Z1WpUN0GPofRBGCqT"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "whitney",
      name: "whitney",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC28TwGESoio0Su0spLwe2ANALS_oGn_ouDLrVseXE08Bd8dKjSECkTb5jwsmuJEOEbKxnS9pcmz2bi1kCNbFYDVLQugovybXCnMxQZzty7uo3aA_HS7K4ftdGe-ByQymeLD4eGepRM7DTx8yOR-OE8_S0sQN3AxVAlSFDqym4o0zxGvWhqtauE5yWKUQyKVUuIW84Okukzwhkadn-Fuc4nbvLg8FaLLgQGuk-mFBZ77rNOd_CqSvfeOeMr0GD0eAoTeIEKmzXBZfWs"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "beau",
      name: "beau",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBRXtikgEASNRA4nIy9k7v7CyQZR4KYoAEjiirTgfevUnfWJ-J7uc-ESC98zx1XXjlGwgoEcCr38Qa4EP5kqw5Q521K7UP0xKloKUnK1iqXmzGeT0u6WYAk5oR4My8XWne7kxqQA6Zx1H29oaaI5ir4uSLeypqZEp6srJ1oDNPoMYXlRmfeOGtSyLTx5OB7fLY4ff5rdfUaTvxDsZuyTHS_67XJuWqvWnPVgldaSXA71Kqco-OnMATn4Xo4q5v_M366pk15CM0sf8jy"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  },
  {
    animal: {
      id: "fauna",
      name: "fauna",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD460d17wzkfujAzHnpaxW_xDZHNGw05_Mylal_NS5k05uPgtv9sgj4FQGrvfo7ANd4wOJluGwqjElyQrPOvkhuY2Az1RWAFF7ntqy15zfLtpeKnJRi-iLpbYjrzTun9m-rstxVb10YZQ2WX96pQt83K4FBibvWPI_117pj2uLGknvjpoxRoM_c1m8uuoLuabumu5mBfj2y_7JjvRGiF74Dro3KGKhj-Iq_Jka3srvm7WJAWLC-yI50efj9ayOrT8XvKk3LkTfBmewE"
    },
    mediaState: { isMicOn: true, isCameraOn: true, isSpeaking: false }
  }
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
  tulip: "tulip's cozy reading nook"
};

const zoomEvents$: Observable<unknown> = EMPTY;

function FourParticipantLayout({ participants, participantCount }: { participants: ZoomParticipant[]; participantCount: number }) {
  return (
    <div className="bg-[#1a1a1a] h-screen w-screen flex flex-col font-body overflow-hidden text-white">
      <main className="flex-grow flex items-center justify-center p-4 lg:p-12 w-full h-full relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-7xl mx-auto items-center justify-center">
          {participants.map((participant) => (
            <div
              key={participant.animal.id}
              className="relative group rounded-2xl overflow-hidden shadow-2xl aspect-video-custom bg-[#2c2c2c]"
            >
              <img
                alt={`${participant.animal.name}'s video feed`}
                className="w-full h-full object-cover"
                src={participant.animal.imageUrl}
              />
              <div className="absolute bottom-4 left-4 z-10">
                <span className="text-white text-xl font-medium drop-shadow-md">{participant.animal.name}</span>
              </div>
              {participant.mediaState.isSpeaking ? (
                <div className="absolute top-3 right-3 z-10 bg-blue-600/90 backdrop-blur-md p-2 rounded-full flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-white text-[20px]">graphic_eq</span>
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
                  <span className="material-symbols-outlined text-white text-[20px]">videocam_off</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <footer className="h-20 flex-shrink-0 grid grid-cols-3 items-center px-8 bg-[#1a1a1a] z-50 mb-2">
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-medium text-gray-200">group study - day ten</h1>
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
            <span className="text-sm font-medium">{participantCount} people</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TwelveParticipantLayout({ participants, participantCount }: { participants: ZoomParticipant[]; participantCount: number }) {
  const displayedParticipantCount = participantCount === 12 ? 13 : participantCount;

  return (
    <div className="bg-charcoal-dark font-sans text-gray-200 h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white transition-colors duration-300">
      <main className="flex-grow p-4 md:p-8 overflow-y-auto flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-[1400px] h-full content-center">
          {participants.map((participant) => (
            <div
              key={participant.animal.id}
              className="relative group aspect-video rounded-xl overflow-hidden bg-charcoal-light ring-1 ring-white/5 shadow-lg"
            >
              <img
                alt={twelveAltById[participant.animal.id] ?? `${participant.animal.name}`}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                src={participant.animal.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
              <div className="absolute bottom-3 left-3 z-10 bg-overlay-plate backdrop-blur-[2px] px-3 py-1 rounded-md">
                <span className="text-white text-base font-medium tracking-wide">{participant.animal.name}</span>
              </div>
              {participant.mediaState.isMicOn ? null : (
                <div className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">mic_off</span>
                </div>
              )}
              {participant.mediaState.isCameraOn ? null : (
                <div className="absolute top-3 left-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">videocam_off</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <footer className="h-20 shrink-0 bg-charcoal-dark flex items-center justify-between px-6 md:px-10 z-50">
        <div className="w-48 hidden md:block">
          <h2 className="text-base font-medium text-gray-200 tracking-wide">group study - day ten</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-primary hover:bg-red-600 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#181a1d]"
          >
            <span className="material-symbols-outlined text-[20px] filled">mic_off</span>
          </button>
          <button
            type="button"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-control-bg hover:bg-gray-600 text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#181a1d]"
          >
            <span className="material-symbols-outlined text-[20px] filled">videocam_off</span>
          </button>
          <button
            type="button"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-control-bg hover:bg-gray-600 text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#181a1d]"
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
          <button
            type="button"
            className="w-16 h-10 rounded-full flex items-center justify-center bg-primary hover:bg-red-600 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#181a1d] ml-1 shadow-md"
          >
            <span className="material-symbols-outlined text-[24px] filled">call_end</span>
          </button>
        </div>
        <div className="w-48 hidden md:flex justify-end items-center text-gray-400">
          <span className="material-symbols-outlined text-[20px] mr-2">group</span>
          <span className="text-sm font-medium tracking-wide">{displayedParticipantCount} people</span>
        </div>
        <div className="md:hidden flex items-center">
          <span className="text-sm font-medium text-gray-400">{displayedParticipantCount}</span>
        </div>
      </footer>
    </div>
  );
}

function ScrollableParticipantLayout({ participants, participantCount }: { participants: ZoomParticipant[]; participantCount: number }) {
  return (
    <div className="bg-[#202124] text-gray-100 font-display h-screen flex flex-col overflow-hidden transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 lg:py-8" data-participants={participantCount}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1800px] mx-auto pb-24">
          {participants.map((participant) => (
            <div
              key={participant.animal.id}
              className="video-tile bg-surface-dark rounded-2xl shadow-lg group ring-1 ring-white/10"
            >
              <img
                alt={`${participant.animal.name} avatar`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={participant.animal.imageUrl}
              />
              <div className="name-overlay absolute inset-0 flex items-end p-4 rounded-2xl">
                <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">{participant.animal.name}</span>
              </div>
              {participant.mediaState.isMicOn ? null : (
                <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                  <span className="material-icons-round text-white text-sm block">mic_off</span>
                </div>
              )}
              {participant.mediaState.isCameraOn ? null : (
                <div className="absolute top-3 left-3 bg-black/60 p-1.5 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <span className="material-icons-round text-white text-sm block">videocam_off</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <footer className="flex-none h-20 bg-[#202124] border-t border-white/5 px-8 flex items-center justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-gray-100">group study - day ten</h1>
          <span className="text-xs text-gray-400">01:45:23 elapsed</span>
        </div>
        <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">{participantCount} people</span>
          <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-icons-round text-gray-300">people</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const participantCount = getParticipantCount(participantsScroll.length);

  React.useEffect(() => {
    const subscription = zoomEvents$.subscribe({ next: () => {} });
    return () => subscription.unsubscribe();
  }, []);

  if (participantCount <= 4) {
    return (
      <FourParticipantLayout
        participants={participantsFour.slice(0, participantCount)}
        participantCount={participantCount}
      />
    );
  }

  if (participantCount <= 12) {
    return (
      <TwelveParticipantLayout
        participants={participantsTwelve.slice(0, participantCount)}
        participantCount={participantCount}
      />
    );
  }

  return (
    <ScrollableParticipantLayout
      participants={participantsScroll.slice(0, participantCount)}
      participantCount={participantCount}
    />
  );
}

document.documentElement.classList.add("dark");

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
