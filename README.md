# Đồng hồ đếm ngược Cờ Tướng

Ứng dụng đồng hồ thi đấu Cờ Tướng dành cho hai kỳ thủ, chạy trên trình duyệt và hỗ trợ màn hình máy tính lẫn thiết bị di động.

**Dùng thử:** [https://chesscountdown.vercel.app/](https://chesscountdown.vercel.app/)

## Tính năng

- Đồng hồ riêng cho hai bên **Đỏ** và **Đen**; bên Đỏ đi trước.
- Bắt đầu, tạm dừng, tiếp tục và đặt lại ván đấu.
- Chạm vào đồng hồ của bên đang đi để kết thúc lượt và chuyển sang bên còn lại.
- Nhấn **Space** để bắt đầu khi đồng hồ chưa chạy hoặc chuyển lượt khi ván đang chạy.
- Hiển thị số nước đã đi của mỗi bên.
- Cài đặt thời gian ván đấu, giới hạn thời gian cho mỗi nước và số giây cộng thêm sau mỗi lượt. Giới hạn thời gian mỗi nước bằng `0` để tắt tính năng này.
- Báo kết quả khi hết thời gian ván đấu hoặc hết thời gian cho phép của một nước.
- Giao diện thích ứng với màn hình nhỏ và lớn; không cần cài đặt để sử dụng bản deploy.

Khi áp dụng cài đặt mới, đồng hồ và số nước đi được đặt lại, lượt đi trở về bên Đỏ và ván đấu chưa bắt đầu.

## Công nghệ

- React 18
- Vite
- Tailwind CSS
- Lucide React

## Chạy ứng dụng trên máy

Yêu cầu Node.js và npm. Từ thư mục `chess_countdown`, chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ được Vite hiển thị trong terminal (mặc định là `http://localhost:5173`).

## Build và xem thử bản build

```bash
npm run build
npm run preview
```

Các tệp build được tạo trong thư mục `dist`. Dự án sử dụng Vite; hiện không có script `npm start`.

## Cài đặt mặc định

| Tùy chọn | Mặc định | Ý nghĩa |
| --- | ---: | --- |
| Thời gian ván đấu | 15 phút mỗi bên | Tổng thời gian của mỗi kỳ thủ |
| Giới hạn thời gian mỗi nước | 0 giây | Bằng 0 nghĩa là không giới hạn |
| Thời gian cộng thêm | 5 giây | Cộng vào đồng hồ của bên vừa kết thúc lượt |
