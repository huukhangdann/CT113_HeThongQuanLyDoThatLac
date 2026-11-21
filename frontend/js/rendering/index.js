const MockPostItem = [
    {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y",
        name: "Ví da màu đen",
        location: "Nhà học C1, Tầng 2",
        time: " Hôm nay, 09:30",
        status: "Đang giữ hộ"
    },
    {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
        name: "Bình nước giữ nhiệt",
        location: "Thư viện Trung tâm",
        time: "Hôm nay, 08:15",
        status: "Chờ bàn giao"
    }, {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en",
        name: "Ô dù gấp xanh navy",
        location: "Hội trường Rùa",
        time: "Hôm qua, 16:45",
        status: "Chờ liên hệ"
    },
    {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw",
        name: "Hộp tai nghe không dây",
        location: "Khoa CNTT&TT",
        time: "Hôm qua, 14:20",
        status: "Đang tìm kiếm"
    },
    {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
        name: "Sổ tay bìa xanh",
        location: "Khu giảng đường B1",
        time: "24 Th10, 11:00",
        status: "Đang giữ hộ"
    },
    {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
        name: "Chùm chìa khóa xe máy",
        location: "Bãi xe Khu II",
        time: "23 Th10, 17:15",
        status: "Chờ liên hệ"
    }
]

const RenderPostItem = ()=>{
    const listPostItem = MockPostItem.map((postItem)=>{
        return `
        <article
            class="group bg-stone-50 hover:bg-white rounded-xl border border-stone-border overflow-hidden hover:shadow-md transition-all flex flex-col"
          >
            <div
              class="h-48 sm:h-52 md:h-60 bg-stone-200 overflow-hidden shrink-0"
            >
              <img
                src="${postItem.url}"
                alt="${postItem.name}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="p-4 flex flex-col flex-1 justify-between">
              <div>
                <h3
                  class="font-semibold text-sm text-soft-black group-hover:text-deep-sage transition-colors truncate"
                >
                  ${postItem.name}
                </h3>
                <p
                  class="flex items-center gap-1.5 text-warm-gray text-xs mt-2.5 truncate"
                >
                  <span class="material-symbols-outlined text-sm shrink-0"
                    >location_on</span
                  >
                  ${postItem.location}
                </p>
                <p
                  class="flex items-center gap-1.5 text-warm-gray text-xs mt-1.5"
                >
                  <span class="material-symbols-outlined text-sm shrink-0"
                    >schedule</span
                  >
                  ${postItem.time}
                </p>
              </div>
              <div
                class="pt-2.5 mt-3 border-t border-stone-border/70 flex items-center justify-between text-xs"
              >
                <span class="text-warm-gray font-medium">${postItem.status}</span>
                <a
                  href="#"
                  class="font-medium text-deep-sage flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Xem chi tiết</span>
                  <span class="material-symbols-outlined text-sm"
                    >arrow_forward</span
                  >
                </a>
              </div>
            </div>
          </article>
        `
    }).join('');

    
    const divContainerPost = document.querySelector(".PostItemDiv");
    if (divContainerPost){
        divContainerPost.innerHTML = listPostItem;
    }
}

RenderPostItem()