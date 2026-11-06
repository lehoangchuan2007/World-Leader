# World Leader

Game chiến lược mô phỏng quản lý quốc gia.

## Giai đoạn 1 — Giao diện và bản đồ

Bản triển khai hiện tại tập trung đúng phạm vi Giai đoạn 1:

- Bản đồ chính trị thế giới 2D, mỗi quốc gia có màu riêng ổn định.
- Chọn quốc gia mà không tự động thay đổi góc nhìn bản đồ.
- Bảng thông tin quốc gia ở cạnh phải.
- Sau khi xác nhận chọn quốc gia, tải lớp ranh giới hành chính cấp 1 (ADM1) để xem tỉnh/bang.
- Chọn tỉnh/bang để xem bảng thông tin ở cạnh phải.
- Thanh tài nguyên chỉ xuất hiện sau khi bắt đầu với một quốc gia.
- Menu góc trên bên phải gồm Chính trị, Kinh tế, Quân sự, Ngoại giao, Công nghệ và Cài đặt.
- Hoàng Sa và Trường Sa được thể hiện bằng một đa giác định vị riêng cho mỗi quần đảo.
- Dữ liệu bản đồ và cấu hình nguồn dữ liệu được tách khỏi mã giao diện trong `src/data/mapSources.js`.

## Công nghệ

- Vite
- JavaScript ES modules
- Leaflet
- GeoJSON
- geoBoundaries (ADM1) và dữ liệu quốc gia geo-countries

## Chạy cục bộ

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```bash
npm install
npm run dev
```

Tạo bản build:

```bash
npm run build
npm run preview
```

## Nguồn dữ liệu bản đồ

- Quốc gia: [datasets/geo-countries](https://github.com/datasets/geo-countries)
- Tỉnh/bang ADM1: [geoBoundaries](https://www.geoboundaries.org/)

Bản đồ tỉnh/bang được tải theo quốc gia được chọn. Việc tải dữ liệu cần kết nối Internet. Mức độ sẵn có và tên thuộc tính ADM1 có thể khác nhau giữa các quốc gia.

## Ghi chú về dữ liệu quần đảo

Các đa giác Hoàng Sa và Trường Sa hiện là hình định vị minh họa phục vụ tương tác giao diện, không phải dữ liệu đo đạc hoặc ranh giới pháp lý. Cần thay bằng dữ liệu địa lý đã được kiểm chứng trước khi phát hành chính thức.

## Phạm vi

Các mục menu được dựng ở mức giao diện trong Giai đoạn 1; chức năng quản lý thuộc các giai đoạn tiếp theo và chưa được triển khai ở đây.