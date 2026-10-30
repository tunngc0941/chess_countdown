# ⏱️ Đồng Hồ Bấm Giờ Cờ Tướng (Xiangqi Chess Clock)

Ứng dụng web bấm giờ thi đấu Cờ Tướng trực quan, chính xác và hiện đại được xây dựng bằng **ReactJS** và **Tailwind CSS**. Hỗ trợ chơi trực tiếp trên di động hoặc máy tính bảng đặt giữa hai kỳ thủ.

---

## ✨ Tính Năng Nổi Bật

- **Tùy chỉnh thời gian linh hoạt (Setup Modal):**
  - **Thời gian ván đấu (Main time):** Đặt số phút cho mỗi bên (mặc định 15 phút, hỗ trợ các mốc chọn nhanh).
  - **Giới hạn thời gian mỗi nước (Move limit):** Đếm ngược số giây tối đa cho từng nước cờ (đặt về `0` nếu không áp dụng).
  - **Thời gian cộng dồn (Increment / Fischer delay):** Tự động cộng thêm giây thưởng sau khi người chơi hoàn thành nước đi.
- **Giao diện Á Đông hiện đại:**
  - Chia đôi màn hình cho hai bên **Đỏ** và **Đen**.
  - Hiển thị trực quan bên đang chạy giờ (hiệu ứng viền sáng, thanh trạng thái).
  - Bộ đếm số nước đi (Move counter) cho từng bên.
- **Thao tác nhanh & Tiện lợi:**
  - Chạm vào nửa màn hình của bên đang đi để kết thúc lượt và chuyển sang đối thủ.
  - Hỗ trợ phím tắt **Spacebar** trên máy tính để đổi lượt.
  - Thanh điều khiển trung tâm: Tạm dừng / Tiếp tục, Làm mới ván đấu (Reset), Mở cài đặt.
- **Độ chính xác cao:**
  - Tính toán chênh lệch thời gian dựa trên `timestamp` thực tế, không bị trôi lệch giờ khi chạy nền.
- **Tối giản:** Hoàn toàn không kèm hiệu ứng âm thanh theo yêu cầu.

---

## 🛠️ Công Nghệ Sử Dụng

- **ReactJS** (Hooks: `useState`, `useEffect`, `useRef`, `useCallback`)
- **Tailwind CSS** (Giao diện đáp ứng Responsive, Mobile-first)
- **Lucide React** hoặc SVG Icons thuần cho các nút chức năng

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- Node.js (phiên bản `>= 18.x`)
- npm, pnpm hoặc yarn

### 2. Cài đặt

```bash
# Clone hoặc tải mã nguồn về máy
git clone https://github.com/your-username/xiangqi-chess-clock.git
cd xiangqi-chess-clock

# Cài đặt các thư viện phụ thuộc
npm install
```

### 3. Khởi chạy ứng dụng

```bash
npm run dev
# hoặc
npm start
```

Truy cập vào địa chỉ `http://localhost:5173` (hoặc cổng hiển thị trên terminal) để bắt đầu sử dụng.

---

## ⚙️ Cấu Hình Mặc Định

| Tham số | Giá trị mặc định | Mô tả |
| :--- | :--- | :--- |
| **Main Time** | `15 phút` | Tổng thời gian của mỗi kỳ thủ khi bắt đầu |
| **Move Time Limit** | `0 giây` (Tắt) | Thời gian tối đa được phép suy nghĩ cho 1 nước |
| **Increment** | `5 giây` | Thời gian cộng thêm sau mỗi lần bấm đổi lượt |

---

## 📖 Cách Sử Dụng Trong Trận Đấu

1. Nhấp vào biểu tượng **Cài đặt (Bánh răng)** ở thanh giữa để thiết lập thời gian mong muốn.
2. Bên **Đỏ** (đi tiên) bắt đầu suy nghĩ, bấm **Bắt đầu** hoặc chạm vào màn hình để bắt đầu tính giờ.
3. Sau khi đi xong một nước cờ:
   - Kỳ thủ chạm vào nửa màn hình của mình (hoặc nhấn phím cách trên bàn phím).
   - Thời gian cộng thêm sẽ lập tức được cộng vào đồng hồ của người đó.
   - Lượt đi và đồng hồ sẽ tự động kích hoạt cho đối phương.
4. Trận đấu kết thúc khi đồng hồ của một bên đếm ngược về `00:00`.