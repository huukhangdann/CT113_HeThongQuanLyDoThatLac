# Module Mascot Đồng Hành - CTU Lost & Found

Module nhân vật mascot tương tác theo dõi con trỏ chuột, dựa trên mã nguồn mở **[nilbuild/page-mascot](https://github.com/nilbuild/page-mascot)**.
Module này được thiết kế **hoàn toàn độc lập** trong thư mục `frontend/mascot/` để không làm ảnh hưởng đến mã nguồn chính của website.

---

## 1. Cấu trúc thư mục

```
frontend/mascot/
├── assets/                    # Chứa ảnh sprite sheets (.webp) 3x3 của các nhân vật
│   ├── ballerina-directions.webp
│   ├── ballerina-reactions.webp
│   ├── scout-directions.webp
│   ├── scout-reactions.webp
│   ├── cat-directions.webp
│   └── cat-reactions.webp
├── mascot.css                 # CSS riêng cho widget, bong bóng lời thoại và hiệu ứng đàn hồi
├── mascot.js                  # Engine tính góc chuột, sprite switcher & tương tác form
└── README.md                  # Hướng dẫn này
```

---

## 2. Cách nhúng vào bất kỳ trang nào (Ví dụ: `post-lost.html`)

Chỉ cần 3 bước cực kỳ đơn giản:

### Bước 1: Nhúng CSS vào thẻ `<head>`
```html
<link rel="stylesheet" href="../mascot/mascot.css" />
```

### Bước 2: Nhúng JS vào thẻ `<head>` hoặc trước `</body>`
```html
<script src="../mascot/mascot.js"></script>
```

### Bước 3: Đặt thẻ div tại nơi muốn hiển thị mascot
```html
<div id="ctu-mascot-app"></div>
```
Module sẽ **tự động kích hoạt** và hiển thị nhân vật Ballerina với đầy đủ tính năng!

---

## 3. Cách gỡ bỏ hoàn toàn khỏi dự án (Khi không muốn dùng nữa)

Nếu muốn gỡ bỏ chức năng mascot:
1. Mở file HTML (ví dụ `pages/post-lost.html`), xóa 3 dòng sau:
   - Thẻ `<link rel="stylesheet" href="../mascot/mascot.css" />`
   - Thẻ `<script src="../mascot/mascot.js"></script>`
   - Thẻ `<div id="ctu-mascot-app"></div>`
2. Xóa thư mục `frontend/mascot/`.

Toàn bộ trang web sẽ trở về nguyên bản 100% như trước đây, hoàn toàn không gây lỗi hay ảnh hưởng gì tới các tính năng khác!
