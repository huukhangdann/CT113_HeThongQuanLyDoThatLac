/**
 * CTU Lost & Found - Danh sách dữ liệu các món đồ thất lạc mẫu
 * Hỗ trợ liên kết động giữa các card (Trang chủ, Trang tìm kiếm) và Trang chi tiết xác minh (claim.html)
 */
window.CTU_ITEMS_DATABASE = {
  // =========================================================================
  // 6 CARD Ở TRANG CHỦ (index.html)
  // =========================================================================
  "home-1": {
    id: "home-1",
    title: "Ví da màu đen",
    category: "Ví tiền / Bóp da",
    categoryIcon: "wallet",
    location: "Nhà học C1, Tầng 2",
    time: "Hôm nay, 09:30",
    storage: "Phòng Công tác Sinh viên (PCTSV) - Nhà điều hành C1",
    status: "Đang giữ hộ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Mình nhặt được chiếc ví da màu đen tại dãy bàn tự học Tầng 2 Nhà học C1. Ví còn nguyên vẹn, bên trong có một số giấy tờ tùy thân và thẻ sinh viên CTU.",
    question: "Mã số in trên thẻ sinh viên hoặc tên giấy tờ kẹp trong ví là gì?",
    answerPlaceholder: "Nhập chính xác mã số sinh viên hoặc tên giấy tờ... (VD: B2105432)"
  },

  "home-2": {
    id: "home-2",
    title: "Bình nước giữ nhiệt",
    category: "Đồ dùng cá nhân",
    categoryIcon: "water_bottle",
    location: "Thư viện Trung tâm",
    time: "Hôm nay, 08:15",
    storage: "Bàn trực tiếp tân - Tầng trệt Thư viện Trung tâm",
    status: "Chờ bàn giao",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Bình nước bỏ quên tại dãy bàn tự học Tầng 3 Thư viện Trung tâm. Bình còn rất mới, sạch sẽ, có nắp đậy kín và có quai xách.",
    question: "Thương hiệu của bình nước hoặc đặc điểm sticker/vết xước nhận dạng là gì?",
    answerPlaceholder: "Nhập hiệu bình hoặc mô tả sticker dán trên bình... (VD: Lock&Lock màu xanh mint)"
  },

  "home-3": {
    id: "home-3",
    title: "Ô dù gấp xanh navy",
    category: "Đồ dùng cá nhân",
    categoryIcon: "umbrella",
    location: "Hội trường Rùa",
    time: "Hôm qua, 16:45",
    storage: "Văn phòng Đoàn Thanh niên - Hội Sinh viên",
    status: "Chờ liên hệ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Ô dù bỏ quên ở hàng ghế sau cùng sau buổi sinh hoạt công dân tại Hội trường Rùa chiều qua.",
    question: "Cán ô có dây treo màu gì hoặc họa tiết/logo in trên tán dù là gì?",
    answerPlaceholder: "Nhập đặc điểm cán ô hoặc logo in trên vải dù..."
  },

  "home-4": {
    id: "home-4",
    title: "Hộp tai nghe không dây",
    category: "Thiết bị điện tử",
    categoryIcon: "headphones",
    location: "Khoa CNTT&TT",
    time: "Hôm qua, 14:20",
    storage: "Văn phòng Khoa CNTT&TT (P.102 Nhà C1)",
    status: "Đang tìm kiếm",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Nhặt được tại phòng máy tính Lab 3. Hộp tai nghe màu trắng có ốp case silicon, bên trong có đủ 2 tai nghe.",
    question: "Tên Bluetooth hiển thị khi kết nối hoặc màu sắc hình dáng ốp case là gì?",
    answerPlaceholder: "Nhập tên Bluetooth của thiết bị hoặc mô tả ốp bảo vệ..."
  },

  "home-5": {
    id: "home-5",
    title: "Sổ tay bìa xanh",
    category: "Sách vở / Tài liệu",
    categoryIcon: "menu_book",
    location: "Khu giảng đường B1",
    time: "24 Th10, 11:00",
    storage: "Phòng Quản lý Giảng đường B1",
    status: "Đang giữ hộ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Sổ tay bìa màu xanh dương bỏ quên tại bàn giáo viên phòng học B1-201 sau giờ học buổi sáng.",
    question: "Trang bìa lót hoặc trang đầu tiên của sổ tay có ghi tên môn học hoặc họ tên sinh viên nào?",
    answerPlaceholder: "Nhập tên môn học hoặc tên ghi trên trang đầu sổ tay..."
  },

  "home-6": {
    id: "home-6",
    title: "Chùm chìa khóa xe máy",
    category: "Chìa khóa",
    categoryIcon: "key",
    location: "Bãi xe Khu II",
    time: "23 Th10, 17:15",
    storage: "Bốt bảo vệ Cổng A - Khu II",
    status: "Chờ liên hệ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Chùm chìa khóa xe còn cắm quên ở ổ khóa xe máy tại khu vực gửi xe Cổng A gần ký túc xá.",
    question: "Chùm chìa khóa gồm bao nhiêu chìa và móc khóa kèm theo có hình gì/chữ gì?",
    answerPlaceholder: "Nhập số lượng chìa và mô tả móc khóa đi kèm... (VD: 2 chìa Honda + 1 móc khóa gấu dâu)"
  },

  "home-7": {
    id: "home-7",
    title: "Balo thời trang Herschel đen",
    category: "Balo / Túi xách",
    categoryIcon: "backpack",
    location: "Khoa Nông nghiệp, Giảng đường 1",
    time: "Hôm nay, 07:45",
    storage: "Văn phòng Đoàn Khoa Nông nghiệp",
    status: "Đang giữ hộ",
    mainPhoto: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Nhặt được tại hàng ghế thứ 3 Giảng đường 1 Khoa Nông nghiệp. Balo màu đen, khóa kéo đỏ.",
    question: "Bên trong ngăn nhỏ có chiếc bút máy màu gì hoặc thẻ sinh viên tên gì?",
    answerPlaceholder: "Nhập đặc điểm bút máy hoặc tên sinh viên..."
  },

  "home-8": {
    id: "home-8",
    title: "Thẻ sinh viên CTU - B2103456",
    category: "Giấy tờ / Thẻ",
    categoryIcon: "badge",
    location: "Khu II, Bàn tự học C1",
    time: "Hôm qua, 18:20",
    storage: "Phòng Công tác Sinh viên (PCTSV)",
    status: "Chờ liên hệ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuARNHgksfIws9Z2UQUUEbPfKnsNbo_WPEGgjTtNKRKeUJctpIZIa9gdy4qbtY4zuIy2X5bEwv-a-bbyTxumveQymhJw2j2gtx7RE-Zv6gB6clUMvLXgLgT-W2ed977dttODZ3VrStbTjQfBRqrJCu-DjFLhtDSwU9-QCHo9AnJnsMZdsN-AdFQ1TvvlrwF3U-7GNPeilhE7CIQjbVpIc14QDn2JtDOxPycf-5anksYtAbwY22sDT-br",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARNHgksfIws9Z2UQUUEbPfKnsNbo_WPEGgjTtNKRKeUJctpIZIa9gdy4qbtY4zuIy2X5bEwv-a-bbyTxumveQymhJw2j2gtx7RE-Zv6gB6clUMvLXgLgT-W2ed977dttODZ3VrStbTjQfBRqrJCu-DjFLhtDSwU9-QCHo9AnJnsMZdsN-AdFQ1TvvlrwF3U-7GNPeilhE7CIQjbVpIc14QDn2JtDOxPycf-5anksYtAbwY22sDT-br"
    ],
    note: "Thẻ sinh viên CTU bị rơi ở khe ghế bàn tự học tầng trệt nhà C1.",
    question: "Họ và tên đầy đủ hoặc ngành học in trên thẻ sinh viên là gì?",
    answerPlaceholder: "Nhập họ và tên hoặc ngành học trên thẻ..."
  },

  "home-9": {
    id: "home-9",
    title: "Áo khoác gió xanh đậm",
    category: "Trang phục",
    categoryIcon: "checkroom",
    location: "Nhà thi đấu Thể thao CTU",
    time: "Hôm qua, 17:30",
    storage: "Phòng trực Ban Quản lý Nhà thi đấu",
    status: "Đang giữ hộ",
    mainPhoto: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Áo khoác bỏ quên ở khán đài sân cầu lông Nhà thi đấu thể thao.",
    question: "Hãng áo hoặc trong túi áo có vật dụng gì?",
    answerPlaceholder: "Nhập thương hiệu áo hoặc đồ vật trong túi..."
  },

  "home-10": {
    id: "home-10",
    title: "Kính mắt cận gọng kim loại",
    category: "Đồ dùng cá nhân",
    categoryIcon: "visibility",
    location: "Thư viện Trung tâm, Tầng 4",
    time: "Hôm qua, 15:10",
    storage: "Bàn lễ tân Thư viện Trung tâm",
    status: "Chờ bàn giao",
    mainPhoto: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Kính mắt cận gọng tròn kim loại màu bạc, đựng trong hộp da màu xám.",
    question: "Hộp kính có in chữ hiệu gì hoặc mắt kính có độ cận khoảng bao nhiêu?",
    answerPlaceholder: "Nhập hiệu in trên hộp hoặc độ cận..."
  },

  "home-11": {
    id: "home-11",
    title: "Sạc dự phòng Anker 10000mAh",
    category: "Thiết bị điện tử",
    categoryIcon: "battery_charging_full",
    location: "Căng tin Khu II",
    time: "23 Th10, 12:30",
    storage: "Quầy thu ngân Căng tin Khu II",
    status: "Đang tìm kiếm",
    mainPhoto: "https://images.unsplash.com/photo-1609592426508-cc02c524874d?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1609592426508-cc02c524874d?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Để quên tại bàn ăn căng tin khu II lúc giờ ăn trưa. Sạc màu đen có dán decal.",
    question: "Cáp sạc cắm kèm là loại cáp gì (Type-C / Lightning) hoặc hình decal dán trên sạc?",
    answerPlaceholder: "Nhập loại cáp hoặc mô tả decal..."
  },

  "home-12": {
    id: "home-12",
    title: "Máy tính cầm tay Casio fx-580VN X",
    category: "Thiết bị học tập",
    categoryIcon: "calculate",
    location: "Khoa Khoa học Tự nhiên, P.302",
    time: "23 Th10, 10:15",
    storage: "Văn phòng Khoa KHTN",
    status: "Đang giữ hộ",
    mainPhoto: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Nhặt được sau giờ thi môn Toán cao cấp tại phòng 302 Khoa KHTN.",
    question: "Phía sau nắp máy tính có viết chữ gì hoặc dán nhãn tên gì?",
    answerPlaceholder: "Nhập chữ viết hoặc tên dán sau nắp..."
  },

  "home-13": {
    id: "home-13",
    title: "Tai nghe chụp tai Sony WH-CH520",
    category: "Thiết bị điện tử",
    categoryIcon: "headphones",
    location: "Phòng tự học Thư viện, Tầng 2",
    time: "22 Th10, 16:00",
    storage: "Bàn trực Thư viện Trung tâm",
    status: "Chờ bàn giao",
    mainPhoto: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Tai nghe màu be nhạt để quên ở bàn tự học đơn tầng 2.",
    question: "Tên thiết bị hiển thị khi kết nối Bluetooth hoặc vết xước nhận dạng ở đâu?",
    answerPlaceholder: "Nhập tên Bluetooth hoặc vị trí vết xước..."
  },

  "home-14": {
    id: "home-14",
    title: "Đồng hồ đeo tay Casio dây da",
    category: "Đồng hồ / Phụ kiện",
    categoryIcon: "watch",
    location: "Nhà học B1, P.105",
    time: "22 Th10, 14:30",
    storage: "Phòng Quản lý Giảng đường B1",
    status: "Đang giữ hộ",
    mainPhoto: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Rơi ở hộc bàn phòng học B1-105. Mặt đồng hồ tròn viền bạc.",
    question: "Dây da màu gì và kim giây có màu gì đặc biệt?",
    answerPlaceholder: "Nhập màu dây da và màu kim giây..."
  },

  "home-15": {
    id: "home-15",
    title: "Tập tài liệu đồ án tốt nghiệp",
    category: "Sách vở / Tài liệu",
    categoryIcon: "menu_book",
    location: "Khoa Môi trường & TNTN",
    time: "21 Th10, 11:20",
    storage: "Văn phòng Khoa MT&TNTN",
    status: "Chờ liên hệ",
    mainPhoto: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Tập tài liệu in đóng bìa kiếng màu xanh lá, để quên tại ghế đá trước sảnh khoa.",
    question: "Tên đề tài hoặc tên giảng viên hướng dẫn in trên trang bìa?",
    answerPlaceholder: "Nhập tên đề tài hoặc tên GVHD..."
  },

  "home-16": {
    id: "home-16",
    title: "Bao da đựng iPad kèm bút cảm ứng",
    category: "Thiết bị điện tử",
    categoryIcon: "tablet_mac",
    location: "Khoa Ngoại ngữ, Tầng 3",
    time: "21 Th10, 09:40",
    storage: "Văn phòng Khoa Ngoại ngữ",
    status: "Đang tìm kiếm",
    mainPhoto: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Bao da màu xám gấp tam giác, có khe cài bút Apple Pencil màu trắng.",
    question: "Model iPad (iPad Air hay iPad Gen mấy) hoặc hình nền khóa máy là gì?",
    answerPlaceholder: "Nhập model iPad hoặc mô tả hình nền..."
  },

  "home-17": {
    id: "home-17",
    title: "Mũ bảo hiểm Royal 3/4 màu trắng",
    category: "Đồ dùng cá nhân",
    categoryIcon: "sports_motorsports",
    location: "Bãi xe Khoa CNTT&TT",
    time: "20 Th10, 18:00",
    storage: "Bốt trực bảo vệ Nhà C1",
    status: "Chờ bàn giao",
    mainPhoto: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Mũ bảo hiểm treo trên gương xe máy gửi tại bãi xe nhà C1.",
    question: "Kính mũ là kính khói hay kính trong và có sticker gì phía sau mũ?",
    answerPlaceholder: "Nhập loại kính mũ hoặc mô tả sticker..."
  },

  "home-18": {
    id: "home-18",
    title: "Bóp viết vải canvas màu vàng",
    category: "Đồ dùng học tập",
    categoryIcon: "draw",
    location: "Khu nhà học B2, Giảng đường 2",
    time: "20 Th10, 10:15",
    storage: "Phòng Quản lý Giảng đường B2",
    status: "Đang giữ hộ",
    mainPhoto: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Bóp viết nhiều ngăn màu vàng mù tạt, bên trong có nhiều bút dạ quang và máy tính bỏ túi nhỏ.",
    question: "Bên trong có bao nhiêu cây bút dạ quang và loại máy tính mini nào?",
    answerPlaceholder: "Nhập số lượng bút hoặc hiệu máy tính mini..."
  },

  // =========================================================================
  // 4 CARD Ở TRANG TÌM ĐỒ (find.html)
  // =========================================================================
  "find-1": {
    id: "find-1",
    title: "Ví da màu đen gấp đôi",
    category: "Ví tiền / Bóp da",
    categoryIcon: "wallet",
    location: "Khoa CNTT&TT, Tầng 2, P.204",
    time: "Hôm nay, 09:30",
    storage: "Phòng Công tác Sinh viên (PCTSV) - Nhà điều hành C1",
    status: "Đang giữ hộ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Ví da đen hiệu Pedro, hơi sờn góc nhẹ, bên trong có 1 thẻ SV CTU mã B210xxxx, 1 thẻ gửi xe và một ít tiền lẻ.",
    question: "Mã số sinh viên in trên thẻ sinh viên kẹp trong ví là gì?",
    answerPlaceholder: "Nhập mã số sinh viên... (VD: B2105432)"
  },

  "find-2": {
    id: "find-2",
    title: "Sổ tay bìa da xanh kèm móc khóa",
    category: "Sách vở / Tài liệu",
    categoryIcon: "menu_book",
    location: "Khu giảng đường B1, Giảng đường 3",
    time: "Hôm nay, 08:45",
    storage: "Văn phòng Quản lý Giảng đường B1",
    status: "Chờ bàn giao",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwAuANaxWvnChrFVac0ee-gXZxCXsYRUA0uw3ZSfVu4Xes7cj2Q7TaevVD8aCcPuHKqnVEo-mF3LnKBQTw59gqCGJ-w732epbnzZjiFa2YYRk5G_5hbrtwCjlLno-YEBmEEZN_DW7KBOhG3iaJWh9siU8kePgXsbAoRk5l2NHirvXsyE9jAbLpaoxMlSQXp-eEPsdgrxKS6cHvaamlWgwc7Gv5a-SOeOSTUA8TyEWUkodeUx2XrqSo",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Sổ tay bìa da màu xanh lục đậm có cúc bấm kim loại và móc khóa acrylic gắn ở gáy sổ.",
    question: "Móc khóa gắn cùng sổ tay có hình nhân vật gì hoặc tên ghi ở trang đầu là gì?",
    answerPlaceholder: "Nhập đặc điểm móc khóa hoặc tên ghi trong sổ..."
  },

  "find-3": {
    id: "find-3",
    title: "Hộp tai nghe không dây trắng",
    category: "Thiết bị điện tử",
    categoryIcon: "headphones",
    location: "Thư viện Trung tâm CTU, Bàn học T2",
    time: "Hôm qua, 14:20",
    storage: "Bàn trực bảo vệ Thư viện Trung tâm CTU",
    status: "Đang giữ hộ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Hộp sạc tai nghe màu trắng, mặt sau có dán sticker nhỏ hình mèo, pin vẫn còn sáng đèn khi mở.",
    question: "Tên Bluetooth hiển thị khi mở nắp hoặc mô tả sticker dán ở mặt sau là gì?",
    answerPlaceholder: "Nhập tên Bluetooth của tai nghe hoặc mô tả sticker..."
  },

  "find-4": {
    id: "find-4",
    title: "Bình nước giữ nhiệt inox bạc 500ml",
    category: "Đồ dùng cá nhân",
    categoryIcon: "water_bottle",
    location: "Hội trường Rùa, Băng ghế chờ",
    time: "Hôm qua, 16:45",
    storage: "Văn phòng Đoàn Thanh niên - Hội trường Rùa",
    status: "Chờ liên hệ",
    mainPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Bình giữ nhiệt kim loại màu xám bạc inox 500ml có quai xách silicon màu đen, bỏ quên tại hàng ghế chờ Hội trường Rùa.",
    question: "Thương hiệu in trên thân bình hoặc màu sắc của nắp/quai xách là gì?",
    answerPlaceholder: "Nhập thương hiệu hoặc màu sắc quai xách bình..."
  },

  // =========================================================================
  // MẪU MẶC ĐỊNH CHO TRANG GHÉP NỐI (match-detail.html)
  // =========================================================================
  "match-default": {
    id: "match-default",
    title: "Ví da nam màu nâu - Tòa C1",
    category: "Ví da",
    categoryIcon: "wallet",
    location: "Khu II - Tòa C1 (Khoa CNTT&TT)",
    time: "10 phút trước (Hôm nay, 14:25)",
    storage: "Phòng Công tác Sinh viên (PCTSV) - Nhà điều hành",
    status: "Đã tiếp nhận PCTSV",
    mainPhoto: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    note: "Mình nhặt được chiếc ví màu nâu ở khu vực dãy bàn tự học Tầng 2 Thư viện (khu tự học máy lạnh). Trong ví có một số thẻ cá nhân và giấy tờ sinh viên, hiện đã chuyển giao bảo quản an toàn để tránh thất lạc.",
    question: "Mã số in trên thẻ sinh viên kẹp trong ví là gì?",
    answerPlaceholder: "Nhập chính xác mã số sinh viên... (VD: B2105432)"
  }
};
