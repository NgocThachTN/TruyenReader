# TruyenReader

A modern, responsive manga reading web application built with React and TypeScript, utilizing the OTruyen API. This project was developed with the full-assistance of Gemini 3 Pro.

## Description

OTruyen Reader provides a seamless interface for users to discover, browse, and read manga. It fetches data dynamically from the OTruyen API, offering up-to-date content including new releases, ongoing series, and completed works. The application is designed with a focus on user experience, featuring multiple reading modes and a mobile-friendly layout.

## Features

- **Home Page**: Displays a featured banner, top manga, new releases, ongoing series, and completed comics.
- **Advanced Search**: Search for comics by title.
- **Category Browsing**: Browse comics by genre with support for pagination.
- **Filtering & Sorting**: Filter comics by status (Ongoing/Completed) and sort by date or name within categories.
- **Comic Details**: Comprehensive information view including synopsis, author, status, and chapter list.
- **Chapter Viewer**:
  - **Scroll Mode**: Continuous vertical scrolling.
  - **Single Page Mode**: Page-by-page viewing with keyboard navigation (Arrow keys).
  - **Quick Navigation**: Dropdown menu to jump between chapters instantly.
- **Responsive Design**: Optimized for both desktop and mobile devices, including a collapsible navigation menu.
- **PWA Support**: Install as an app on Android/iOS devices with offline caching capabilities.

## Technologies Used

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **API**: OTruyen API

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd otruyen-reader
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` (or the port shown in your terminal).

## PWA Installation (Progressive Web App)

### Cài đặt trên Android(For Vietnamese User):

1. Mở website trên trình duyệt Chrome, Edge, hoặc Samsung Internet
2. Nhấn vào menu (⋮) ở góc phải trên
3. Chọn **"Add to Home screen"** hoặc **"Thêm vào màn hình chính"**
4. Đặt tên cho ứng dụng và nhấn **"Add"**
5. Icon ứng dụng sẽ xuất hiện trên màn hình chính của bạn!

### Tính năng PWA:

-  Hoạt động offline với Service Worker
-  Cache thông minh cho API và hình ảnh
-  Chạy như ứng dụng native (không có thanh địa chỉ)
-  Tải trang nhanh hơn với caching
-  Tự động cập nhật khi có phiên bản mới

## Development

This project was created and refined using **Gemini 3 Pro**, an advanced AI model, to generate code, optimize components, and implement features such as the chapter viewer logic and responsive navigation. 
