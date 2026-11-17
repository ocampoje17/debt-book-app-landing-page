# Debt Book Z — Trang giới thiệu ứng dụng (Landing Page)

Trang giới thiệu chính thức cho ứng dụng **Debt Book Z**, được thiết kế theo đúng phong cách thị giác và ngôn ngữ thiết kế của ứng dụng (Warm Minimalism, Soft Editorial UI, thẻ bo góc lớn, điểm nhấn vàng chanh).

## Đặc điểm nổi bật của trang

- **Phong cách đồng nhất**: Sử dụng cùng hệ màu với app (nền ấm `#E2E2DA`, card trắng `#FDFFFE`, nút pill màu đen `#101211`, màu nhấn vàng chanh `#EDEF5D`, hỗ trợ cả chế độ Sáng và Tối).
- **Trải nghiệm tương tác chân thực**: Mô phỏng màn hình điện thoại với 4 tab giao diện thực tế (Tổng quan, Sổ nợ, Vay ngân hàng, Báo cáo).
- **Công cụ tính lãi vay trực quan**: Cho phép người dùng tính thử lịch trả góp hàng tháng theo công thức ngân hàng chuẩn (trả đều hoặc dư nợ giảm dần).
- **Nội dung thân thiện, không lộ kỹ thuật**: Dành cho người dùng phổ thông, giải thích rõ các lợi ích thực tế và cam kết bảo vệ dữ liệu cá nhân.
- **An toàn và bảo mật**:
  - Tích hợp Content Security Policy (CSP).
  - Tất cả liên kết ngoài đều có thuộc tính `rel="noopener noreferrer"`.
  - Không sử dụng thư viện cồng kềnh, không lưu trữ token hoặc dữ liệu nhạy cảm.
  - Sử dụng đường dẫn tương đối (`./`), sẵn sàng triển khai ngay lên GitHub Pages.

## Cấu trúc thư mục

```text
debt-book-app-landing-page/
├── assets/             # Biểu tượng và tài nguyên ảnh
│   ├── app_icon.png
│   ├── favicon.png
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── style.css       # Hệ thống định kiểu theo Design System của Debt Book Z
├── js/
│   ├── main.js         # Xử lý giao diện sáng/tối, chuyển tab màn hình và máy tính lãi
│   └── translations.js # Từ điển đa ngôn ngữ (9 ngôn ngữ)
├── index.html          # Trang chủ giới thiệu tính năng và trải nghiệm
├── privacy.html        # Trang Chính sách quyền riêng tư độc lập
├── terms.html          # Trang Điều khoản sử dụng độc lập
└── README.md
```

## Cách xem thử trên máy tính (Local Preview)

Bạn có thể xem trang bằng bất kỳ cách nào sau đây:

1. **Mở trực tiếp**: Nhấp đúp vào tệp `index.html` để mở trong trình duyệt Chrome, Edge hoặc Firefox.
2. **Sử dụng máy chủ cục bộ (Python)**:
   ```sh
   python -m http.server 8080
   ```
   Sau đó mở trình duyệt tại địa chỉ `http://localhost:8080`.
3. **Sử dụng Node.js (npx)**:
   ```sh
   npx serve .
   ```

## Triển khai GitHub Pages

- Repository: https://github.com/ocampoje17/debt-book-app-landing-page
- Địa chỉ chính thức: https://debt-book-z.laychu.com
- Nguồn xuất bản: nhánh `main`, thư mục `/(root)`.
- File `.nojekyll` cho phép phục vụ trực tiếp các tài nguyên tĩnh.
- File `CNAME` giữ tên miền `debt-book-z.laychu.com` khi cập nhật trang.
- Cloudflare DNS: bản ghi CNAME `debt-book-z` trỏ đến `ocampoje17.github.io`, chế độ DNS only.

Để cập nhật trang, commit và push thay đổi lên `main`; GitHub Pages sẽ tự xuất bản lại.
Chỉ repository landing page được công khai. Không đưa khóa ký ứng dụng, thông tin xác thực,
file `.env`, hay dữ liệu Google Play vào repository; `.gitignore` loại trừ các tệp cục bộ này.
