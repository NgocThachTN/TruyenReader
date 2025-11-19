# Hướng dẫn cài đặt PWA (Progressive Web App)

## Đã hoàn thành ✅

1. ✅ Tạo file `manifest.webmanifest` với cấu hình PWA
2. ✅ Cấu hình `vite-plugin-pwa` trong `vite.config.ts`
3. ✅ Thêm meta tags PWA vào `index.html`
4. ✅ Cấu hình Service Worker với cache strategy

## Cần làm thêm 📝

### Tạo Icon cho ứng dụng

Bạn cần tạo các icon với các kích thước sau và đặt vào thư mục `public/`:

- icon-16x16.png
- icon-32x32.png
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Cách tạo icon:

#### Cách 1: Sử dụng công cụ online
1. Truy cập: https://realfavicongenerator.net/ hoặc https://www.pwabuilder.com/imageGenerator
2. Upload logo của bạn (khuyến nghị: 512x512px, nền trong suốt hoặc màu #0f172a)
3. Download tất cả icon và đặt vào thư mục `public/`

#### Cách 2: Sử dụng ImageMagick (command line)
Nếu bạn đã cài ImageMagick, chạy các lệnh sau:

```bash
# Từ một file logo gốc (logo.png)
magick logo.png -resize 16x16 public/icon-16x16.png
magick logo.png -resize 32x32 public/icon-32x32.png
magick logo.png -resize 72x72 public/icon-72x72.png
magick logo.png -resize 96x96 public/icon-96x96.png
magick logo.png -resize 128x128 public/icon-128x128.png
magick logo.png -resize 144x144 public/icon-144x144.png
magick logo.png -resize 152x152 public/icon-152x152.png
magick logo.png -resize 192x192 public/icon-192x192.png
magick logo.png -resize 384x384 public/icon-384x384.png
magick logo.png -resize 512x512 public/icon-512x512.png
```

## Cách cài đặt trên Android

### Chrome Mobile:
1. Mở website trên Chrome Android
2. Nhấn vào menu (⋮) ở góc phải trên
3. Chọn "Add to Home screen" hoặc "Thêm vào màn hình chính"
4. Đặt tên và nhấn "Add"
5. Icon ứng dụng sẽ xuất hiện trên màn hình chính

### Samsung Internet:
1. Mở website trên Samsung Internet
2. Nhấn vào menu (≡)
3. Chọn "Add page to" → "Home screen"
4. Xác nhận và icon sẽ xuất hiện trên màn hình chính

### Edge Mobile:
1. Mở website trên Edge Android
2. Nhấn vào menu (⋯)
3. Chọn "Add to phone" hoặc "Thêm vào điện thoại"
4. Làm theo hướng dẫn

## Tính năng PWA đã cấu hình

✨ **Offline Support**: Ứng dụng có thể hoạt động khi mất kết nối mạng

📦 **Cache Strategy**: 
- API calls: NetworkFirst (24 giờ cache)
- Images: CacheFirst (7 ngày cache)

🎨 **Standalone Display**: Ứng dụng chạy như ứng dụng native, không có thanh địa chỉ trình duyệt

🔄 **Auto Update**: Service Worker tự động cập nhật khi có phiên bản mới

⚡ **Fast Loading**: Assets được cache để tải nhanh hơn

## Kiểm tra PWA

Sau khi build và deploy:

1. Mở Chrome DevTools (F12)
2. Chuyển đến tab "Application" hoặc "Ứng dụng"
3. Kiểm tra:
   - Manifest: Xem thông tin manifest
   - Service Workers: Kiểm tra service worker đã đăng ký
   - Storage: Xem cache

## Build và Deploy

```bash
# Install dependencies nếu chưa cài
npm install

# Build cho production
npm run build

# Preview build
npm run preview
```

Sau khi deploy lên hosting (Vercel, Netlify, v.v.), PWA sẽ tự động hoạt động!

## Lưu ý

- PWA chỉ hoạt động với HTTPS (hoặc localhost trong dev)
- Service Worker cần thời gian để kích hoạt lần đầu
- Cache có thể cần xóa thủ công khi debug

