/**
 * Dữ liệu phân cấp cho Bản đồ tương tác 3 cấp độ CTU Khu II
 * Tọa độ pctX, pctY tính theo % trên ảnh sơ đồ mới (ctu-campus-map.png, kích thước 1024x756)
 * Cấu trúc: Campus -> Buildings -> Floors -> Rooms -> Item
 * TUYỆT ĐỐI KHÔNG TẠO PING Ở BÃI XE (Chỉ định vị các Khoa, Trường, Viện, Nhà học đọc từ ảnh)
 */

const campusData = {
  campusId: "khu-2",
  campusName: "Khu II - Đại học Cần Thơ",
  imageSrc: "./ctu-campus-map.png",
  buildings: [
    {
      id: "c1",
      code: "C1",
      name: "Trường Công nghệ Thông tin & Truyền thông (Nhà C1)",
      shortName: "Khoa CNTT&TT",
      totalItems: 4,
      pctX: 52.5,
      pctY: 55.0,
      totalFloors: 5,
      floors: [
        {
          floorNumber: 5, name: "Tầng 5", itemsCount: 0,
          rooms: [
            { id: "c1-p501", name: "P.501", type: "class", col: 1, row: 1 },
            { id: "c1-p502", name: "P.502", type: "class", col: 2, row: 1 },
            { id: "c1-lab-ai", name: "Lab AI & Data", type: "lab", col: 3, row: 1 },
            { id: "c1-hl-5", name: "Hành lang", type: "hall", col: "1 / 4", row: 2 }
          ]
        },
        {
          floorNumber: 4, name: "Tầng 4", itemsCount: 1,
          rooms: [
            { id: "c1-p401", name: "P.401", type: "class", col: 1, row: 1 },
            { id: "c1-p402", name: "P.402", type: "class", col: 2, row: 1 },
            { id: "c1-p403", name: "P.403", type: "class", col: 3, row: 1 },
            { id: "c1-lab401", name: "Phòng Lab 401", type: "lab", col: 1, row: 2 },
            {
              id: "c1-lab402", name: "Phòng Lab 402", type: "lab", col: 2, row: 2,
              hasItem: true,
              item: {
                id: "find-1",
                title: "Ví da màu đen gấp đôi",
                category: "Ví tiền / Bóp da",
                time: "Hôm nay, 09:30",
                location: "Khoa CNTT&TT, Tầng 4, Lab 402",
                status: "Đang giữ hộ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtL_SjaI7GO6-5N7J12TlynqHnFP2EVglpRHEdfzQSuLCVmkUSyrnK_jaHwhgHC6ivNlNDuTIpjpgEvQ68USBKsJPN1V1y-H-qtY-0-IQ2cQnaCwPTkqPZ4fJsCFE_hhyT0Uw9A5tZUFnCEA1OTLYI6bSyenhUeIqGV_fp0aNHIyIZST_BbeBwvnek5n0XDsfgPcqs29rF0nvKFtjqpG1BJiE6WT0eOzBWTIp08C8kxtYXZ36Ew78y"
              }
            },
            { id: "c1-stairs-4", name: "Cầu thang", type: "stairs", col: 3, row: 2 }
          ]
        },
        {
          floorNumber: 3, name: "Tầng 3", itemsCount: 0,
          rooms: [
            { id: "c1-p301", name: "P.301", type: "class", col: 1, row: 1 },
            { id: "c1-p302", name: "P.302", type: "class", col: 2, row: 1 },
            { id: "c1-p303", name: "P.303", type: "class", col: 3, row: 1 },
            { id: "c1-hl-3", name: "Hành lang", type: "hall", col: "1 / 4", row: 2 }
          ]
        },
        {
          floorNumber: 2, name: "Tầng 2", itemsCount: 2,
          rooms: [
            { id: "c1-p201", name: "P.201", type: "class", col: 1, row: 1 },
            {
              id: "c1-p204", name: "P.204", type: "class", col: 2, row: 1,
              hasItem: true,
              item: {
                id: "find-2",
                title: "Balo laptop ASUS đen",
                category: "Sách vở / Balo",
                time: "Hôm nay, 10:15",
                location: "Khoa CNTT&TT, Tầng 2, P.204",
                status: "Đang giữ hộ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw"
              }
            },
            {
              id: "c1-lab-mmt", name: "Lab Mạng", type: "lab", col: 3, row: 1,
              hasItem: true,
              item: {
                id: "find-6",
                title: "Cáp sạc Type-C trắng",
                category: "Đồ điện tử",
                time: "Hôm qua, 14:00",
                location: "Khoa CNTT&TT, Tầng 2, Lab Mạng",
                status: "Chờ liên hệ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en"
              }
            },
            { id: "c1-stairs-2", name: "Cầu thang", type: "stairs", col: 1, row: 2 },
            { id: "c1-hl-2", name: "Hành lang", type: "hall", col: "2 / 4", row: 2 }
          ]
        },
        {
          floorNumber: 1, name: "Tầng 1 (Trệt)", itemsCount: 1,
          rooms: [
            {
              id: "c1-sanh", name: "Sảnh chính", type: "hall", col: "1 / 3", row: 1,
              hasItem: true,
              item: {
                id: "find-5",
                title: "Thẻ sinh viên B220xxxx",
                category: "Thẻ SV / Giấy tờ",
                time: "Hôm qua, 15:00",
                location: "Khoa CNTT&TT, Tầng 1, Sảnh chính",
                status: "Đang giữ hộ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en"
              }
            },
            { id: "c1-vp-khoa", name: "Văn phòng Khoa", type: "office", col: 3, row: 1 },
            { id: "c1-stairs-1", name: "Cầu thang", type: "stairs", col: 1, row: 2 },
            { id: "c1-bv", name: "Phòng Bảo vệ", type: "office", col: 2, row: 2 },
            { id: "c1-wc", name: "Khu vệ sinh", type: "stairs", col: 3, row: 2 }
          ]
        }
      ]
    },
    {
      id: "b1",
      code: "B1",
      name: "Nhà học B1",
      shortName: "Nhà B1",
      totalItems: 1,
      pctX: 47.5,
      pctY: 43.0,
      totalFloors: 3,
      floors: [
        {
          floorNumber: 3, name: "Tầng 3", itemsCount: 0,
          rooms: [
            { id: "b1-p301", name: "P.301-B1", type: "class", col: 1, row: 1 },
            { id: "b1-p302", name: "P.302-B1", type: "class", col: 2, row: 1 },
            { id: "b1-hl-3", name: "Hành lang", type: "hall", col: "1 / 3", row: 2 }
          ]
        },
        {
          floorNumber: 2, name: "Tầng 2", itemsCount: 0,
          rooms: [
            { id: "b1-p201", name: "P.201-B1", type: "class", col: 1, row: 1 },
            { id: "b1-p202", name: "P.202-B1", type: "class", col: 2, row: 1 },
            { id: "b1-hl-2", name: "Hành lang", type: "hall", col: "1 / 3", row: 2 }
          ]
        },
        {
          floorNumber: 1, name: "Tầng 1 (Trệt)", itemsCount: 1,
          rooms: [
            {
              id: "b1-gd3", name: "Giảng đường 3", type: "hall", col: "1 / 3", row: 1,
              hasItem: true,
              item: {
                id: "find-2",
                title: "Sổ tay bìa da xanh kèm móc khóa",
                category: "Sách vở / Tài liệu",
                time: "Hôm nay, 08:45",
                location: "Khu giảng đường B1, Giảng đường 3",
                status: "Chờ bàn giao",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw"
              }
            },
            { id: "b1-gd1", name: "Giảng đường 1", type: "class", col: 1, row: 2 },
            { id: "b1-gd2", name: "Giảng đường 2", type: "class", col: 2, row: 2 }
          ]
        }
      ]
    },
    {
      id: "tv",
      code: "TTHL",
      name: "Trung tâm học liệu (Thư viện)",
      shortName: "Trung tâm học liệu",
      totalItems: 1,
      pctX: 57.0,
      pctY: 80.7,
      totalFloors: 4,
      floors: [
        {
          floorNumber: 4, name: "Tầng 4", itemsCount: 0,
          rooms: [
            { id: "tv-p401", name: "Kho sách tham khảo", type: "class", col: "1 / 3", row: 1 }
          ]
        },
        {
          floorNumber: 3, name: "Tầng 3", itemsCount: 0,
          rooms: [
            { id: "tv-p301", name: "Phòng học nhóm", type: "class", col: 1, row: 1 },
            { id: "tv-p302", name: "Phòng đa phương tiện", type: "lab", col: 2, row: 1 }
          ]
        },
        {
          floorNumber: 2, name: "Tầng 2", itemsCount: 1,
          rooms: [
            {
              id: "tv-p201", name: "Khu bàn đọc tự do T2", type: "hall", col: "1 / 3", row: 1,
              hasItem: true,
              item: {
                id: "find-3",
                title: "Hộp tai nghe không dây trắng",
                category: "Thiết bị điện tử",
                time: "Hôm qua, 14:20",
                location: "Trung tâm học liệu CTU, Bàn học T2",
                status: "Đang giữ hộ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMGtnliRKncEmLOccvvngbz0u3tWpMZz8xzNuL-lq6pRKEbyWFj8lip2GytGWIWYq6TFW24N5aNiiSz7I4biZnv-4lWGRpwO-0zonFl84GuTqzskud8V0wG0vWkwWT9QacCpnpPGwG0HSGWPN2x2qhBRxKaE9gGrIJ7-2wYamqq4NAvZuPXmgPf0Fxad1mLGOJhQtffKX0u1uDwPTrGVpSJpGhb8J1hP-zx8Eh0fqW3zb1Dg0QVTw"
              }
            },
            { id: "tv-p202", name: "Quầy thủ thư T2", type: "office", col: 1, row: 2 },
            { id: "tv-stairs-2", name: "Cầu thang cuốn", type: "stairs", col: 2, row: 2 }
          ]
        },
        {
          floorNumber: 1, name: "Tầng 1 (Trệt)", itemsCount: 0,
          rooms: [
            { id: "tv-sanh", name: "Sảnh vào & Cửa từ", type: "hall", col: 1, row: 1 },
            { id: "tv-gui-do", name: "Khu gửi đồ tự động", type: "office", col: 2, row: 1 }
          ]
        }
      ]
    },
    {
      id: "c2",
      code: "C2",
      name: "Nhà học C2",
      shortName: "Nhà C2",
      totalItems: 1,
      pctX: 32.0,
      pctY: 64.8,
      totalFloors: 4,
      floors: [
        {
          floorNumber: 1, name: "Tầng 1 (Trệt)", itemsCount: 1,
          rooms: [
            { id: "c2-sanh", name: "Sảnh nhà C2", type: "hall", col: 1, row: 1 },
            {
              id: "c2-p102", name: "Phòng học 102-C2", type: "class", col: 2, row: 1,
              hasItem: true,
              item: {
                id: "find-c2",
                title: "Mũ bảo hiểm 3/4 màu xám",
                category: "Đồ dùng cá nhân",
                time: "Hôm qua, 17:30",
                location: "Nhà học C2, Trước P.102",
                status: "Chờ liên hệ",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80"
              }
            }
          ]
        }
      ]
    },
    {
      id: "rua",
      code: "HTR",
      name: "Hội trường Rùa",
      shortName: "HT Rùa",
      totalItems: 1,
      pctX: 40.0,
      pctY: 72.8,
      totalFloors: 2,
      floors: [
        {
          floorNumber: 2, name: "Tầng lửng", itemsCount: 0,
          rooms: [
            { id: "rua-lung", name: "Khán đài tầng lửng", type: "hall", col: "1 / 3", row: 1 }
          ]
        },
        {
          floorNumber: 1, name: "Tầng trệt", itemsCount: 1,
          rooms: [
            {
              id: "rua-sanh", name: "Băng ghế chờ tiền sảnh", type: "hall", col: "1 / 3", row: 1,
              hasItem: true,
              item: {
                id: "find-4",
                title: "Bình nước giữ nhiệt inox bạc 500ml",
                category: "Đồ dùng cá nhân",
                time: "Hôm qua, 16:45",
                location: "Hội trường Rùa, Băng ghế chờ",
                status: "Chờ liên hệ",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpdOuyKsYtvg9mAaVicAmfVTVepKtUBgVUHlvsIx1a6Pl5bcWe5Sy4ZslVX1Ya_XFiHra5FJF1LfhCMblxZgkU9xCtxZh03d_rxMaObOG70tNrNyjQUeOD705F_hW2JRkKd2UAlj32OrS5hwtcXy9JmNKZCqX_MJ8_hlQpEO2VZkfjtuDz3DIfABZFGS5xGQTgqfTxjqw7eBRmyyX3EIFIeO0YyLxmw6d_NkT-V9P2UoEZsKBjr_en"
              }
            },
            { id: "rua-san-khau", name: "Sân khấu trung tâm", type: "class", col: "1 / 3", row: 2 }
          ]
        }
      ]
    },
    {
      id: "mtn",
      code: "MTN",
      name: "Khoa Môi trường & Tài nguyên thiên nhiên",
      shortName: "Khoa Môi trường",
      totalItems: 0,
      pctX: 7.3,
      pctY: 46.3,
      totalFloors: 4,
      floors: []
    },
    {
      id: "gdtc",
      code: "GDTC",
      name: "Khoa Giáo dục Thể chất",
      shortName: "Khoa GD Thể chất",
      totalItems: 0,
      pctX: 54.5,
      pctY: 43.0,
      totalFloors: 2,
      floors: []
    },
    {
      id: "tdm",
      code: "TDM",
      name: "Nhà Thi đấu mới",
      shortName: "Nhà Thi đấu mới",
      totalItems: 0,
      pctX: 65.0,
      pctY: 39.0,
      totalFloors: 2,
      floors: []
    },
    {
      id: "cn",
      code: "CN",
      name: "Trường Bách khoa (Khoa Công Nghệ)",
      shortName: "Trường Bách khoa",
      totalItems: 0,
      pctX: 48.5,
      pctY: 27.8,
      totalFloors: 4,
      floors: []
    },
    {
      id: "ts",
      code: "TS",
      name: "Trường Thủy sản",
      shortName: "Trường Thủy sản",
      totalItems: 0,
      pctX: 34.2,
      pctY: 18.5,
      totalFloors: 3,
      floors: []
    },
    {
      id: "ktxb",
      code: "KTX-B",
      name: "Ký túc xá khu B",
      shortName: "KTX Khu B",
      totalItems: 0,
      pctX: 19.0,
      pctY: 18.5,
      totalFloors: 5,
      floors: []
    },
    {
      id: "dbscl",
      code: "DBSCL",
      name: "Viện Nghiên cứu Phát triển ĐBSCL",
      shortName: "Viện NC ĐBSCL",
      totalItems: 0,
      pctX: 21.0,
      pctY: 34.5,
      totalFloors: 3,
      floors: []
    },
    {
      id: "sh_tp",
      code: "SH-TP",
      name: "Viện CN Sinh học và Thực phẩm",
      shortName: "Viện CNSH&TP",
      totalItems: 0,
      pctX: 32.2,
      pctY: 33.7,
      totalFloors: 3,
      floors: []
    },
    {
      id: "rlc",
      code: "RLC",
      name: "Tòa nhà Khu phức hợp phòng thí nghiệm",
      shortName: "Tòa RLC",
      totalItems: 0,
      pctX: 38.1,
      pctY: 33.0,
      totalFloors: 4,
      floors: []
    },
    {
      id: "nn",
      code: "NN",
      name: "Trường Nông nghiệp",
      shortName: "Trường Nông nghiệp",
      totalItems: 0,
      pctX: 35.0,
      pctY: 49.6,
      totalFloors: 4,
      floors: []
    },
    {
      id: "kh",
      code: "KH",
      name: "Khoa Khoa học Tự nhiên",
      shortName: "Khoa KHTN",
      totalItems: 0,
      pctX: 62.5,
      pctY: 58.2,
      totalFloors: 4,
      floors: []
    },
    {
      id: "kt",
      code: "KT",
      name: "Trường Kinh tế",
      shortName: "Trường Kinh tế",
      totalItems: 0,
      pctX: 75.0,
      pctY: 52.9,
      totalFloors: 4,
      floors: []
    },
    {
      id: "mt",
      code: "MT",
      name: "Khoa Khoa học Chính trị",
      shortName: "Khoa KH Chính trị",
      totalItems: 0,
      pctX: 76.0,
      pctY: 63.5,
      totalFloors: 4,
      floors: []
    },
    {
      id: "ktxa",
      code: "KTX-A",
      name: "Ký túc xá khu A",
      shortName: "KTX Khu A",
      totalItems: 0,
      pctX: 77.0,
      pctY: 33.0,
      totalFloors: 5,
      floors: []
    },
    {
      id: "db",
      code: "DB",
      name: "Khoa Dự bị Dân tộc",
      shortName: "Khoa Dự bị Dân tộc",
      totalItems: 0,
      pctX: 23.0,
      pctY: 64.1,
      totalFloors: 3,
      floors: []
    },
    {
      id: "sp",
      code: "SP",
      name: "Khoa Sư phạm",
      shortName: "Khoa Sư phạm",
      totalItems: 0,
      pctX: 28.5,
      pctY: 65.5,
      totalFloors: 4,
      floors: []
    },
    {
      id: "kl",
      code: "KL",
      name: "Khoa Luật",
      shortName: "Khoa Luật",
      totalItems: 0,
      pctX: 36.5,
      pctY: 79.5,
      totalFloors: 3,
      floors: []
    },
    {
      id: "ttnn",
      code: "TTNN",
      name: "Trung tâm Ngoại ngữ",
      shortName: "TT Ngoại ngữ",
      totalItems: 0,
      pctX: 36.5,
      pctY: 84.0,
      totalFloors: 2,
      floors: []
    },
    {
      id: "atl",
      code: "ATL",
      name: "Tòa nhà Công nghệ cao",
      shortName: "Tòa ATL",
      totalItems: 0,
      pctX: 43.0,
      pctY: 80.7,
      totalFloors: 4,
      floors: []
    },
    {
      id: "d2",
      code: "D2",
      name: "Nhà học D2",
      shortName: "Nhà D2",
      totalItems: 0,
      pctX: 52.0,
      pctY: 71.4,
      totalFloors: 3,
      floors: []
    },
    {
      id: "dh",
      code: "DH",
      name: "Nhà điều hành",
      shortName: "Nhà điều hành",
      totalItems: 0,
      pctX: 52.5,
      pctY: 75.4,
      totalFloors: 5,
      floors: []
    },
    {
      id: "d1",
      code: "D1",
      name: "Nhà học D1",
      shortName: "Nhà D1",
      totalItems: 0,
      pctX: 52.5,
      pctY: 80.0,
      totalFloors: 3,
      floors: []
    },
    {
      id: "a3",
      code: "A3",
      name: "Nhà học A3",
      shortName: "Nhà A3",
      totalItems: 0,
      pctX: 64.0,
      pctY: 79.4,
      totalFloors: 3,
      floors: []
    },
    {
      id: "xh",
      code: "XH",
      name: "Khoa Khoa học Xã hội và Nhân văn",
      shortName: "Khoa KHXH&NV",
      totalItems: 0,
      pctX: 74.0,
      pctY: 80.7,
      totalFloors: 4,
      floors: []
    }
  ]
};

// Xuất biến toàn cục dùng chung cho cả map/index.html và pages/match-detail.html
window.campusData = campusData;
